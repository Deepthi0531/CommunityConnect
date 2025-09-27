const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route for registration
router.post('/register', userController.registerUser);

// Route for login
router.post('/login', userController.loginUser);

router.get('/profile', protect, userController.getUserProfile);

router.put('/profile', protect, userController.updateUserProfile);

module.exports = router;