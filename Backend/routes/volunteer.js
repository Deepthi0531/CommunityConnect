const express = require('express');
const router = express.Router();
const { registerVolunteer } = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware"); // Use destructuring


router.post('/register', registerVolunteer);

router.get('/', (req, res) => {
  res.send("Volunteer route working");
});

module.exports = router;