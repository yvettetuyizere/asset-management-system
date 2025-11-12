// src/utils/email.util.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.MAIL_FROM || "noreply@rtb.com",
    to: email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.MAIL_FROM || "noreply@rtb.com",
    to: email,
    subject: "Welcome to RTB Asset Management System",
    html: `
      <h1>Welcome, ${fullName}!</h1>
      <p>Your account has been successfully created.</p>
      <p>You can now log in and start using the RTB Asset Management System.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
