const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

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