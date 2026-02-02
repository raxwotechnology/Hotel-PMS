// backend/routes/guestRoutes.js
const express = require("express");
const router = express.Router();
const {
  getGuests,
  searchGuests,
  getGuest,
  addGuest,
  updateGuest,
  deleteGuest,
  getGuestStats
} = require("../controllers/guestController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin", "staff"), getGuests);
router.get("/search", protect, authorize("admin", "staff"), searchGuests);
router.get("/stats", protect, authorize("admin", "staff"), getGuestStats);
router.get("/:id", protect, authorize("admin", "staff"), getGuest);
router.post("/", protect, authorize("admin", "staff"), addGuest);
router.put("/:id", protect, authorize("admin", "staff"), updateGuest);
router.delete("/:id", protect, authorize("admin"), deleteGuest);

module.exports = router;