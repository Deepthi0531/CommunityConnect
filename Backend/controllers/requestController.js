const Request = require("../models/requestModel");
const Volunteer = require("../models/volunteerModel");
const fs = require("fs");
const path = require("path");

// Create new request with image upload and urgency support
const createRequest = (req, res) => {
  try {
    const {
      title, description, category, contact, address, latitude, longitude, urgency,
    } = req.body;

    if (!title || !description || !category || !contact || !latitude || !longitude || !urgency) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Required fields missing" });
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // This check is still valid
    if (!req.user || !req.user.id) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(401).json({ message: "Unauthorized: User info missing" });
    }

    const newRequest = {
      title, description, category, contact,
      address: address || null,
      latitude: latNum,
      longitude: lngNum,
      urgency,
      image_url: imageUrl,
      status: "pending",
      user_id: req.user.id,
    };

    Request.create(newRequest, (err, result) => {
      if (err) {
        console.error("Create request DB error:", err);
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json({ message: "Error creating request", error: err.message });
      }

      // --- Real-time logic starts here ---
      const requestId = result.insertId;
      const requesterName = req.user.name; // This will now work
      const requesterLocation = req.body.address || 'nearby';
      const io = req.app.get('io');

      // Find nearby volunteers
      Volunteer.findNearby(req.body.latitude, req.body.longitude, 5, (err, volunteers) => {
        if (err || !volunteers) {
          console.error("Could not find nearby volunteers:", err);
        } else {
          // Emit to all nearby volunteers
          volunteers.forEach(volunteer => {
            // Use String() for reliable room naming
            io.to(String(volunteer.user_id)).emit('new-help-request', { 
              id: requestId,
              name: requesterName,
              location: requesterLocation,
              ...newRequest
            });
          });
        }

        // Start the 3-Minute Timer
        setTimeout(() => {
          Request.getById(requestId, (err, request) => {
            if (request && request.status === 'pending') {
              // Send timeout message ONLY to the original requester
              // Use String() for reliable room naming
              io.to(String(req.user.id)).emit('request-timeout', {
                message: 'No volunteer is accepting the response.'
              });
            }
          });
        }, 180000); // 3 minutes
      });

      // Send the final HTTP response
      res.status(201).json({ message: "Request created successfully", requestId: requestId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all requests
const getNearbyRequests = (req, res) => {
  const { lat, lon } = req.query; 
  const radius = 5; 

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  Request.findNearby(parseFloat(lat), parseFloat(lon), radius, (err, requests) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Server Error' });
    }
    res.json(requests);
  });
};

// Get request by ID
const getRequestById = (req, res) => {
  Request.getById(req.params.id, (err, request) => {
    if (err) return res.status(500).json({ message: "Error fetching request", error: err.message });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  });
};

// Update request status
const updateRequest = (req, res) => {
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  Request.updateStatus(req.params.id, status, (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating request", error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request updated successfully" });
  });
};

// Delete request
const deleteRequest = (req, res) => {
  Request.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting request", error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  });
};

module.exports = {
  createRequest,
  getNearbyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
};