require('dotenv').config();
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "set" : "NOT SET");
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);


const Emergency = require('../models/emergencyModel');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;


const client = twilio(accountSid, authToken);



// Utility function to validate E.164 phone number format (basic)
const isValidPhone = (phone) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

// POST /api/emergency/alert
// Body: { emergencyType, latitude, longitude }
const alertEmergency = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT auth middleware
    const { emergencyType, latitude, longitude } = req.body;

    // Validate presence and types of latitude and longitude
    if (
      !emergencyType || 
      typeof latitude !== 'number' || isNaN(latitude) || 
      typeof longitude !== 'number' || isNaN(longitude)
    ) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    // Debug logging input coordinates and emergency type
    console.log(`Emergency alert received: type=${emergencyType}, lat=${latitude} (${typeof latitude}), lon=${longitude} (${typeof longitude})`);

    // Find nearby users and volunteers within 5km radius
    const nearbyUsers = await Emergency.findNearbyUsers(latitude, longitude, 5);
    const nearbyVolunteers = await Emergency.findNearbyVolunteers(latitude, longitude, 5);

    console.log(`Found ${nearbyUsers.length} nearby users and ${nearbyVolunteers.length} volunteers`);

    // Compose SMS message
    const message = `Emergency Alert: ${emergencyType} reported nearby. Please respond if available.`;

    // Send SMS to nearby users
    for (const user of nearbyUsers) {
      if (user.phone && isValidPhone(user.phone)) {
        try {
          await client.messages.create({
            body: message,
            from: twilioNumber,
            to: user.phone,
          });
        } catch (err) {
          console.error(`Failed to send SMS to user ${user.id} (${user.phone}):`, err.message);
        }
      } else {
        console.warn(`Skipping user ${user.id} due to invalid or missing phone: ${user.phone}`);
      }
    }
    

    // Send SMS and optionally calls to nearby volunteers
    for (const volunteer of nearbyVolunteers) {
      if (volunteer.phone && isValidPhone(volunteer.phone)) {
        try {
          await client.messages.create({
            body: `[VOLUNTEER] ${message}`,
            from: twilioNumber,
            to: volunteer.phone,
          });
          
          // Place automated call for critical emergencies if enabled
          if (['Fire', 'Rescue'].includes(emergencyType)) {
            await client.calls.create({
              url: 'https://handler.twilio.com/twiml/EH4222d2d299bd5649bda7509c9b4d4dd0', // TwiML instructions URL
              from: twilioNumber,
              to: volunteer.phone,
            });
          }
        } catch (err) {
          console.error(`Failed to notify volunteer ${volunteer.id} (${volunteer.phone}):`, err.message);
        }
      } else {
        console.warn(`Skipping volunteer ${volunteer.id} due to invalid or missing phone: ${volunteer.phone}`);
      }
    }
    

    res.json({
      message: 'Emergency alerts sent',
      nearbyUsersCount: nearbyUsers.length,
      nearbyVolunteersCount: nearbyVolunteers.length,
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ message: 'Server error sending emergency alerts' });
  }
};

module.exports = {
  alertEmergency,
};
