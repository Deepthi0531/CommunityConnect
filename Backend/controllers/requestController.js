const Request = require("../models/requestModel");

// Create new request
exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, contact, address, latitude, longitude } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required" });
    }

    const newRequest = {
      title,
      description,
      category,
      contact,
      address,
      latitude,
      longitude,
      status: "pending",
      user_id: req.user.id, // user comes from authMiddleware
      timestamp: new Date()
    };

    Request.create(newRequest, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Error creating request", error: err.message });
      }
      res.status(201).json({ message: "Request created successfully", requestId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all requests
exports.getRequests = (req, res) => {
  Request.getAll((err, requests) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching requests", error: err.message });
    }
    res.status(200).json(requests);
  });
};

// Get request by ID
exports.getRequestById = (req, res) => {
  Request.getById(req.params.id, (err, request) => {
    if (err) return res.status(500).json({ message: "Error fetching request", error: err.message });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  });
};

// Update request
exports.updateRequest = (req, res) => {
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  Request.update(req.params.id, status, (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating request", error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request updated successfully" });
  });
};

// Delete request
exports.deleteRequest = (req, res) => {
  Request.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting request", error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  });
};
