// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config();
// const userRoutes = require('./routes/userRoutes');
// const requestRoutes = require('./routes/requests');
// const path = require('path');
// const db = require("./config/db");

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // Serve static files from the 'frontend' directory
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

// // Serve uploaded images from the 'uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Set up a Content Security Policy header for security
// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
//   next();
// });

// // Define API routes
// app.use("/api/users", userRoutes);
// app.use("/api/requests", requestRoutes);

// // Catch-all route to serve the main HTML file for any other GET request
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
// });

// const volunteerRoutes = require('./routes/volunteer');
// app.use('/api/volunteer', volunteerRoutes);


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require("express");
const cors = require("cors");
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requests');
const volunteerRoutes = require('./routes/volunteer');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS middleware
app.use(cors());

// Use built-in middleware to parse JSON request bodies
app.use(express.json());

// Debug middleware to log incoming request bodies for troubleshooting
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url} body:`, req.body);
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security: Content Security Policy header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use('/api/volunteer', volunteerRoutes);

// Catch-all route to serve frontend index.html on unmatched GET requests
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
