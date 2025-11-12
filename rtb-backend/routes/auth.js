import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();


// In-memory OTP store (for demo)
global.otpStore = {};

// Login with username and password
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  console.log("Login attempt:", { username, password: "***" });
  
  try {
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    console.log("User found:", user ? { id: user._id, username: user.username, email: user.email } : "Not found");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Return user info and role
    res.json({ 
      token: "jwt-token-placeholder",
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send OTP for login
// Send OTP for login (accept username OR email)
router.post("/send-otp", async (req, res) => {
  const { identifier } = req.body; // could be username or email
  console.log("Sending OTP to identifier:", identifier);

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: "User not found" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  global.otpStore[user.email] = { otp, role: user.role, createdAt: Date.now() };

  console.log("Generated OTP for:", user.email, otp);

  try {
    // Send email if credentials are set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "AMS OTP",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      });

      console.log("Email sent successfully");
      return res.json({ message: "OTP sent to email" });
    } else {
      console.log("Email credentials not configured. Returning OTP in response.");
      return res.json({ message: "OTP generated (email not sent)", otp });
    }
  } catch (emailError) {
    console.error("Error sending email:", emailError);
    return res.status(500).json({ message: "Failed to send OTP via email" });
  }
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = global.otpStore[email];

  if (!record) return res.status(400).json({ message: "OTP expired or invalid" });
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  delete global.otpStore[email]; // Remove OTP after verification
  res.json({ role: record.role });
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  global.otpStore[email] = { otp, role: user.role, createdAt: Date.now() };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "RTB Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  res.json({ message: "OTP sent to email" });
});

// Verify reset OTP
router.post("/verify-reset-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = global.otpStore[email];

  if (!record) return res.status(400).json({ message: "OTP expired or invalid" });
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  res.json({ message: "OTP verified successfully" });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = global.otpStore[email];

  if (!record || record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { $set: { password: hashedPassword } });

  delete global.otpStore[email];
  res.json({ message: "Password reset successful" });
});

export default router;
