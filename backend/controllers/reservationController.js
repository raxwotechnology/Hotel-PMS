// backend/controllers/reservationController.js
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Guest = require("../models/Guest");
const Room = require("../models/Room");
const TravelAgent = require("../models/TravelAgent");

// Get all reservations
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate("guest", "firstName lastName phone email")
      .populate("room", "roomNumber roomType")
      .populate("travelAgent", "companyName agentCode")
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reservations" });
  }
};

// Get reservations by status
exports.getReservationsByStatus = async (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const reservations = await Reservation.find({ status })
      .populate("guest", "firstName lastName phone email")
      .populate("room", "roomNumber roomType")
      .populate("travelAgent", "companyName")
      .sort({ checkInDate: 1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reservations" });
  }
};

// Get reservations by date range
exports.getReservationsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      $or: [
        { checkInDate: { $gte: start, $lte: end } },
        { checkOutDate: { $gte: start, $lte: end } },
        { 
          checkInDate: { $lte: start },
          checkOutDate: { $gte: end }
        }
      ]
    })
      .populate("guest", "firstName lastName phone")
      .populate("room", "roomNumber roomType")
      .sort({ checkInDate: 1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reservations" });
  }
};

// Get single reservation
exports.getReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent")
      .populate("additionalGuests")
      .populate("createdBy", "name email");

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reservation" });
  }
};

