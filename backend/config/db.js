const mongoose = require("mongoose");

const connectDB = async () => {
  // If already connected or connecting, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const DEFAULT_URI = "mongodb+srv://raxwotechnology_db_user:JdLoSa5zV20xaH96@cluster0.pgdcy8f.mongodb.net/hotel_pms?retryWrites=true&w=majority";
  let mongoUri = (process.env.MONGO_URI || DEFAULT_URI).trim().replace(/\s+/g, "");

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("MongoDB connected successfully");
    await seedDefaultUsers();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1); // Exit process with failure in local development
    }
    throw err;
  }
};

const seedDefaultUsers = async () => {
  try {
    const User = require("../models/User");

    // Seed default admin if not existing
    const adminExists = await User.findOne({ email: "admin@hotel.com" });
    if (!adminExists) {
      await User.create({
        name: "Hotel Administrator",
        email: "admin@hotel.com",
        password: "admin123",
        phone: "0771234567",
        role: "admin"
      });
      console.log("Default admin account created: admin@hotel.com / admin123");
    }

    // Seed default customer if not existing
    const customerExists = await User.findOne({ email: "customer@hotel.com" });
    if (!customerExists) {
      await User.create({
        name: "Demo Customer",
        email: "customer@hotel.com",
        password: "password123",
        phone: "0777654321",
        role: "customer"
      });
      console.log("Default customer account created: customer@hotel.com / password123");
    }
  } catch (err) {
    console.error("Auto-seed error (non-fatal):", err.message);
  }
};

module.exports = connectDB;