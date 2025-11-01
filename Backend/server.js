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