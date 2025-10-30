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

  findNearby: (lat, lon, radius, callback) => {
    // Finds volunteers within a radius, using the Haversine formula
    // Assumes volunteers have a 'latitude', 'longitude', and 'user_id'
    const sql = `
      SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
      FROM volunteers
      WHERE availability = 'Available' -- Only find available volunteers
      HAVING distance < ?
      ORDER BY distance;
    `;
    db.query(sql, [lat, lon, lat, radius], callback);
  }
};

module.exports = Volunteer;
