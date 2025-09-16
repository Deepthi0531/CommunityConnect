const express = require('express');
const router = express.Router();
const cors = require('cors');  // Optional if you want cors per route

const { registerVolunteer } = require("../controllers/volunteerController");  // Use destructuring
const authMiddleware = require("../middleware/authMiddleware");

// router.use(cors());

router.post('/register', authMiddleware, registerVolunteer);

router.get('/', (req, res) => {
  res.send("Volunteer route working");
});


module.exports = router;
