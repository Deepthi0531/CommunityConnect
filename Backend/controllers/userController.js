const User = require('../models/userModel');
const Settings = require('../models/settingsModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Register user
const registerUser = (req, res) => {
  const { name, email, role, password, phone, latitude, longitude } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please provide name, email, phone, and password' });
  }

  const lat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 0.0;
  const lon = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 0.0;

  console.log('Received phone:', phone);
  console.log('Received latitude:', latitude);
  console.log('Received longitude:', longitude);

  User.findByEmail(email, (err, userExists) => {
    if (err) {
      console.error('Find user by email error:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Password hashing error:', err);
        return res.status(500).json({ message: 'Password hashing error' });
      }

      const newUser = {
        name,
        email,
        phone,
        role: role || 'user',
        password: hashedPassword,
        latitude: lat,
        longitude: lon,
      };

      User.create(newUser, (err, result) => {
        if (err) {
          console.error('User creation failed:', err);
          return res.status(500).json({ message: 'Could not create user', error: err.sqlMessage || err.message });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
      });
    });
  });
};

// Login user and return JWT
const loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  User.findByEmail(email, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url
      }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      });
    });
  });
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      User.findById(req.user.id, (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("SERVER ERROR IN getUserProfile:", error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const updatedData = req.body;
    const result = await new Promise((resolve, reject) => {
      User.update(req.user.id, updatedData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error("SERVER ERROR IN updateUserProfile:", error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get combined user profile and settings
const getUserSettings = (req, res) => {
  User.getSettingsByUserId(req.user.id, (err, settings) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found for user' });
    }
    res.json(settings);
  });
};

// Update user account info (name, phone, profile pic)
const updateAccountSettings = (req, res) => {
  const { name, phone } = req.body;
  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }
  User.updateAccount(req.user.id, { name, phone, profile_image_url: imageUrl }, (err, result) => {
    if (err) {
      if (req.file) fs.unlink(req.file.path, () => {}); // Clean up uploaded file on error
      return res.status(500).json({ message: 'Failed to update account' });
    }
    res.json({ message: 'Account info updated!', imageUrl });
  });
};

// Update user password
const updatePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  User.findById(req.user.id, (err, user) => {
    if (err || !user) return res.status(500).json({ message: 'User not found' });

    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ message: 'Incorrect current password' });

      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        User.updatePassword(req.user.id, hashedPassword, (err, result) => {
          if (err) return res.status(500).json({ message: 'Failed to update password' });
          res.json({ message: 'Password updated successfully' });
        });
      });
    });
  });
};

// Update user notification preferences
const updateNotificationSettings = (req, res) => {
  Settings.update(req.user.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update settings' });
    res.json({ message: 'Notification settings updated' });
  });
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await new Promise((resolve, reject) => {
            User.findByEmail(email, (err, user) => err ? reject(err) : resolve(user));
        });

        if (!user) {
            return res.status(404).json({ message: 'User with that email not found.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await new Promise((resolve, reject) => {
            User.saveResetToken(email, token, expires, (err, result) => err ? reject(err) : resolve(result));
        });

        // --- OAuth 2.0 Setup ---
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground" // Redirect URI
        );

        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        
        const mailOptions = {
            from: `CommunityConnect <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please click the following link to reset your password: http://${req.headers.host}/reset-password.html?token=${token}`,
            html: `<p>Please click the following link to reset your password: <a href="http://${req.headers.host}/reset-password.html?token=${token}">Reset Password</a></p>`,
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'An email has been sent with further instructions.' });

    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ message: 'Error processing request.' });
    }
};

const resetPassword = (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    User.findByResetToken(token, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password and save it
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            User.updatePasswordAndClearToken(user.id, hashedPassword, (err, result) => {
                if (err) return res.status(500).json({ message: 'Error updating password.' });
                res.status(200).json({ message: 'Password has been updated successfully.' });
            });
        });
    });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateAccountSettings,
  updatePassword,
  updateNotificationSettings,
  forgotPassword,
  resetPassword,
};
