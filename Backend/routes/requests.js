// const express = require("express");
// const router = express.Router();
// const requestController = require("../controllers/requestController");
// const authMiddleware = require("../middleware/authMiddleware");

// // ✅ Create help request → only logged-in user
// router.post("/create", authMiddleware, requestController.createRequest);

// // ✅ Get all requests → public
// router.get("/", requestController.getRequests);

// // ✅ Get request by ID → public
// router.get("/:id", requestController.getRequestById);

// // ✅ Update request → only logged-in user
// router.put("/:id", authMiddleware, requestController.updateRequest);

// // ✅ Delete request → only logged-in user
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
router.post("/create", authMiddleware, upload.single("photo"), requestController.createRequest);

router.get("/", requestController.getRequests);
router.get("/:id", requestController.getRequestById);
router.put("/:id", authMiddleware, requestController.updateRequest);
router.delete("/:id", authMiddleware, requestController.deleteRequest);

module.exports = router;
