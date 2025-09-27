const User = require('../models/userModel');
const Settings = require('../models/settingsModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 */
const registerUser = (req, res) => {
    const { name, email, role, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    User.findByEmail(email, (err, userExists) => {
        if (err) {
            return res.status(500).json({ message: 'Server Error' });
        }
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: 'Password hashing error' });
            }

            const newUser = { name, email, role: role || 'user', password: hashedPassword };

            User.create(newUser, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Could not create user', error: err.sqlMessage || err.message });
                }
                res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
            });
        });
    });
};

/**
 * @desc    Authenticate a user and get token
 * @route   POST /api/users/login
 */
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
            res.json({ token });
        });
    });
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 */
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

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 */
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

/**
 * @desc    Get combined user profile and settings
 * @route   GET /api/users/settings
 */
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

/**
 * @desc    Update user account info (name, phone, profile pic)
 * @route   PUT /api/users/settings/account
 */
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

/**
 * @desc    Update user password
 * @route   PUT /api/users/settings/password
 */
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

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/users/settings/notifications
 */
const updateNotificationSettings = (req, res) => {
    Settings.update(req.user.id, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to update settings' });
        res.json({ message: 'Notification settings updated' });
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
};