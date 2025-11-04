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

    // --- Validation (omitted for brevity) ---
    if (!title || !description || !category || !contact || !latitude || !longitude || !urgency) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Required fields missing" });
    }
    // ... other validations ...
    if (!req.user || !req.user.id) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(401).json({ message: "Unauthorized: User info missing" });
    }
    // --- End Validation ---

    const newRequest = {
      title, description, category, contact,
      address: address || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      urgency,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      status: "pending",
      user_id: req.user.id,
    };

    Request.create(newRequest, (err, result) => {
      if (err) {
        console.error("Create request DB error:", err);
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json({ message: "Error creating request", error: err.message });
      }

      console.log('--- Request Created Successfully. Finding Volunteers... ---');

      const requestId = result.insertId;
      const requesterName = req.user.name;
      const requesterLocation = req.body.address || 'nearby';
      const io = req.app.get('io');

      // --- DEBUG STEP 1 ---
      console.log(`Searching for volunteers near Lat: ${req.body.latitude}, Lng: ${req.body.longitude}`);

      // Find nearby volunteers
      Volunteer.findNearby(req.body.latitude, req.body.longitude, 5, (err, volunteers) => {
        
        // --- DEBUG STEP 2 ---
        console.log('Nearby volunteers query completed.');

        if (err) {
            console.error('DATABASE ERROR finding volunteers:', err);
        }
        
        if (!volunteers || volunteers.length === 0) {
          console.warn('RESULT: No nearby volunteers were found.');
        } else {
          
          // --- DEBUG STEP 3 ---
          console.log(`SUCCESS: Found ${volunteers.length} volunteers. Emitting messages...`);
          
          volunteers.forEach(volunteer => {
            // This is the ID from the 'volunteers' table
            const volunteerRoomId = String(volunteer.id); 
            
            // --- DEBUG STEP 4 ---
            console.log(`Attempting to emit to volunteer room: ${volunteerRoomId}`);
            
            io.to(volunteerRoomId).emit('new-help-request', { 
              id: requestId,
              name: requesterName,
              location: requesterLocation,
              ...newRequest
            });
          });
        }

        // Start the 3-Minute Timer for the *requester*
        setTimeout(() => {
          Request.getById(requestId, (err, request) => {
            if (request && request.status === 'pending') {
              io.to(String(req.user.id)).emit('request-timeout', {
                message: 'No volunteer is accepting the response.'
              });
            }
          });
        }, 180000); // 3 minutes
      });

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
const getRequestDetails = (req, res) => {
    Request.getWithDetails(req.params.id, (err, details) => {
        if (err) return res.status(500).json({ message: "Error fetching details." });
        if (!details) return res.status(404).json({ message: "Request not found." });

        // Structure the data clearly
        const responseData = {
            request: details,
            requester: {
                id: details.user_id,
                name: details.user_name,
                phone: details.user_phone,
                latitude: details.user_lat,
                longitude: details.user_lng
            },
            volunteer: {
                id: details.vol_id,
                name: details.vol_name,
                phone: details.vol_phone,
                latitude: details.vol_lat,
                longitude: details.vol_lng
            }
        };
        res.json(responseData);
    });
};

module.exports = {
  createRequest,
  getNearbyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestDetails
};