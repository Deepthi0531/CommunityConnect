const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        role: role || 'user',
        password: hashedPassword,
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
    if (err) {
      console.error('Find user error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Password comparison error:', err);
        return res.status(500).json({ message: 'Server error during password comparison' });
      }
      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          process.env.JWT_SECRET || 'your_jwt_secret', 
          { expiresIn: '30d' }
        );

        res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          token: token,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
};

module.exports = {
  registerUser,
  loginUser,
};