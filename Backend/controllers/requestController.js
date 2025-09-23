const Request = require("../models/requestModel");
const fs = require("fs");
const path = require("path");

// Create new request with image upload and urgency support
const createRequest = (req, res) => {
  try {
    const {
      title,
      description,
      category,
      contact,
      address,
      latitude,
      longitude,
      urgency,
    } = req.body;

    if (!title || !description || !category || !contact || !latitude || !longitude || !urgency) {
      // If a file was uploaded but fields are missing, remove it
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ message: "Required fields missing" });
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Ensure req.user exists from auth middleware
    if (!req.user || !req.user.id) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(401).json({ message: "Unauthorized: User info missing" });
    }

    const newRequest = {
      title,
      description,
      category,
      contact,
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
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(500).json({ message: "Error creating request", error: err.message });
      }

      res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all requests
const getNearbyRequests = (req, res) => {
  const { lat, lon } = req.query; // Get coordinates from the request URL
  const radius = 5; // Search radius in kilometers

  // Validate that coordinates were provided
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  // Call the findNearby function in the model
  Request.findNearby(parseFloat(lat), parseFloat(lon), radius, (err, requests) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Server Error' });
    }
    // Send the found requests back to the frontend
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