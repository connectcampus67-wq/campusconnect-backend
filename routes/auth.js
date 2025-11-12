import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
// =======================
// Forgot Password + OTP
// =======================
import nodemailer from "nodemailer";
import crypto from "crypto";

let otpStore = {}; // temporary memory store (optional: can move to DB later)

// Send OTP via email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
  from: `"CampusConnect Portal" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "CampusConnect Password Reset OTP",
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 20px; text-align: center;">
          <img src="https://ibb.co/mrGZmFXd" alt="CampusConnect Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid white; margin-bottom: 10px;">
          <h2 style="color: white; margin: 0;">CampusConnect</h2>
          <p style="color: #e0e0ff; font-size: 14px;">Your trusted college portal</p>
        </div>

        <div style="padding: 20px; text-align: center;">
          <h3 style="color: #333;">Password Reset Request</h3>
          <p style="color: #555; font-size: 15px;">We received a request to reset your password. Use the OTP below to complete the process:</p>
          <h1 style="letter-spacing: 4px; color: #4f46e5; margin: 20px 0;">${otp}</h1>
          <p style="color: #999; font-size: 13px;">This OTP is valid for 10 minutes.</p>
          <a href="#" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, #4f46e5, #9333ea); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to CampusConnect</a>
        </div>

        <div style="background: #f2f2f2; padding: 10px; text-align: center; color: #777; font-size: 12px;">
          © 2025 CampusConnect. All rights reserved.<br>
          <span style="color: #4f46e5;">connectcampus67@gmail.com</span>
        </div>
      </div>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and reset password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (otpStore[email] && otpStore[email] == otp) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updateOne({ email }, { password: hashedPassword });
      delete otpStore[email];
      res.json({ message: "✅ Password reset successful!" });
    } else {
      res.status(400).json({ message: "❌ Invalid OTP." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
