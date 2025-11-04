// In Backend/models/volunteerModel.js
const db = require("../config/db");

const Volunteer = {
  // Create a new volunteer
  create: (volunteerData, callback) => {
    const sql = `
      INSERT INTO volunteers 
        (name, email, phone, password, availability, skills, latitude, longitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        volunteerData.name,
        volunteerData.email,
        volunteerData.phone,
        volunteerData.password,
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

  // Find nearby volunteers
  findNearby: (lat, lon, radius, callback) => {
    const sql = `
      SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
      FROM volunteers
      WHERE availability = 'yes'
      HAVING distance < ?
      ORDER BY distance;
    `;
    db.query(sql, [lat, lon, lat, radius], callback);
  },

  // Find a single volunteer by their ID
  findById: (id, callback) => {
    const sql = "SELECT id, name, phone, latitude, longitude FROM volunteers WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
  }
};

module.exports = Volunteer;