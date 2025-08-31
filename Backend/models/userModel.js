const db = require("../config/db");

const User = {
  // Find user by email
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0]); // return first user found
    });
  },

  // Register new user
  create: (userData, callback) => {
    const sql = "INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [userData.name, userData.email, userData.role, userData.password], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

module.exports = User;