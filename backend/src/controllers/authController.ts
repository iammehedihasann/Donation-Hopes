import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { signAccessToken } from "../lib/jwt";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { setOtp, verifyOtp } from "../utils/otpStore";

function publicUser(u: {
  _id?: unknown;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
}) {
  const id = u.id ?? String(u._id);
  return { id, name: u.name, phone: u.phone, email: u.email, role: u.role };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, password, email } = req.body as {
    name: string;
    phone: string;
    password: string;
    email?: string;
  };

  const existsPhone = await User.findOne({ phone });
  if (existsPhone) throw new AppError("এই ফোন নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে", 409, "PHONE_EXISTS");

  if (email) {
    const existsEmail = await User.findOne({ email });
    if (existsEmail) throw new AppError("এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে", 409, "EMAIL_EXISTS");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    password: hash,
    ...(email ? { email } : {}),
    role: "USER",
  });
  await Wallet.create({ userId: user._id, balance: 0 });

  const token = signAccessToken(String(user._id), user.role);

  res.status(201).json({
    success: true,
    message: "নিবন্ধন সফল",
    data: {
      token,
      user: publicUser({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      }),
    },
  });
});

export const loginEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("ইমেইল বা পাসওয়ার্ড ভুল", 401, "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("ইমেইল বা পাসওয়ার্ড ভুল", 401, "INVALID_CREDENTIALS");

  const token = signAccessToken(String(user._id), user.role);
  res.json({
    success: true,
    message: "লগইন সফল",
    data: {
      token,
      user: publicUser({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      }),
    },
  });
});

export const sendPhoneOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body as { phone: string };
  const user = await User.findOne({ phone });
  if (!user) throw new AppError("এই নম্বরে কোনো অ্যাকাউন্ট নেই। আগে নিবন্ধন করুন।", 404, "USER_NOT_FOUND");

  const otp = process.env.MOCK_OTP_FIXED ?? String(Math.floor(100000 + Math.random() * 900000));
  setOtp(phone, otp);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[OTP mock] ${phone} -> ${otp}`);
  }

  res.json({
    success: true,
    message: "OTP পাঠানো হয়েছে (মক)",
    data: process.env.NODE_ENV !== "production" ? { devOtp: otp } : {},
  });
});

export const verifyPhoneOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body as { phone: string; otp: string };
  const user = await User.findOne({ phone });
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");

  const mockAlways = process.env.MOCK_OTP_ALWAYS_OK === "true";
  const ok = mockAlways || verifyOtp(phone, otp);
  if (!ok) throw new AppError("OTP ভুল বা মেয়াদ শেষ", 400, "INVALID_OTP");

  const token = signAccessToken(String(user._id), user.role);
  res.json({
    success: true,
    message: "লগইন সফল",
    data: {
      token,
      user: publicUser({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      }),
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const id = req.authUser?.id;
  if (!id) throw new AppError("লগইন প্রয়োজন", 401, "UNAUTHORIZED");
  const user = await User.findById(id);
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
  res.json({
    success: true,
    data: {
      user: publicUser({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      }),
    },
  });
});
