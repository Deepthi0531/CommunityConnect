// Backend/config/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",   // your DB host
  user: "root",        // your MySQL username
  password: "Deepti@02!",        // your MySQL password
  database: "communityconnect"  // your database name
});

// connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

module.exports = db;
