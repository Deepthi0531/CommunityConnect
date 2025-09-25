const db = require("../config/db");

const User = {
  // Find user by email - returns first user matching the email
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0]);  // Return only one user or undefined
    });
  },

  // Create a new user with all necessary fields including phone, lat, lon
  create: (userData, callback) => {
    const sql = `
      INSERT INTO users (name, email, phone, role, password, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.phone,
      userData.role || 'user',
      userData.password,
      userData.latitude,
      userData.longitude
    ];
    db.query(sql, params, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

module.exports = User;
