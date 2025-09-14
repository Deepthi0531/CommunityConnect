const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
router.post('/create', auth, requestController.createRequest);

// Route for registration
router.post('/register', userController.registerUser);

// Route for login
router.post('/login', userController.loginUser);

module.exports = router;