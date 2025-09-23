const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware'); // JWT auth middleware

// Protect route => only logged-in users
router.post('/alert', protect, emergencyController.alertEmergency);

module.exports = router;
