const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
