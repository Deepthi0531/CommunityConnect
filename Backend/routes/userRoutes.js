const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route for registration
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

router.get('/settings', protect, userController.getUserSettings);
router.put('/settings/account', protect, upload.single('profile_image'), userController.updateAccountSettings);
router.put('/settings/password', protect, userController.updatePassword);
router.put('/settings/notifications', protect, userController.updateNotificationSettings);

module.exports = router;