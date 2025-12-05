// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyOtpDto } from "../dtos/auth.dto";
import { validateDto } from "../utils/validator.util";
import { hashPassword, comparePassword } from "../utils/password.util";
import { generateToken, generateResetToken, verifyToken } from "../utils/jwt.util";
import { sendWelcomeEmail, sendResetPasswordEmail } from "../utils/email.util";
import { tokenBlacklist } from "../utils/tokenBlacklist.util";
import { AuthRequest } from "../middlewares/auth.middleware";

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { isValid, errors } = await validateDto(RegisterDto, req.body);
    if (!isValid) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const { fullName, username, email, password, phoneNumber, gender } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(409).json({ message: "User with this email or username already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = userRepository.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      gender,
      role: "school", // Default role
    });

    await userRepository.save(user);

    // Send welcome email (optional, don't fail if it doesn't work)
    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        gender: user.gender,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { isValid, errors } = await validateDto(LoginDto, req.body);
    if (!isValid) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await userRepository.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    // Credentials valid — create OTP, send via email and wait for verification
    try {
      const otp = await createOtpForUser(user.id, 5);
      await sendOtpEmail(user.email, otp.code);
      res.status(200).json({ message: "OTP sent to registered email. Please verify to complete login." });
    } catch (emailError) {
      console.error("Failed to create/send OTP:", emailError);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isValid, errors } = await validateDto(VerifyOtpDto, req.body);
    if (!isValid) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const { emailOrUsername, otp } = req.body;

    const user = await userRepository.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await verifyOtpForUser(user.id, otp);
    if (!ok) {
      res.status(401).json({ message: "Invalid or expired OTP" });
      return;
    }

    // OTP valid — issue token and return success
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login verified",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        gender: user.gender,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { isValid, errors } = await validateDto(ForgotPasswordDto, req.body);
    if (!isValid) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const { email } = req.body;

    // Find user
    const user = await userRepository.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.status(200).json({ message: "If the email exists, a reset link has been sent" });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken(user.id);

    // Send reset email
    try {
      await sendResetPasswordEmail(email, resetToken);
      res.status(200).json({ message: "If the email exists, a reset link has been sent" });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      res.status(500).json({ message: "Failed to send reset email" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { isValid, errors } = await validateDto(ResetPasswordDto, req.body);
    if (!isValid) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const { token, newPassword } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Find user
    const user = await userRepository.findOne({ where: { id: decoded.id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await userRepository.save(user);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.token;
    
    if (!token) {
      res.status(400).json({ message: "No token provided" });
      return;
    }

    // Get the decoded token to access expiration time
    const decoded = verifyToken(token);
    
    // Add token to blacklist with its expiration time
    // The expiration time is typically set in the JWT (exp claim)
    const jwtPayload = decoded as any;
    const expiresAt = jwtPayload.exp || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // Default to 7 days
    
    tokenBlacklist.addToBlacklist(token, expiresAt);

    res.status(200).json({ 
      message: "Logout successful",
      success: true 
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
