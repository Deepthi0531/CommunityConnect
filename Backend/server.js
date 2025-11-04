const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import all route files
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requests');
const volunteerRoutes = require('./routes/volunteer');
const emergencyRoutes = require('./routes/emergencyRoutes');
const db = require("./config/db");


const Request = require('./models/requestModel');
const Volunteer = require('./models/volunteerModel');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"]
    }
});
app.set('io', io);
io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);
    socket.on('join-room', (userId) => {
        socket.join(String(userId));
        console.log(`User ${userId} joined their private room.`);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    socket.on('request-accepted', (data) => {
        const { requestId, volunteerId } = data;
        
        // 1. Assign volunteer to the request in the DB
        Request.assignVolunteer(requestId, volunteerId, (err, result) => {
            if (err || result.affectedRows === 0) {
                console.error("Failed to assign volunteer:", err);
                return;
            }

            // 2. Get the request details (we need the original user's ID)
            Request.getById(requestId, (err, request) => {
                if (err || !request) return;
                const originalUserId = String(request.user_id);
                // 3. Get the volunteer's details to send to the user
                Volunteer.findById(volunteerId, (err, volunteer) => {
                    if (err || !volunteer) return;
                    
                    // 4. Notify the original user that their request was accepted
                    io.to(originalUserId).emit('your-request-accepted', {
                        requestId: requestId,
                        volunteer: {
                            name: volunteer.name,
                            phone: volunteer.phone,
                            latitude: volunteer.latitude,
                            longitude: volunteer.longitude
                        }
                    });
                });
            });
        });
    });
});

// Middleware
app.use(cors());
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "https://cdn.jsdelivr.net", 
        "https://unpkg.com", 
        "https://cdn.socket.io", 
        "'unsafe-inline'"
      ],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com", "'unsafe-inline'"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://*.tile.openstreetmap.org", 
        "https://t4.ftcdn.net",
        "https://unpkg.com" 
      ],
      connectSrc: [
        "'self'", 
        "https://cdn.jsdelivr.net", 
        "https://cdn.socket.io",
        "https://unpkg.com" 
      ]
    },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/emergency', emergencyRoutes);

// Catch-all route (using the regex version that worked)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start Server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});