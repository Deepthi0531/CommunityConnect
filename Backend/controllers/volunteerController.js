// In Backend/controllers/volunteerController.js
const Volunteer = require('../models/volunteerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

// Promisify model functions and bind the correct 'this' context
const createVolunteerAsync = util.promisify(Volunteer.create).bind(Volunteer);
const findOneByEmailAsync = util.promisify(Volunteer.findOneByEmail).bind(Volunteer);

const registerVolunteer = async (req, res) => {
  try {
    const { name, email, phone, password, availability, skills, latitude, longitude } = req.body;

    if (!name || !email || !phone || !password || !availability || !skills) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const existingVolunteer = await findOneByEmailAsync(email);
    if (existingVolunteer) {
      return res.status(409).json({ message: 'A volunteer with this email already exists.' });
    }

    // --- NEW: Hash the password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    const volunteerData = {
      name,
      email,
      phone,
      password: hashedPassword,
      availability,
      skills,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    const result = await createVolunteerAsync(volunteerData);
    res.status(201).json({ message: 'Volunteer registration successful!', volunteerId: result.insertId });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginVolunteer = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Use the findOneByEmail function you already have in your model
    Volunteer.findOneByEmail(email, (err, volunteer) => {
        if (err || !volunteer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // We must compare the password
        // IMPORTANT: This assumes your volunteer registration is hashing passwords.
        // If it's not, you must add hashing to your registerVolunteer function.
        bcrypt.compare(password, volunteer.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create a token (You can add more info to the payload)
            const token = jwt.sign({
                id: volunteer.id, 
                name: volunteer.name, 
                email: volunteer.email,
                role: 'volunteer' // Good to add a role
            }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });
            
            res.json({ token });
        });
    });
};

module.exports = { registerVolunteer,loginVolunteer };