// Create new reservation
exports.createReservation = async (req, res) => {
  const {
    guestId,
    roomId,
    bookingSource,
    travelAgentId,
    bookingReference,
    checkInDate,
    checkOutDate,
    numberOfAdults,
    numberOfChildren,
    roomType,
    numberOfRooms,
    ratePerNight,
    taxAmount,
    discountAmount,
    discountReason,
    advancePayment,
    mealPlan,
    specialRequests,
    purpose,
    additionalGuestIds
  } = req.body;

  if (!guestId || !checkInDate || !checkOutDate || !numberOfAdults || !roomType || !ratePerNight) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // If room is assigned, check availability
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Check for overlapping reservations
      const overlapping = await Reservation.findOne({
        room: roomId,
        status: { $nin: ["Cancelled", "Checked-Out"] },
        $or: [
          {
            checkInDate: { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) }
          }
        ]
      });

      if (overlapping) {
        return res.status(400).json({ error: "Room is not available for selected dates" });
      }
    }

    // Validate travel agent if booking source is Travel Agent
    if (bookingSource === "Travel Agent") {
      if (!travelAgentId) {
        return res.status(400).json({ error: "Travel agent is required for this booking source" });
      }
      const agent = await TravelAgent.findById(travelAgentId);
      if (!agent) {
        return res.status(404).json({ error: "Travel agent not found" });
      }
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    // Generate reservation number
    const now = new Date();
    const yearMonth = now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, '0');
    const count = await Reservation.countDocuments({
      reservationNumber: new RegExp(`^RES${yearMonth}`)
    });
    const reservationNumber = `RES${yearMonth}${(count + 1).toString().padStart(5, '0')}`;

    // Calculate charges
    const roomCharges = ratePerNight * nights * (numberOfRooms || 1);
    const totalAmount = roomCharges + (taxAmount || 0) - (discountAmount || 0);

    const newReservation = new Reservation({
      reservationNumber,
      guest: guestId,
      room: roomId || null,
      bookingSource,
      travelAgent: travelAgentId || null,
      bookingReference,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfAdults,
      numberOfChildren: numberOfChildren || 0,
      roomType,
      numberOfRooms: numberOfRooms || 1,
      ratePerNight,
      numberOfNights: nights,
      roomCharges,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      discountReason,
      totalAmount,
      advancePayment: advancePayment || 0,
      mealPlan: mealPlan || "None",
      specialRequests,
      purpose,
      numberOfGuests: numberOfAdults + (numberOfChildren || 0),
      additionalGuests: additionalGuestIds || [],
      paymentStatus: advancePayment > 0 ? "Partial" : "Pending",
      createdBy: req.user.id
    });

    await newReservation.save();

    // Update room status if room is assigned
    if (roomId) {
      await Room.findByIdAndUpdate(roomId, { 
        status: "Reserved",
        currentReservation: newReservation._id
      });
    }

    // Update guest statistics
    guest.totalStays += 1;
    await guest.save();

    // Update travel agent statistics
    if (travelAgentId) {
      await TravelAgent.findByIdAndUpdate(travelAgentId, {
        $inc: { totalBookings: 1, totalRevenue: totalAmount }
      });
    }

    const reservation = await Reservation.findById(newReservation._id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    res.status(201).json(reservation);
  } catch (err) {
    console.error("Create reservation error:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // If dates are updated, recalculate charges
    if (updates.checkInDate || updates.checkOutDate || updates.ratePerNight || updates.numberOfRooms) {
      const checkIn = new Date(updates.checkInDate || reservation.checkInDate);
      const checkOut = new Date(updates.checkOutDate || reservation.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const rate = updates.ratePerNight || reservation.ratePerNight;
      const rooms = updates.numberOfRooms || reservation.numberOfRooms;
      
      updates.numberOfNights = nights;
      updates.roomCharges = rate * nights * rooms;
      updates.totalAmount = updates.roomCharges + (updates.taxAmount || reservation.taxAmount) - (updates.discountAmount || reservation.discountAmount);
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    res.json(updatedReservation);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update reservation" });
  }
};

// Check-in guest
exports.checkIn = async (req, res) => {
  const { id } = req.params;
  const { roomId, actualCheckInDate } = req.body;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === "Checked-In") {
      return res.status(400).json({ error: "Guest is already checked in" });
    }

    // Assign room if not already assigned
    if (!reservation.room && roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (room.status !== "Available" && room.status !== "Reserved") {
        return res.status(400).json({ error: "Room is not available" });
      }

      reservation.room = roomId;
    }

    if (!reservation.room) {
      return res.status(400).json({ error: "Please assign a room before check-in" });
    }

    reservation.status = "Checked-In";
    reservation.actualCheckInDate = actualCheckInDate || new Date();
    await reservation.save();

    // Update room status
    await Room.findByIdAndUpdate(reservation.room, {
      status: "Occupied",
      currentReservation: reservation._id,
      cleaningStatus: "Dirty"
    });

    const updatedReservation = await Reservation.findById(id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    res.json(updatedReservation);
  } catch (err) {
    res.status(500).json({ error: "Failed to check in guest" });
  }
};

// Check-out guest
exports.checkOut = async (req, res) => {
  const { id } = req.params;
  const { actualCheckOutDate } = req.body;

  try {
    const reservation = await Reservation.findById(id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status !== "Checked-In") {
      return res.status(400).json({ error: "Guest is not checked in" });
    }

    // Check if invoice exists and is fully paid
    const Invoice = require("../models/Invoice");
    let invoice = await Invoice.findOne({ reservation: id });
    
    if (!invoice) {
      // Auto-generate invoice
      const GuestExpense = require("../models/GuestExpense");
      const expenses = await GuestExpense.find({ reservation: id });
      
      const totalExtraExpenses = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const subtotal = reservation.roomCharges + totalExtraExpenses;
      const taxAmount = reservation.taxAmount;
      const totalAmount = subtotal + taxAmount - (reservation.discountAmount || 0);

      // Generate invoice number
      const now = new Date();
      const yearMonth = now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, '0');
      const count = await Invoice.countDocuments({
        invoiceNumber: new RegExp(`^INV${yearMonth}`)
      });
      const invoiceNumber = `INV${yearMonth}${(count + 1).toString().padStart(5, '0')}`;

      invoice = new Invoice({
        invoiceNumber,
        reservation: reservation._id,
        guest: reservation.guest._id,
        travelAgent: reservation.travelAgent?._id,
        invoiceDate: new Date(),
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.actualCheckOutDate || new Date(),
        numberOfNights: reservation.numberOfNights,
        roomCharges: reservation.roomCharges,
        extraExpenses: expenses.map(exp => ({
          date: exp.expenseDate,
          category: exp.category,
          description: exp.description,
          amount: exp.totalAmount
        })),
        totalExtraExpenses,
        subtotal,
        taxPercentage: (taxAmount / subtotal) * 100 || 0,
        taxAmount,
        discountAmount: reservation.discountAmount || 0,
        discountReason: reservation.discountReason,
        totalAmount,
        advancePaid: reservation.advancePayment || 0,
        totalPaid: reservation.advancePayment || 0,
        balanceDue: totalAmount - (reservation.advancePayment || 0),
        paymentStatus: (reservation.advancePayment || 0) >= totalAmount ? 'Paid' : 
                      (reservation.advancePayment || 0) > 0 ? 'Partial' : 'Unpaid',
        billingAddress: reservation.guest.address,
        generatedBy: req.user.id
      });

      await invoice.save();
    }

    // Check if invoice is fully paid
    if (invoice.balanceDue > 0) {
      return res.status(400).json({ 
        error: "Cannot check out. Outstanding balance of ₹" + invoice.balanceDue.toLocaleString() + " must be paid first.",
        invoiceId: invoice._id,
        balanceDue: invoice.balanceDue
      });
    }

    // If paid, proceed with checkout
    reservation.status = "Checked-Out";
    reservation.actualCheckOutDate = actualCheckOutDate || new Date();
    await reservation.save();

    // Update room status
    if (reservation.room) {
      await Room.findByIdAndUpdate(reservation.room, {
        status: "Cleaning",
        currentReservation: null,
        cleaningStatus: "Dirty"
      });
    }

    const updatedReservation = await Reservation.findById(id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    res.json({ 
      reservation: updatedReservation,
      invoice: invoice
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to check out guest" });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  const { id } = req.params;
  const { cancellationReason, cancellationCharges } = req.body;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status === "Checked-Out") {
      return res.status(400).json({ error: "Cannot cancel completed reservation" });
    }

    reservation.status = "Cancelled";
    reservation.cancellationDate = new Date();
    reservation.cancellationReason = cancellationReason;
    reservation.cancellationCharges = cancellationCharges || 0;
    await reservation.save();

    // Update room status if room was assigned
    if (reservation.room) {
      await Room.findByIdAndUpdate(reservation.room, {
        status: "Available",
        currentReservation: null
      });
    }

    const updatedReservation = await Reservation.findById(id)
      .populate("guest")
      .populate("room")
      .populate("travelAgent");

    res.json({ message: "Reservation cancelled successfully", reservation: updatedReservation });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
};

// Delete reservation
exports.deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Update room status if room was assigned
    if (reservation.room) {
      await Room.findByIdAndUpdate(reservation.room, {
        status: "Available",
        currentReservation: null
      });
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reservation" });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkingInToday = await Reservation.countDocuments({
      checkInDate: { $gte: today, $lt: tomorrow },
      status: "Confirmed"
    });

    const checkingOutToday = await Reservation.countDocuments({
      checkOutDate: { $gte: today, $lt: tomorrow },
      status: "Checked-In"
    });

    const currentOccupancy = await Reservation.countDocuments({
      status: "Checked-In"
    });

    const confirmedReservations = await Reservation.countDocuments({
      status: "Confirmed"
    });

    const revenueToday = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      checkingInToday,
      checkingOutToday,
      currentOccupancy,
      confirmedReservations,
      revenueToday: revenueToday[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
};