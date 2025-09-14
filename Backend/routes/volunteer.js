const { registerVolunteer } = require('./controllers/volunteerController'); // corrected path
const authMiddleware = require("./middleware/authMiddleware");



app.use(cors());
app.use(bodyParser.json());

// Protect volunteer registration route
app.post('/api/volunteer/register', authMiddleware, registerVolunteer);
const express = require('express');
const router = express.Router();

router.post('/register', authMiddleware, registerVolunteer);

module.exports = router;
