const User = require('../models/userModel');
const Settings = require('../models/settingsModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();


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
const loginUser = async(req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Removed the '|| 'hash'' fallback for security
  // --- End of relevant admin login variables ---

  // Check if admin login
  if (email === ADMIN_EMAIL) {
    if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === 'hash') {
       console.error("ADMIN_PASSWORD_HASH is not configured correctly in .env");
       return res.status(500).json({ message: 'Admin setup error: Password hash missing.' });
    }

    try {
      // bcrypt.compare checks the plain text password against the stored hash
      const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH); 

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      
      const token = jwt.sign(
        { id: 'admin_id', email: ADMIN_EMAIL, name: 'Admin', role: 'admin' }, // Added role for better token data
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '30d' }
      );
      
      return res.json({
        _id: 'admin_id',
        name: 'Admin',
        email: ADMIN_EMAIL,
        token,
        redirectUrl: 'http://localhost:5000/admin.html',
      });
    } catch (error) {
      console.error('Server error during admin login comparison:', error);
      return res.status(500).json({ message: 'Server error during admin login' });
    }
  }

// CHANGE 'your_admin_password_here' to the password you want for your admin login
const adminPassword = 'admin@123'; 

bcrypt.hash(adminPassword, 10)
  .then(hash => {
    console.log('--- Copy this hash and paste it into ADMIN_PASSWORD_HASH in your .env file ---');
    console.log(hash);
    console.log('-------------------------------------------------------------------------------');
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });

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
const forgotPassword = (req, res) => {
    const { email } = req.body;
    User.findByEmail(email, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: 'User with that email not found.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        User.saveResetToken(email, token, expires, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error saving reset token.' });

            // This simpler transporter uses your new App Password
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL_USER,
                subject: 'CommunityConnect Password Reset',
                text: `Click this link to reset your password: http://${req.headers.host}/reset-password.html?token=${token}`,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('Email sending error:', err);
                    return res.status(500).json({ message: 'Error sending email.' });
                }
                res.status(200).json({ message: 'An email has been sent with further instructions.' });
            });
        });
    });
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



 // replace with actual bcrypt hash



  

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
