// backend/routes/reservationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getReservations,
  getReservationsByStatus,
  getReservationsByDateRange,
  getReservation,
  createReservation,
  updateReservation,
  checkIn,
  checkOut,
  cancelReservation,
  deleteReservation,
  getDashboardStats
} = require("../controllers/reservationController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin", "staff"), getReservations);
router.get("/status", protect, authorize("admin", "staff"), getReservationsByStatus);
router.get("/date-range", protect, authorize("admin", "staff"), getReservationsByDateRange);
router.get("/dashboard-stats", protect, authorize("admin", "staff"), getDashboardStats);
router.get("/:id", protect, authorize("admin", "staff"), getReservation);
router.post("/", protect, authorize("admin", "staff"), createReservation);
router.put("/:id", protect, authorize("admin", "staff"), updateReservation);
router.put("/:id/check-in", protect, authorize("admin", "staff"), checkIn);
router.put("/:id/check-out", protect, authorize("admin", "staff"), checkOut);
router.put("/:id/cancel", protect, authorize("admin", "staff"), cancelReservation);
router.delete("/:id", protect, authorize("admin"), deleteReservation);

module.exports = router;