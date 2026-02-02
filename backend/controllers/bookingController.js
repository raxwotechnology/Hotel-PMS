// backend/controllers/bookingController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email phone")
      .populate("room", "roomNumber roomType price")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room", "roomNumber roomType price images")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load your bookings" });
  }
};

// Get bookings by date
exports.getBookingsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      checkInDate: { $gte: start, $lte: end }
    })
      .populate("user", "name email phone")
      .populate("room", "roomNumber roomType price")
      .sort({ checkInDate: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings for date" });
  }
};

// Get single booking
exports.getBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id)
      .populate("user", "name email phone")
      .populate("room");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    if (req.user.role !== "admin" && req.user.role !== "staff" && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to load booking" });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, paymentMethod } = req.body;

  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.status !== "available") {
      return res.status(400).json({ error: "Room is not available" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    // Check if room is available for the selected dates
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      bookingStatus: { $nin: ["cancelled", "checked-out"] },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ error: "Room is not available for selected dates" });
    }

    // Calculate total price
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = days * room.price;

    const newBooking = new Booking({
      user: req.user.id,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      totalPrice,
      specialRequests,
      paymentMethod: paymentMethod || "Cash"
    });

    await newBooking.save();

    const booking = await Booking.findById(newBooking._id)
      .populate("user", "name email phone")
      .populate("room");

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check authorization
    if (req.user.role !== "admin" && req.user.role !== "staff" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this booking" });
    }

    // If updating dates, validate and recalculate price
    if (updates.checkInDate || updates.checkOutDate) {
      const checkIn = new Date(updates.checkInDate || booking.checkInDate);
      const checkOut = new Date(updates.checkOutDate || booking.checkOutDate);

      if (checkIn >= checkOut) {
        return res.status(400).json({ error: "Check-out date must be after check-in date" });
      }

      const room = await Room.findById(booking.room);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      updates.totalPrice = days * room.price;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("user", "name email phone")
      .populate("room");

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check authorization
    if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to cancel this booking" });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    if (booking.bookingStatus === "checked-out") {
      return res.status(400).json({ error: "Cannot cancel completed booking" });
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

// Delete booking (Admin only)
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await Booking.findByIdAndDelete(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};