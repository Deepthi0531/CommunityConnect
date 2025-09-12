// const express = require("express");
// const router = express.Router();
// const requestController = require("../controllers/requestController");
// const authMiddleware = require("../middleware/authMiddleware");
// const multer = require("multer");
// const path = require("path");

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
//   filename: (req, file, cb) => {
//     const ext = file.originalname.split(".").pop();
//     cb(null, `${Date.now()}.${ext}`);
//   },
// });

// const upload = multer({ storage });

// // Routes

// // Create new help request with image upload - protected
// router.post("/create", authMiddleware, upload.single("photo"), requestController.createRequest);

// // Get all requests - public
// router.get("/", requestController.getRequests);

// // Get request by ID - public
// router.get("/:id", requestController.getRequestById);

// // Update request status - protected
// router.put("/:id", authMiddleware, requestController.updateRequest);

// // Delete request - protected
// router.delete("/:id", authMiddleware, requestController.deleteRequest);

// module.exports = router;
const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

// Routes

// Create new help request with image upload - protected
router.post("/create", authMiddleware, upload.single("photo"), requestController.createRequest);

// Get all requests - public
router.get("/", requestController.getRequests);

// Get request by ID - public
router.get("/:id", requestController.getRequestById);

// Update request status - protected
router.put("/:id", authMiddleware, requestController.updateRequest);

// Delete request - protected
router.delete("/:id", authMiddleware, requestController.deleteRequest);

module.exports = router;
