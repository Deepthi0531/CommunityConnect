const db = require('../config/db');

const Emergency = {
  findNearbyUsers: (lat, lon, radiusKm) => {
    return new Promise((resolve, reject) => {
      const haversine = `(6371 * acos(
        cos(radians(?)) 
        * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(?)) 
        + sin(radians(?)) * sin(radians(latitude))
      ))`;

      const latRads = radiusKm / 111; // 1 degree latitude ≈ 111km
      const minLat = lat - latRads;
      const maxLat = lat + latRads;

      const lonRads = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
      const minLon = lon - lonRads;
      const maxLon = lon + lonRads;

      const sql = `
        SELECT id, name, email, phone, latitude, longitude,
          ${haversine} AS distance
        FROM users
        WHERE role='user'
          AND latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
        HAVING distance <= ?
        ORDER BY distance;
      `;

      db.query(
        sql,
        [lat, lon, lat, minLat, maxLat, minLon, maxLon, radiusKm],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  findNearbyVolunteers: (lat, lon, radiusKm) => {
    return new Promise((resolve, reject) => {
      const haversine = `(6371 * acos(
        cos(radians(?)) 
        * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(?)) 
        + sin(radians(?)) * sin(radians(latitude))
      ))`;

      const latRads = radiusKm / 111;
      const minLat = lat - latRads;
      const maxLat = lat + latRads;

      const lonRads = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
      const minLon = lon - lonRads;
      const maxLon = lon + lonRads;

      const sql = `
        SELECT id, name, email, phone, skills, latitude, longitude,
          ${haversine} AS distance
        FROM volunteers
        WHERE availability='yes'
          AND latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
        HAVING distance <= ?
        ORDER BY distance;
      `;

      db.query(
        sql,
        [lat, lon, lat, minLat, maxLat, minLon, maxLon, radiusKm],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },
};

module.exports = Emergency;
