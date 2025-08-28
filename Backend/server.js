const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});