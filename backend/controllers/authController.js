// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "default_hotel_pms_secret_key_2026";
  return jwt.sign({ id }, secret, {
    expiresIn: "30d"
  });
};

// Register user (Public registration - always creates 'customer')
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "Please provide all required fields" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Public registration MUST always create a normal customer account.
    // Any client-supplied 'role' value is strictly ignored to prevent privilege escalation.
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "customer"
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Admin-only: create staff/admin accounts
exports.createUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "Please provide all required fields" });
  }

  const ALLOWED_STAFF_ROLES = [
    "admin",
    "staff",
    "manager",
    "finance",
    "housekeeping",
    "maintenance",
    "customer"
  ];

  const assignedRole = role || "staff";

  if (!ALLOWED_STAFF_ROLES.includes(assignedRole)) {
    return res.status(400).json({ 
      error: `Invalid role. Allowed roles are: ${ALLOWED_STAFF_ROLES.join(", ")}` 
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user account" });
  }
};

// Admin-only: list users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (err) {
    console.error("Login exception:", err);
    res.status(500).json({ error: "Failed to login: " + err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user data" });
  }
};

// Update user profile (Only updates name, phone, address for authenticated user)
exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Role, email, and password changes are explicitly prevented through this route
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address || "",
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Change password for logged-in user
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Please provide both current and new password" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
};