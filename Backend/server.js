const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "CommunityConnect"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("CommunityConnect Backend Running ✅");
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port ${PORT}");
});