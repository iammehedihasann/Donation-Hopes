import type { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { WithdrawRequest } from "../models/WithdrawRequest";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new AppError("ওয়ালেট পাওয়া যায়নি", 404, "WALLET_NOT_FOUND");
  res.json({
    success: true,
    data: { balance: wallet.balance, walletId: String(wallet._id) },
  });
});

export const createWithdrawRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const { amount } = req.body as { amount: number };

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ensure user is active (backward-compatible safeguard)
    const u = await User.findOne({ _id: userId, isDeleted: false }).select("status");
    if (!u) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
    if ((u as any).status === "suspended") throw new AppError("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত", 403, "SUSPENDED");

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError("ওয়ালেট পাওয়া যায়নি", 404, "WALLET_NOT_FOUND");
    if (wallet.balance < amount) throw new AppError("ব্যালেন্স অপর্যাপ্ত", 400, "INSUFFICIENT_BALANCE");

    const [wr] = await WithdrawRequest.create(
      [{ userId: wallet.userId, amount, status: "pending" }],
      { session }
    );
    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "উত্তোলন অনুরোধ জমা হয়েছে। অ্যাডমিন অনুমোদনের পর টাকা কাটা হবে।",
      data: { requestId: String(wr._id), amount },
    });
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});
