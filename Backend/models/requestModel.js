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
  
  /**
   * @desc    Assigns a volunteer to a request and updates its status.
   */
  assignVolunteer: (requestId, volunteerId, callback) => {
    const sql = "UPDATE requests SET volunteer_id = ?, status = 'approved' WHERE id = ? AND status = 'pending'";
    db.query(sql, [volunteerId, requestId], callback);
  },

  /**
   * @desc    Gets all details for a specific request (request, user, and volunteer).
   */
  getWithDetails: (requestId, callback) => {
    const sql = `
        SELECT
        r.*,
        u.id as user_id, u.name as user_name, u.phone as user_phone, r.latitude as user_lat, r.longitude as user_lng,
        v.id as vol_id, v.name as vol_name, v.phone as vol_phone, v.latitude as vol_lat, v.longitude as vol_lng
        FROM requests r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN volunteers v ON r.volunteer_id = v.id
        WHERE r.id = ?
    `;
    db.query(sql, [requestId], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
  }
};

module.exports = Request;