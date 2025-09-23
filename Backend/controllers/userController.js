const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, role, password, latitude, longitude } = req.body;

    if (!name || !email || !password || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide name, email, password, latitude, and longitude' });
    }

    const userExists = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      role: role || 'user',
      password: hashedPassword,
      latitude,
      longitude,
    };

    const result = await new Promise((resolve, reject) => {
      User.create(newUser, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & return token
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) reject(err);
        resolve(user);
      });
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '30d',
    });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      latitude: user.latitude,
      longitude: user.longitude,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
