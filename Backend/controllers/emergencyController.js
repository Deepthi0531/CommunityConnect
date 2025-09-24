const Emergency = require('../models/emergencyModel');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// POST /api/emergency/alert
// Body: { emergencyType, latitude, longitude }
const alertEmergency = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT auth middleware
    const { emergencyType, latitude, longitude } = req.body;

    if (!emergencyType || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find nearby users and volunteers within 5km radius
    const nearbyUsers = await Emergency.findNearbyUsers(latitude, longitude, 5);
    const nearbyVolunteers = await Emergency.findNearbyVolunteers(latitude, longitude, 5);

    // Compose SMS message
    const message = `Emergency Alert: ${emergencyType} reported nearby. Please respond if available.`;

    // Send SMS to nearby users
    for (const user of nearbyUsers) {
      if (user.phone) {
        try {
          await client.messages.create({
            body: message,
            from: twilioNumber,
            to: user.phone,
          });
        } catch (err) {
          console.error(`Failed to send SMS to user ${user.id}:`, err.message);
        }
      }
    }

    // Send SMS and optionally calls to nearby volunteers
    for (const volunteer of nearbyVolunteers) {
      if (volunteer.phone) {
        try {
          await client.messages.create({
            body: `[VOLUNTEER] ${message}`,
            from: twilioNumber,
            to: volunteer.phone,
          });

          // Optional: Place automated call for critical emergencies
          // Comment/uncomment as needed
          if (['Fire', 'Rescue'].includes(emergencyType)) {
            await client.calls.create({
              url: 'https://your-twiml-url.com/emergency-call.xml', // TwiML instructions
              from: twilioNumber,
              to: volunteer.phone,
            });
          }
        } catch (err) {
          console.error(`Failed to notify volunteer ${volunteer.id}:`, err.message);
        }
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
