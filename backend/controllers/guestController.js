// backend/controllers/guestController.js
const mongoose = require("mongoose");
const Guest = require("../models/Guest");

// Get all guests
exports.getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({}).sort({ createdAt: -1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: "Failed to load guests" });
  }
};

// Search guests
exports.searchGuests = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const guests = await Guest.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { nationalIdNumber: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: "Failed to search guests" });
  }
};

// Get single guest
exports.getGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await Guest.findById(id);

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(guest);
  } catch (err) {
    res.status(500).json({ error: "Failed to load guest" });
  }
};

// Add new guest
exports.addGuest = async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    nationalIdType, 
    nationalIdNumber,
    nationality,
    address,
    dateOfBirth,
    gender,
    guestType,
    preferences,
    notes
  } = req.body;

  if (!firstName || !lastName || !phone || !nationalIdType || !nationalIdNumber || !nationality) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    // Check if guest already exists
    const existingGuest = await Guest.findOne({ 
      nationalIdType, 
      nationalIdNumber 
    });

    if (existingGuest) {
      return res.status(400).json({ error: "Guest with this ID already exists" });
    }

    const newGuest = new Guest({
      firstName,
      lastName,
      email,
      phone,
      nationalIdType,
      nationalIdNumber,
      nationality,
      address,
      dateOfBirth,
      gender,
      guestType: guestType || "Regular",
      preferences,
      notes
    });

    await newGuest.save();
    res.status(201).json(newGuest);
  } catch (err) {
    res.status(500).json({ error: "Failed to add guest" });
  }
};

// Update guest
exports.updateGuest = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const guest = await Guest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(guest);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update guest" });
  }
};

// Delete guest
exports.deleteGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await Guest.findByIdAndDelete(id);

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json({ message: "Guest deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete guest" });
  }
};

// Get guest statistics
exports.getGuestStats = async (req, res) => {
  try {
    const totalGuests = await Guest.countDocuments();
    const vipGuests = await Guest.countDocuments({ guestType: "VIP" });
    const blacklistedGuests = await Guest.countDocuments({ blacklisted: true });
    
    const topGuests = await Guest.find({})
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('firstName lastName email totalStays totalSpent loyaltyPoints');

    res.json({
      totalGuests,
      vipGuests,
      blacklistedGuests,
      topGuests
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load guest statistics" });
  }
};