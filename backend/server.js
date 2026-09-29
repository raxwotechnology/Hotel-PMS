// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for serverless/cold starts
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed", message: err.message });
  }
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

app.use("/api/guests", require("./routes/guestRoutes"));
app.use("/api/travel-agents", require("./routes/travelAgentRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/guest-expenses", require("./routes/guestExpenseRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Hotel Booking System API is running" });
});

// One-click Auto-Seed endpoint for Admin & Customer
app.get('/api/seed', async (req, res) => {
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");

    const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
    const hashedPasswordCustomer = await bcrypt.hash("password123", 10);

    const admin = await User.findOneAndUpdate(
      { email: "admin@hotel.com" },
      {
        name: "Hotel Administrator",
        email: "admin@hotel.com",
        password: hashedPasswordAdmin,
        phone: "0771234567",
        role: "admin"
      },
      { upsert: true, new: true }
    );

    const customer = await User.findOneAndUpdate(
      { email: "customer@hotel.com" },
      {
        name: "Demo Customer",
        email: "customer@hotel.com",
        password: hashedPasswordCustomer,
        phone: "0777654321",
        role: "customer"
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Admin and Customer accounts created/updated successfully!",
      accounts: {
        admin: { email: admin.email, password: "admin123", role: admin.role },
        customer: { email: customer.email, password: "password123", role: customer.role }
      }
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Failed to seed accounts", details: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    database: dbStatusMap[dbState] || 'Unknown',
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;