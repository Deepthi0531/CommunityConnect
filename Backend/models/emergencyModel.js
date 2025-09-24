const db = require('../config/db');

const Emergency = {
  // Find users within a distance radius of given lat/lon in kilometers
  findNearbyUsers: (lat, lon, radiusKm) => {
    return new Promise((resolve, reject) => {
      const haversine = `
        (6371 * acos(
          cos(radians(?)) 
          * cos(radians(latitude)) 
          * cos(radians(longitude) - radians(?)) 
          + sin(radians(?)) * sin(radians(latitude))
        ))`;

      const sql = `
        SELECT id, name, email, phone, latitude, longitude
        FROM users
        WHERE role = 'user'
        HAVING ${haversine} <= ?
      `;

      db.query(sql, [lat, lon, lat, radiusKm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  findNearbyVolunteers: (lat, lon, radiusKm) => {
    return new Promise((resolve, reject) => {
      const haversine = `
        (6371 * acos(
          cos(radians(?)) 
          * cos(radians(latitude)) 
          * cos(radians(longitude) - radians(?)) 
          + sin(radians(?)) * sin(radians(latitude))
        ))`;

      const sql = `
        SELECT id, name, email, phone, skills, latitude, longitude 
        FROM users 
        WHERE role = 'volunteer'
        HAVING ${haversine} <= ?
      `;

      db.query(sql, [lat, lon, lat, radiusKm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};

module.exports = Emergency;
