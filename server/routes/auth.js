import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";
import { authenticateToken } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "OWNER",
      department = "IT",
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        emailPreference: true,
        poEmailPreference: true,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, 'amc-secret-2025', {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, 'amc-secret-2025', {
      expiresIn: "7d",
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: "Too many password reset attempts, please try again later.",
  },
});

// Email configuration (you'll need to configure this with your email service)
const transporter = nodemailer.createTransport({
  // Configure with your email service Gmail
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: "vaibhavgupta290105@gmail.com",
    pass: wsql tcfy xvun nmxy,
  },
});

// Forgot Password
router.post(
  "/forgot-password",
  resetLimiter,
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          message:
            "If an account with that email exists, we have sent a password reset link.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send email (configure your email service)
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${resetToken}`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || "admin@igl.com",
          to: email,
          subject: "Password Reset Request For IGL AMC",
          html: `
          <div style="
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 30px;
  background: #f9fafb;
  font-family: 'Segoe UI', Roboto, Arial, sans-serif;
  color: #1f2937;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
">

  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="https://www.iglonline.net/assets/mainpage/assets/images/igl-logo.png" alt="IGL Logo" width="102" style="border-radius: 12px;" />
  </div>

  <!-- Title -->
  <h2 style="
    font-size: 26px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin-bottom: 12px;
  ">
    Password Reset Requested
  </h2>

  <!-- Description -->
  <p style="
    font-size: 16px;
    color: #4b5563;
    text-align: center;
    margin-bottom: 24px;
  ">
    You recently requested to reset your password. Click the button below to continue.
  </p>

  <!-- Reset Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="
      background: linear-gradient(to right, #3b82f6, #6366f1);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 600;
      display: inline-block;
    ">
      Reset Password
    </a>
  </div>

  <!-- Expiry -->
  <p style="
    font-size: 14px;
    color: #6b7280;
    text-align: center;
    margin-top: 10px;
  ">
    This link will expire in <strong>1 hour</strong>.
  </p>

  <!-- Footer -->
  <p style="
    font-size: 13px;
    color: #9ca3af;
    text-align: center;
    margin-top: 24px;
  ">
    If you didn’t request this, you can safely ignore this email.<br/>
    &copy IGL AMC System. All rights reserved.
  </p>
</div>`,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue anyway - don't reveal email sending issues
      }

      res.json({
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ error: "Failed to process password reset request" });
    }
  }
);

// Reset Password
router.post(
  "/reset-password",
  [
    body("token").exists(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { token, password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        emailPreference: true,
        poEmailPreference: true, // ✅ Include this
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user in /me:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
