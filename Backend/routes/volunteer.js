const express = require('express');
const router = express.Router();
const { registerVolunteer } = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware"); // Use destructuring
const volunteerController = require('../controllers/volunteerController');

router.post('/register', registerVolunteer);
router.post('/login', volunteerController.loginVolunteer);
router.get('/', (req, res) => {
  res.send("Volunteer route working");
});

module.exports = router;