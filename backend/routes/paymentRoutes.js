// backend/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentsByDate,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin", "staff"), getPayments);
router.get("/by-date", protect, authorize("admin", "staff"), getPaymentsByDate);
router.get("/:id", protect, getPayment);
router.post("/", protect, createPayment);
router.put("/:id", protect, authorize("admin", "staff"), updatePayment);
router.delete("/:id", protect, authorize("admin"), deletePayment);

module.exports = router;