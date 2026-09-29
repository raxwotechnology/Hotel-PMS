// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword,
  createUser, 
  getUsers 
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated user profile routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.put("/change-password", protect, changePassword);

// Admin-only user management routes
router.post("/users", protect, authorize("admin"), createUser);
router.get("/users", protect, authorize("admin"), getUsers);

module.exports = router;