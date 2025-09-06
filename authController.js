// backend/controllers/authController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

/**
 * ================================
 * Helper: Generate JWT Token
 * ================================
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * ================================
 * Register (Admin only)
 * ================================
 */
// backend/controllers/authController.js - Updated register function
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentId } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  // If registering as teacher/admin, check permissions
  if (role !== 'student') {
    // Check if user is authenticated and has admin privileges
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Only admins can register teachers or administrators" 
      });
    }
  }

  // For students, studentId is required
  if (role === 'student' && !studentId) {
    return res.status(400).json({ 
      success: false, 
      message: "Student ID is required for student registration" 
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student', // Default to student if no role specified
    studentId: role === 'student' ? studentId : undefined,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    },
  });
});
/**
 * ================================
 * Login (All users)
 * ================================
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user + include password explicitly
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists and password is correct
  if (user && (await user.matchPassword(password))) {
    // Generate token
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401); // Use 401 for unauthorized access
    throw new Error("Invalid email or password");
  }
});

/**
 * ================================
 * Get Profile (Logged-in User)
 * ================================
 */
export const me = (req, res) => {
  // The 'protect' middleware should have already fetched the user and attached it to req.user.
  // This avoids a redundant database call.
  const user = req.user;

  // This check is a safeguard; the protect middleware should prevent this.
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
