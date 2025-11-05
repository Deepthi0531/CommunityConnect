// config/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Deepti@02!",
  database: "communityconnect",
  connectTimeout: 20000
});

// connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
  } else {
    console.log("✅ Database connected successfully!");
  }
});

module.exports = connection;
