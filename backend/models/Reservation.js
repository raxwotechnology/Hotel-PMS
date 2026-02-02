// backend/models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  reservationNumber: {
    type: String,
    required: true,
    unique: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  bookingSource: {
    type: String,
    enum: ["Walk-in", "Booking.com", "Agoda", "Airbnb", "Travel Agent", "Hotel Website", "Phone", "Email", "Other"],
    required: true
  },
  travelAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TravelAgent"
  },
  bookingReference: {
    type: String
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  actualCheckInDate: {
    type: Date
  },
  actualCheckOutDate: {
    type: Date
  },
  numberOfAdults: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  numberOfChildren: {
    type: Number,
    default: 0,
    min: 0
  },
  roomType: {
    type: String,
    required: true
  },
  numberOfRooms: {
    type: Number,
    default: 1,
    min: 1
  },
  ratePerNight: {
    type: Number,
    required: true
  },
  numberOfNights: {
    type: Number,
    required: true
  },
  roomCharges: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountReason: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  advancePayment: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Confirmed", "Checked-In", "Checked-Out", "Cancelled", "No-Show"],
    default: "Confirmed"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Partial", "Paid", "Refunded"],
    default: "Pending"
  },
  mealPlan: {
    type: String,
    enum: ["None", "Breakfast", "Half Board", "Full Board", "All Inclusive"],
    default: "None"
  },
  specialRequests: {
    type: String
  },
  purpose: {
    type: String,
    enum: ["Business", "Leisure", "Conference", "Wedding", "Other"]
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  additionalGuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest"
  }],
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  },
  cancellationCharges: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate reservation number before saving
reservationSchema.pre("save", async function(next) {
  if (this.isNew) {
    const count = await mongoose.model("Reservation").countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.reservationNumber = `RES${year}${month}${(count + 1).toString().padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);