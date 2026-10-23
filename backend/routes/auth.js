/* ═══════════════════════════════════════════════
   Auth Routes  (routes/auth.js)
═══════════════════════════════════════════════

   This file has 3 routes (URL paths):
     1. POST /api/auth/register  → create a new user account
     2. POST /api/auth/login     → log in and get a token
     3. GET  /api/health         → check if server is alive
═══════════════════════════════════════════════ */

const express = require("express");
const bcrypt  = require("bcryptjs");   // for hashing passwords
const jwt     = require("jsonwebtoken"); // for creating login tokens
const User    = require("../models/User");

// Read secret values from .env file
require("dotenv").config();
const JWT_SECRET    = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Create a router object (mini Express app just for /api/auth routes)
const router = express.Router();

/* ═══════════════════════════════════════════
   1. REGISTER  —  POST /api/auth/register
   ═══════════════════════════════════════════
   Body: { name, email, password, role, ...hospitalFields }

   Steps:
   a) Check if email already exists
   b) Hash the password (never store plain text)
   c) Save the new user to MongoDB
   d) Create a JWT token
   e) Return the user + token to the frontend
══════════════════════════════════════════ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // (a) Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // (b) Hash the password using bcrypt
    //  salt = random text added to password before hashing (makes it more secure)
    const salt     = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);

    // (c) Create the user in the database
    const newUser = new User({
      name,
      email,
      password: hashedPw,        // store the HASH, not the original
      role: role || "patient",
      // hospital extra fields (ignored if not provided)
      phone:              req.body.phone              || "",
      address:            req.body.address            || "",
      city:               req.body.city               || "",
      state:              req.body.state              || "",
      hospitalType:       req.body.hospitalType       || "",
      registrationNumber: req.body.registrationNumber || "",
      totalBeds:          req.body.totalBeds          || 0,
      // hospital accounts need admin approval
      approvalStatus: role === "hospital" ? "pending" : "approved",
    });

    await newUser.save();

    // ── Hospital: don't log them in yet (needs admin approval) ──
    if (role === "hospital") {
      return res.json({
        approvalStatus: "pending",
        message:
          "Hospital registration submitted. An admin will review and approve your account.",
      });
    }

    // (d) Create a JWT token (a "badge" that proves this user is logged in)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },  // payload (what we store inside the token)
      JWT_SECRET,                                 // secret key used to sign it
      { expiresIn: JWT_EXPIRES_IN }               // how long it lasts
    );

    // (e) Send user info + token back to the frontend
    res.status(201).json({
      user: {
        id:    newUser._id,
        name:  newUser.name,
        email: newUser.email,
        role:  newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* ═══════════════════════════════════════════
   2. LOGIN  —  POST /api/auth/login
   ═══════════════════════════════════════════
   Body: { email, password }

   Steps:
   a) Find the user by email
   b) Compare the password with the stored hash
   c) Create a JWT token
   d) Return user + token
══════════════════════════════════════════ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // (a) Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // (b) Compare the typed password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check hospital approval status
    if (user.role === "hospital" && user.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your hospital account is pending admin approval.",
        code: "HOSPITAL_PENDING",
      });
    }
    if (user.role === "hospital" && user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your hospital account has been rejected.",
        code: "HOSPITAL_REJECTED",
      });
    }

    // (c) Create a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // (d) Send user info + token back
    res.json({
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
