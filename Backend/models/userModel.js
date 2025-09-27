const db = require("../config/db");

const User = {
  // Find user by email - returns first user matching the email
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0]);  // Return only one user object or undefined if none found
    });
  },

  // Create a new user with all necessary fields including latitude and longitude
  create: (userData, callback) => {
    const sql = `
      INSERT INTO users (name, email, role, password, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.name,
      userData.email,
      userData.role || 'user',
      userData.password,
      userData.latitude,
      userData.longitude
    ];
    db.query(sql, params, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  findById: (id, callback) => {
    const sql = `SELECT 
                 id, name, email, phone, skills,
                 address_house_no, address_line1, address_line2,
                 address_street, pincode, latitude, longitude
                 FROM users WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
},


    update: (id, userData, callback) => {
    const sql = `UPDATE users SET 
        name = ?, phone = ?, skills = ?, 
        address_house_no = ?, address_line1 = ?, address_line2 = ?, 
        address_street = ?, pincode = ?, latitude = ?, longitude = ? 
        WHERE id = ?`;
    db.query(sql, [
        userData.name, userData.phone, userData.skills,
        userData.address_house_no, userData.address_line1, userData.address_line2,
        userData.address_street, userData.pincode,
        userData.latitude, userData.longitude,
        id
    ], callback);
    }
};

module.exports = User;
