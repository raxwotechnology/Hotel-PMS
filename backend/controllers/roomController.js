// backend/controllers/roomController.js
const mongoose = require("mongoose");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true })
      .populate("currentReservation", "reservationNumber guest")
      .sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to load rooms" });
  }
};

// Get rooms by status
exports.getRoomsByStatus = async (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const rooms = await Room.find({ status, isActive: true })
      .populate("currentReservation")
      .sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to load rooms" });
  }
};

// Get available rooms for date range
exports.getAvailableRooms = async (req, res) => {
  const { checkInDate, checkOutDate, roomType } = req.query;

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ error: "Check-in and check-out dates are required" });
  }

  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Normalize to start of day for accurate comparison
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    console.log('Searching availability for:', {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString()
    });

    // Find overlapping reservations
    // A room is unavailable if there's ANY overlap with existing reservations
    // Overlap exists when: (StartA < EndB) AND (EndA > StartB)
    const overlappingReservations = await Reservation.find({
      status: { $nin: ["Cancelled", "Checked-Out"] },
      $and: [
        { checkInDate: { $lt: checkOut } },  // Existing checkin is BEFORE requested checkout
        { checkOutDate: { $gt: checkIn } }   // Existing checkout is AFTER requested checkin
      ]
    }).select("room reservationNumber checkInDate checkOutDate");

    console.log('Found overlapping reservations:', overlappingReservations.length);
    overlappingReservations.forEach(res => {
      console.log(`- ${res.reservationNumber}: ${res.checkInDate} to ${res.checkOutDate}, Room: ${res.room}`);
    });

    const bookedRoomIds = overlappingReservations
      .filter(r => r.room)
      .map(r => r.room.toString());

    console.log('Booked room IDs:', bookedRoomIds);

    const query = {
      _id: { $nin: bookedRoomIds },
      status: { $in: ["Available", "Cleaning"] },
      isActive: true
    };

    if (roomType) {
      query.roomType = roomType;
    }

    const availableRooms = await Room.find(query).sort({ roomNumber: 1 });

    console.log('Available rooms found:', availableRooms.length);

    res.json(availableRooms);
  } catch (err) {
    console.error('Error in getAvailableRooms:', err);
    res.status(500).json({ error: "Failed to load available rooms" });
  }
};

// Get single room
exports.getRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id).populate("currentReservation");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to load room" });
  }
};

// Add new room
exports.addRoom = async (req, res) => {
  const {
    roomNumber,
    roomType,
    floor,
    building,
    basePrice,
    weekendPrice,
    capacity,
    bedConfiguration,
    roomSize,
    view,
    amenities,
    features,
    description,
    images
  } = req.body;

  if (!roomNumber || !roomType || !floor || !basePrice || !capacity || !bedConfiguration) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      return res.status(400).json({ error: "Room number already exists" });
    }

    const newRoom = new Room({
      roomNumber,
      roomType,
      floor,
      building: building || "Main",
      basePrice,
      weekendPrice: weekendPrice || basePrice,
      capacity,
      bedConfiguration,
      roomSize,
      view,
      amenities: amenities || [],
      features: features || {},
      description,
      images: images || []
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: "Failed to add room" });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const room = await Room.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// Update room status
exports.updateRoomStatus = async (req, res) => {
  const { id } = req.params;
  const { status, cleaningStatus, maintenanceNotes } = req.body;

  if (!status && !cleaningStatus) {
    return res.status(400).json({ error: "Status or cleaning status is required" });
  }

  try {
    const updates = {};
    
    if (status) updates.status = status;
    if (cleaningStatus) {
      updates.cleaningStatus = cleaningStatus;
      if (cleaningStatus === "Clean") {
        updates.lastCleanedAt = new Date();
      }
    }
    if (maintenanceNotes) updates.maintenanceNotes = maintenanceNotes;
    if (status === "Maintenance") updates.lastMaintenanceAt = new Date();

    const room = await Room.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to update room status" });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check for active reservations
    const activeReservation = await Reservation.findOne({
      room: id,
      status: { $nin: ["Cancelled", "Checked-Out"] }
    });

    if (activeReservation) {
      return res.status(400).json({ error: "Cannot delete room with active reservations" });
    }

    // Soft delete - mark as inactive
    room.isActive = false;
    await room.save();

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// Get room statistics
exports.getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ status: "Available", isActive: true });
    const occupiedRooms = await Room.countDocuments({ status: "Occupied", isActive: true });
    const maintenanceRooms = await Room.countDocuments({ 
      status: { $in: ["Maintenance", "Out of Order"] }, 
      isActive: true 
    });
    const cleaningRooms = await Room.countDocuments({ status: "Cleaning", isActive: true });

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    const roomTypeStats = await Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$roomType",
          count: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ["$status", "Occupied"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      cleaningRooms,
      occupancyRate,
      roomTypeStats
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load room statistics" });
  }
};

// Get housekeeping tasks
exports.getHousekeepingTasks = async (req, res) => {
  try {
    // Dirty rooms - needs cleaning
    const dirty = await Room.find({
      cleaningStatus: "Dirty",
      isActive: true
    }).sort({ roomNumber: 1 });

    // Pickup rooms - waiting for supplies/linen
    const pickup = await Room.find({
      cleaningStatus: "Pickup",
      isActive: true
    }).sort({ roomNumber: 1 });

    // Clean rooms - needs inspection
    const inspection = await Room.find({
      cleaningStatus: "Clean",
      status: "Cleaning",
      isActive: true
    }).sort({ roomNumber: 1 });

    // Clean rooms - needs inspection
    const inspected = await Room.find({
      cleaningStatus: "Inspected",
      status: "Cleaning",
      isActive: true
    }).sort({ roomNumber: 1 });

    // Clean rooms - needs inspection
    const available = await Room.find({
      cleaningStatus: "Clean",
      status: "Available",
      isActive: true
    }).sort({ roomNumber: 1 });

    console.log('Housekeeping tasks:', {
      dirty: dirty.length,
      pickup: pickup.length,
      inspection: inspection.length
    });

    res.json({
      dirty,
      pickup,
      inspection,
      inspected,
      available
    });
  } catch (err) {
    console.error('Housekeeping tasks error:', err);
    res.status(500).json({ error: "Failed to load housekeeping tasks" });
  }
};