// backend/routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const {
  getRooms,
  getRoomsByStatus,
  getAvailableRooms,
  getRoom,
  addRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getRoomStats,
  getHousekeepingTasks
} = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin", "staff"), getRooms);
router.get("/status", protect, authorize("admin", "staff"), getRoomsByStatus);
router.get("/available", getAvailableRooms);
router.get("/stats", protect, authorize("admin", "staff"), getRoomStats);
router.get("/housekeeping", protect, authorize("admin", "staff"), getHousekeepingTasks);
router.get("/:id", protect, authorize("admin", "staff"), getRoom);
router.post("/", protect, authorize("admin", "staff"), addRoom);
router.put("/:id", protect, authorize("admin", "staff"), updateRoom);
router.put("/:id/status", protect, authorize("admin", "staff"), updateRoomStatus);
router.delete("/:id", protect, authorize("admin"), deleteRoom);

module.exports = router;