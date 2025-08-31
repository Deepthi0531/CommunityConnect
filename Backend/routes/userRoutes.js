const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for registration
router.post('/register', userController.registerUser);

// Route for login
router.post('/login', userController.loginUser);

module.exports = router;