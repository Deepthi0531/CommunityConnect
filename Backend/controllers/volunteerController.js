// const Volunteer = require('../models/volunteerModel'); // raw SQL model

// // Promisify callback functions
// const createVolunteer = (volunteerData) =>
//   new Promise((resolve, reject) =>
//     Volunteer.create(volunteerData, (err, result) => (err ? reject(err) : resolve(result)))
//   );

// const findVolunteerByEmail = (email) =>
//   new Promise((resolve, reject) =>
//     Volunteer.findOneByEmail(email, (err, volunteer) => (err ? reject(err) : resolve(volunteer)))
//   );

// const registerVolunteer = async (req, res) => {
//   try {
//     const { name, email, phone, availability, skills, latitude, longitude } = req.body;

//     if (!name || !email || !phone || !availability || !skills) {
//       return res.status(400).json({ message: 'Please provide all required fields.' });
//     }

//     const existingVolunteer = await findVolunteerByEmail(email);
//     if (existingVolunteer) {
//       return res.status(409).json({ message: 'A volunteer with this email already exists.' });
//     }

//     const latValue = latitude && latitude !== '' ? latitude : null;
//     const lngValue = longitude && longitude !== '' ? longitude : null;

//     const result = await createVolunteer({
//       name,
//       email,
//       phone,
//       availability,
//       skills,
//       latitude: latValue,
//       longitude: lngValue,
//     });

//     res.status(201).json({
//       message: 'Volunteer registration successful!',
//       data: { id: result.insertId, ...req.body },
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

// module.exports = { registerVolunteer };

const Volunteer = require('../models/volunteerModel');
const util = require('util');

// Promisify callback functions for async-await
const createVolunteer = util.promisify(Volunteer.create);
const findOneByEmail = util.promisify(Volunteer.findOneByEmail);

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
    res.status(201).json({ message: 'Volunteer registration successful!', data: result });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Your existing function here...

module.exports = { registerVolunteer };
