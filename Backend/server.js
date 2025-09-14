const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requests');
const path = require('path');
const db = require("./config/db"); // Ensure this is correctly configured

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve uploaded images from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up a Content Security Policy header for security
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// Define API routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// Catch-all route to serve the main HTML file for any other GET request
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});