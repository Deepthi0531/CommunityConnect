const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use("/api/users", userRoutes);

// Catch-all to serve index.html for any other GET request
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const requestRoutes = require("./routes/requests");
app.use("/api/requests", requestRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// ... your other middleware and routes
