const mongoose = require("mongoose");

const connectDB = async () => {
  // If already connected or connecting, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1); // Exit process with failure in local development
    }
    throw err;
  }
};

module.exports = connectDB;