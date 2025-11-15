import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../../config/db/db";

const router = Router();

const adminSigninSchema = z.object({
  mail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

router.post("/signin", async (req, res) => {
  try {
    const parsedData = adminSigninSchema.parse(req.body);
    const { mail, password } = parsedData;

    const admin = await User.findOne({ mail, userType: "admin" });

    if (!admin) {
      return res.status(403).json({ message: "Admin account not found!" });
    }

    if (!admin.isVerified) {
      return res.status(401).json({ message: "Admin email not verified!" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_PASSWORD || "", {
      expiresIn: "30d",
    });

    return res.json({
      message: "Admin logged in successfully",
      token,
      admin: admin.name,
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server Error!" });
  }
});

router.post("/create-admin", async (req, res) => {
  try {
    const { name, mail, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_CREATION_KEY) {
      return res.status(403).json({ message: "Unauthorized request!" });
    }

    const existingAdmin = await User.findOne({ mail });
    if (existingAdmin) {
      return res.status(403).json({ message: "Admin already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      mail,
      password: hashedPassword,
      userType: "admin",
      isVerified: true,
    });

    return res.json({ message: "Admin created successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error!" });
  }
});

export default router;