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

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes); // Moved up to ensure it's not caught by the catch-all route

// Catch-all to serve index.html for any other GET request
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
