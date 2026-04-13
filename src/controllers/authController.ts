import { prisma } from "../lib/prisma.js";
import { type Request, type Response } from "express";
import { registerSchema, loginSchema } from "../types/types.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

// --- Register ---
export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid inputs",
      errors: result.error.issues,
    });
  }

  // NOTE: For React Native, pass the verificationToken in the body, not cookies.
  const { name, password, phone, role, verificationToken } = result.data;

  try {
    if (!verificationToken) {
      return res
        .status(401)
        .json({ message: "Verification token is required" });
    }

    let decodedEmail: string;

    try {
      const decoded = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET!
      ) as any;

      if (!decoded.isVerified || !decoded.email) {
        throw new Error("Invalid token payload");
      }

      decodedEmail = decoded.email;
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired verification token" });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: decodedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        email: decodedEmail,
        phone: phone || null,
        ...(role && { role }),
      },
    });

    // Create auth token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Send token directly in the JSON response for React Native to store via SecureStore
    return res.status(201).json({
      message: "User created",
      user: { id: user.id, role: user.role },
      token: token,
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- Login ---
export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid inputs",
        errors: validation.error.format(),
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Send token directly in the JSON response
    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, role: user.role },
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- Logout ---
export const logout = (req: Request, res: Response) => {
  // In a pure JWT mobile setup, logout is handled client-side by deleting the token from SecureStore.
  // The backend just sends a success response.
  res.json({ message: "Logged out successfully" });
};

// --- Me (Verify Session) ---
export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

// --- Update User ---
export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { name, phone } = req.body;

  try {
    const updated = await prisma.user.update({
      where: {
        id: userId as string,
      },
      data: {
        name,
        phone,
      },
      select: { id: true, name: true, phone: true },
    });

    if (updated) {
      return res.status(200).json({
        msg: "Update successful",
        user: updated,
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      message: "Failed to update user",
    });
  }
};
