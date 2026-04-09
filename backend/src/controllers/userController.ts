import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Donation } from "../models/Donation";
import { Wallet } from "../models/Wallet";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.authUser!.id;
  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
  if (user.status === "suspended") throw new AppError("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত", 403, "SUSPENDED");
  res.json({
    success: true,
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.authUser!.id;
  const { name, email } = req.body as { name?: string; email?: string };

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
  if (user.status === "suspended") throw new AppError("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত", 403, "SUSPENDED");

  if (name) user.name = name;
  if (email !== undefined) {
    if (email) {
      const taken = await User.findOne({ email, _id: { $ne: id } });
      if (taken) throw new AppError("এই ইমেইল ব্যবহৃত", 409, "EMAIL_EXISTS");
      user.email = email;
    } else {
      user.set("email", undefined);
    }
  }
  await user.save();

  res.json({
    success: true,
    message: "প্রোফাইল আপডেট হয়েছে",
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
  });
});

export const getProfileSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;

  const [wallet, donationAgg] = await Promise.all([
    Wallet.findOne({ userId }).lean(),
    Donation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ])
  ]);

  const totalDonation = donationAgg[0]?.total ?? 0;
  const donationCount = donationAgg[0]?.count ?? 0;

  res.json({
    success: true,
    data: {
      walletBalance: wallet?.balance ?? 0,
      totalDonation,
      donationCount,
    },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

  const user = await User.findOne({ _id: userId, isDeleted: false }).select("+password status");
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
  if (user.status === "suspended") throw new AppError("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত", 403, "SUSPENDED");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new AppError("বর্তমান পাসওয়ার্ড ভুল", 400, "INVALID_PASSWORD");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "পাসওয়ার্ড পরিবর্তন হয়েছে" });
});
