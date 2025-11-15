import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../../config/db/db";

const router = Router();

const JWT_PASSWORD = process.env.JWT_PASSWORD || "";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  mail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

//@ts-ignore
router.post("/signup", async (req, res) => {
  try {
    const parsedData = signupSchema.parse(req.body);
    const { name, mail, password } = parsedData;

    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(403).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = await User.create({
      name,
      mail,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
    });

    const verifyUrl = `${
      process.env.FRONTEND_URL || ""
    }/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Pizza System" <${process.env.EMAIL_USER}>`,
      to: mail,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: sans-serif; padding: 16px;">
          <h2>Verify your email</h2>
          <p>Click below to verify your account. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" 
            style="display:inline-block;background:#4b6bfb;color:white;padding:10px 18px;
            border-radius:8px;text-decoration:none;font-weight:500;margin-top:10px;">
            Verify Email
          </a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Account created. Please verify your email.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error!" });
  }
});

//@ts-ignore
router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//@ts-ignore
router.post("/signin", async (req, res) => {
  try {
    const parsedData = signinSchema.parse(req.body);
    const { mail, password } = parsedData;

    const user = await User.findOne({ mail });
    if (!user) {
      return res.status(403).json({ message: "Invalid email or password!" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_PASSWORD || "", {
      expiresIn: "30d",
    });

    return res.json({
      token: token,
      user: user.name,
    });
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: "Server Error!" });
  }
});

//@ts-ignore
router.post("/forgot-password", async (req, res) => {
  const { mail } = req.body;

  try {
    const user = await User.findOne({ mail });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // valid for 15 min

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${
      process.env.FRONTEND_URL || ""
    }/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Pizza System" <${process.env.EMAIL_USER}>`,
      to: mail,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; padding: 16px;">
          <h2>Reset your password</h2>
          <p>Click below to reset your password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" 
            style="display:inline-block;background:#4b6bfb;color:white;padding:10px 18px;
            border-radius:8px;text-decoration:none;font-weight:500;margin-top:10px;">
            Reset Password
          </a>
          <p style="margin-top:20px;">If you didn’t request this, just ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//@ts-ignore
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @ts-ignore
router.post("/signout", async (req, res) => {
  try {
    res.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
