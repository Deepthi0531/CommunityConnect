const db = require("../config/db");

const Request = {
  // Create new request
  create: (requestData, callback) => {
    const sql = `
      INSERT INTO requests (title, description, category, contact, address, latitude, longitude, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        requestData.title,
        requestData.description,
        requestData.category,
        requestData.contact,
        requestData.address || null,
        requestData.latitude,
        requestData.longitude,
        requestData.status || "pending",
        requestData.timestamp || new Date(),
      ],
      (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
      }
    );
  },

  // Get all requests
  getAll: (callback) => {
    const sql = "SELECT * FROM requests ORDER BY timestamp DESC";
    db.query(sql, (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  // Get request by ID
  getById: (id, callback) => {
    const sql = "SELECT * FROM requests WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0] || null);
    });
  },

  // Update request status
  updateStatus: (id, status, callback) => {
    const sql = "UPDATE requests SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Delete request
  delete: (id, callback) => {
    const sql = "DELETE FROM requests WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },
};

module.exports = Request;
