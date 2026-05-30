import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { addressSchema, updateAddressSchema } from "../types/types.js";
import { protect } from "../middlewares/authMiddleware.js";

import "dotenv/config";

// --- Add a New Address ---
export const addAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  const validation = addressSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid address data",
      errors: validation.error.format(),
    });
  }

  const data = validation.data;

  try {
    const newAddress = await prisma.address.create({
      data: {
        ...data,
        userId: userId, // Link the address to the logged-in user
      } as any,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({ message: "Failed to add address" });
  }
};

// --- Delete an Address ---
export const deleteAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const addressId = req.params.id as string;

  try {
    // 1. Security Check: Ensure they own the address before deleting
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!existingAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    // 2. Delete
    await prisma.address.delete({
      where: { id: addressId },
    });

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ message: "Failed to delete address" });
  }
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

// @desc    Get current user profile
// @route   GET /api/users/me
export const getUserProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: { id: true, name: true, phone: true, role: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

// @desc    Get logged in user's addresses
// @route   GET /api/users/addresses
export const getMyAddresses = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" }, // Shows the newest addresses first
    });

    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// @desc    Set a specific address as the active/default
// @route   PATCH /api/user/addresses/:id/default
export const setActiveAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const addressId = req.params.id as string;

  try {
    // Execute both updates as a single atomic transaction
    await prisma.$transaction([
      // 1. Remove default status from ALL of this user's addresses
      prisma.address.updateMany({
        where: { userId: userId },
        data: { isDefault: false },
      }),
      // 2. Set the requested address to default
      prisma.address.update({
        where: { id: addressId, userId: userId },
        data: { isDefault: true },
      }),
    ]);

    return res
      .status(200)
      .json({ message: "Active address updated successfully" });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    return res.status(500).json({ message: "Failed to set active address" });
  }
};
