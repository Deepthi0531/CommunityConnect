// In Backend/controllers/volunteerController.js
const Volunteer = require('../models/volunteerModel');
const util = require('util');

// Promisify model functions and bind the correct 'this' context
const createVolunteer = util.promisify(Volunteer.create).bind(Volunteer);
const findOneByEmail = util.promisify(Volunteer.findOneByEmail).bind(Volunteer);

const registerVolunteer = async (req, res) => {
  try {
    const { name, email, phone, availability, skills, latitude, longitude } = req.body;

    if (!name || !email || !phone || !availability || !skills) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingVolunteer = await findOneByEmail(email);
    if (existingVolunteer) {
      return res.status(409).json({ message: 'A volunteer with this email already exists.' });
    }

    const volunteerData = {
      name,
      email,
      phone,
      availability,
      skills,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    const result = await createVolunteer(volunteerData);
    res.status(201).json({ message: 'Volunteer registration successful!', volunteerId: result.insertId });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerVolunteer };