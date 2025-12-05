// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, forgotPassword, resetPassword, verifyOtp } from "../controllers/auth.controller";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP sent to email and complete login
 * @access  Public
 */
router.post("/verify-otp", verifyOtp);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", resetPassword);

export default router;
