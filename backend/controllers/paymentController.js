// backend/controllers/paymentController.js
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "room", select: "roomNumber roomType" }
      })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to load payments" });
  }
};

// Get payments by date
exports.getPaymentsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      paymentMethod: "Cash",
      paymentDate: { $gte: start, $lte: end }
    })
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "room", select: "roomNumber roomType" }
      })
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to load payment records" });
  }
};

// Get single payment
exports.getPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id)
      .populate("user", "name email phone")
      .populate({
        path: "booking",
        populate: { path: "room", select: "roomNumber roomType price" }
      });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "Failed to load payment" });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  const { bookingId, amount, paymentMethod, transactionId, notes } = req.body;

  if (!bookingId || !amount || !paymentMethod) {
    return res.status(400).json({ error: "Booking ID, amount, and payment method are required" });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify user authorization
    if (req.user.role !== "admin" && req.user.role !== "staff" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to create payment for this booking" });
    }

    const newPayment = new Payment({
      booking: bookingId,
      user: booking.user,
      amount,
      paymentMethod,
      transactionId,
      notes,
      paymentStatus: "completed"
    });

    await newPayment.save();

    // Update booking payment status
    booking.paymentStatus = "paid";
    await booking.save();

    const payment = await Payment.findById(newPayment._id)
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "room", select: "roomNumber roomType" }
      });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment" });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const payment = await Payment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "room", select: "roomNumber roomType" }
      });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment" });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Update booking payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = "pending";
      await booking.save();
    }

    await Payment.findByIdAndDelete(id);
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete payment" });
  }
};