const db = require("../config/db");

const Volunteer = {
  // Create a new volunteer
  create: (volunteerData, callback) => {
    const sql = `
      INSERT INTO volunteers 
        (name, email, phone, availability, skills, latitude, longitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        volunteerData.name,
        volunteerData.email,
        volunteerData.phone,
        volunteerData.availability,
        volunteerData.skills,
        volunteerData.latitude || null,
        volunteerData.longitude || null,
      ],
      (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
      }
    );
  },

  // Find volunteer by email
  findOneByEmail: (email, callback) => {
    const sql = "SELECT * FROM volunteers WHERE email = ? LIMIT 1";
    db.query(sql, [email], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0] || null);
    });
  },
};

module.exports = Volunteer;
