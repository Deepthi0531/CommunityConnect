// config/db.js
const mysql = require("mysql2");

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: "localhost",       // Your DB host (use RDS endpoint if AWS)
  user: "root",            // Your MySQL username
  password: "your_password", // Your MySQL password
  database: "communityconnect", // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export promise-based pool (so we can use async/await)
const db = pool.promise();

module.exports = db;
