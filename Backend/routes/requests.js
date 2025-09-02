const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create help request → only logged-in user
router.post("/create", authMiddleware, requestController.createRequest);

// ✅ Get all requests → public
router.get("/", requestController.getRequests);

// ✅ Get request by ID → public
router.get("/:id", requestController.getRequestById);

// ✅ Update request → only logged-in user
router.put("/:id", authMiddleware, requestController.updateRequest);

// ✅ Delete request → only logged-in user
router.delete("/:id", authMiddleware, requestController.deleteRequest);

module.exports = router;
