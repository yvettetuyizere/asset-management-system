// src/routes/profile.routes.ts
import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/", getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/", updateProfile);

/**
 * @route   PUT /api/profile/password
 * @desc    Change user password
 * @access  Private
 */
router.put("/password", changePassword);

/**
 * @route   POST /api/profile/picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post("/picture", upload.single("profilePicture"), uploadProfilePicture);

/**
 * @route   DELETE /api/profile/picture
 * @desc    Delete profile picture
 * @access  Private
 */
router.delete("/picture", deleteProfilePicture);

export default router;
