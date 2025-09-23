// In Backend/models/requestModel.js
const db = require("../config/db");

const Request = {
  /**
   * @desc    Create a new help request.
   */
  create: (requestData, callback) => {
    const sql = "INSERT INTO requests SET ?";
    db.query(sql, requestData, callback);
  },

  /**
   * @desc    FOR THE MAP: Get requests within a certain radius of a location.
   */
  findNearby: (lat, lon, radius, callback) => {
    const sql = `
      SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
      FROM requests
      WHERE status = 'pending'
      HAVING distance < ?
      ORDER BY urgency DESC, distance ASC;
    `;
    db.query(sql, [lat, lon, lat, radius], callback);
  },

  /**
   * @desc    FOR ADMINS: Get ALL requests from the database.
   */
  getAll: (callback) => {
    const sql = "SELECT * FROM requests ORDER BY created_at DESC";
    db.query(sql, callback);
  },

  /**
   * @desc    Get a single request by its ID.
   */
  getById: (id, callback) => {
    const sql = "SELECT * FROM requests WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0] || null);
    });
  },

  /**
   * @desc    Update the status of a request.
   */
  updateStatus: (id, status, callback) => {
    const sql = "UPDATE requests SET status = ? WHERE id = ?";
    db.query(sql, [status, id], callback);
  },

  /**
   * @desc    Delete a request by its ID.
   */
  delete: (id, callback) => {
    const sql = "DELETE FROM requests WHERE id = ?";
    db.query(sql, [id], callback);
  },
};

module.exports = Request;