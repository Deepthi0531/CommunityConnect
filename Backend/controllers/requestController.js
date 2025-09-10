const Request = require("../models/requestModel");
const path = require("path");
const fs = require("fs");

// Create new request with image upload and urgency support
exports.createRequest = (req, res) => {
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
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Validate lat/lng numeric values
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    // Save uploaded image path, if any
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newRequest = {
      title,
      description,
      category,
      contact,
      address: address || null,
      latitude: latNum,
      longitude: lngNum,
      urgency, // normal or emergency
      image_url: imageUrl,
      status: "pending",
      user_id: req.user.id,
      timestamp: new Date(),
    };

    Request.create(newRequest, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        // Remove uploaded file if db save failed
        if (req.file) {
          fs.unlink(path.join(__dirname, "..", "uploads", req.file.filename), () => {});
        }
        return res.status(500).json({ message: "Error creating request", error: err.message });
      }

      // TODO: If urgency === "emergency", trigger location-based alerts and emergency calls here

      res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// The rest of your CRUD methods (unchanged)
exports.getRequests = (req, res) => {
  Request.getAll((err, requests) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching requests", error: err.message });
    }
    res.status(200).json(requests);
  });
};

exports.getRequestById = (req, res) => {
  Request.getById(req.params.id, (err, request) => {
    if (err) return res.status(500).json({ message: "Error fetching request", error: err.message });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  });
};

exports.updateRequest = (req, res) => {
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

exports.deleteRequest = (req, res) => {
  Request.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting request", error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  });
};
