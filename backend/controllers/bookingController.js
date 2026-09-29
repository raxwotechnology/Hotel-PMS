// backend/controllers/bookingController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const Guest = require("../models/Guest");
const User = require("../models/User");

// Get all bookings (Admin / Staff)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email phone")
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation", "reservationNumber status")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

// Get current user's bookings (Customer / Self-service)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation", "reservationNumber status")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load your bookings" });
  }
};

// Get bookings by date (Admin / Staff)
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
      .populate("room", "roomNumber roomType basePrice")
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
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation");

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

// Create new booking (Customer self-service reservation)
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

    const roomStatus = (room.status || "").toLowerCase();
    if (roomStatus !== "available") {
      return res.status(400).json({ error: "Room is not currently available for booking" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(14, 0, 0, 0); // Standard 2:00 PM check-in
    checkOut.setHours(11, 0, 0, 0); // Standard 11:00 AM check-out

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    // Calculate number of nights
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Check for overlapping canonical Reservations
    const overlappingReservation = await Reservation.findOne({
      room: roomId,
      status: { $nin: ["Cancelled", "Checked-Out"] },
      $and: [
        { checkInDate: { $lt: checkOut } },
        { checkOutDate: { $gt: checkIn } }
      ]
    });

    // Check for overlapping Bookings
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      bookingStatus: { $nin: ["cancelled", "checked-out"] },
      $and: [
        { checkInDate: { $lt: checkOut } },
        { checkOutDate: { $gt: checkIn } }
      ]
    });

    if (overlappingReservation || overlappingBooking) {
      return res.status(400).json({ error: "Room is already reserved for the selected dates" });
    }

    // Secure server-side pricing calculation (Customer cannot manipulate price)
    const ratePerNight = Number(room.basePrice || room.price || 0);
    const totalPrice = days * ratePerNight;

    // Fetch user details for guest mapping
    const currentUser = await User.findById(req.user.id);
    const userEmail = currentUser?.email || req.user.email;
    const userName = currentUser?.name || req.user.name || "Valued Guest";
    const userPhone = currentUser?.phone || req.user.phone || "Not provided";
    const userAddress = currentUser?.address || "";

    // Find or create Guest profile to link with canonical Reservation
    let guest = await Guest.findOne({ email: userEmail });
    if (!guest) {
      const nameParts = userName.trim().split(" ");
      const firstName = nameParts[0] || "Valued";
      const lastName = nameParts.slice(1).join(" ") || "Guest";
      guest = await Guest.create({
        firstName,
        lastName,
        email: userEmail,
        phone: userPhone,
        nationalIdType: "Other",
        nationalIdNumber: `GUEST-${req.user.id.slice(-6).toUpperCase()}`,
        nationality: "Resident",
        address: { street: userAddress }
      });
    }

    // Create canonical operational Reservation
    const now = new Date();
    const yearMonth = now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, "0");
    const count = await Reservation.countDocuments({
      reservationNumber: new RegExp(`^RES${yearMonth}`)
    });
    const reservationNumber = `RES${yearMonth}${(count + 1).toString().padStart(5, "0")}`;

    const canonicalReservation = new Reservation({
      reservationNumber,
      guest: guest._id,
      room: roomId,
      bookingSource: "Hotel Website",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfAdults: Number(numberOfGuests) || 1,
      numberOfChildren: 0,
      roomType: room.roomType,
      numberOfRooms: 1,
      ratePerNight,
      numberOfNights: days,
      roomCharges: totalPrice,
      totalAmount: totalPrice,
      paymentStatus: "Pending",
      status: "Confirmed",
      specialRequests: specialRequests || "",
      numberOfGuests: Number(numberOfGuests) || 1,
      createdBy: req.user.id
    });

    await canonicalReservation.save();

    // Create Customer Booking record
    const newBooking = new Booking({
      user: req.user.id,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: Number(numberOfGuests) || 1,
      totalPrice,
      specialRequests: specialRequests || "",
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      reservationNumber: canonicalReservation.reservationNumber,
      reservation: canonicalReservation._id
    });

    await newBooking.save();

    // Update room status
    await Room.findByIdAndUpdate(roomId, {
      status: "Reserved",
      currentReservation: canonicalReservation._id
    });

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("user", "name email phone")
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation");

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Failed to create reservation: " + (err.message || "") });
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

    // If updating dates, recalculate server-side price safely
    if (updates.checkInDate || updates.checkOutDate) {
      const checkIn = new Date(updates.checkInDate || booking.checkInDate);
      const checkOut = new Date(updates.checkOutDate || booking.checkOutDate);

      if (checkIn >= checkOut) {
        return res.status(400).json({ error: "Check-out date must be after check-in date" });
      }

      const room = await Room.findById(booking.room);
      const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const rate = Number(room.basePrice || room.price || 0);
      updates.totalPrice = days * rate;

      // Also update linked canonical reservation if present
      if (booking.reservation) {
        await Reservation.findByIdAndUpdate(booking.reservation, {
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights: days,
          roomCharges: updates.totalPrice,
          totalAmount: updates.totalPrice
        });
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("user", "name email phone")
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation");

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
};

// Cancel booking (Guest self-service cancellation or Admin)
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
      return res.status(400).json({ error: "Cannot cancel completed stay" });
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Cancel linked canonical reservation if present
    if (booking.reservation) {
      await Reservation.findByIdAndUpdate(booking.reservation, {
        status: "Cancelled",
        cancellationDate: new Date(),
        cancellationReason: "Cancelled by guest via Guest Portal"
      });
    }

    // Revert room status back to Available
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, {
        status: "Available",
        currentReservation: null
      });
    }

    const updated = await Booking.findById(id)
      .populate("room", "roomNumber roomType basePrice weekendPrice images capacity bedConfiguration view description amenities")
      .populate("reservation");

    res.json({ message: "Reservation cancelled successfully", booking: updated });
  } catch (err) {
    console.error("Cancel booking error:", err);
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