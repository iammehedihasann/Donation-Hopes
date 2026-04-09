import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Campaign } from "../models/Campaign";
import { Donation } from "../models/Donation";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const { campaignId, amount } = req.body as { campaignId: string; amount: number };

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const u = await User.findOne({ _id: userId, isDeleted: false }).select("status").session(session);
    if (!u) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
    if (u.status === "suspended") throw new AppError("আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত", 403, "SUSPENDED");

    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign || !campaign.isActive) {
      throw new AppError("ক্যাম্পেইন সক্রিয় নয় বা নেই", 400, "INVALID_CAMPAIGN");
    }

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError("ওয়ালেট পাওয়া যায়নি", 404, "WALLET_NOT_FOUND");
    if (wallet.balance < amount) throw new AppError("ব্যালেন্স অপর্যাপ্ত", 400, "INSUFFICIENT_BALANCE");

    wallet.balance -= amount;
    await wallet.save({ session });

    campaign.collectedAmount += amount;
    await campaign.save({ session });

    await Donation.create([{ userId, campaignId, amount }], { session });
    await Transaction.create(
      [
        {
          userId,
          type: "donate",
          amount,
          status: "completed",
          campaignId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "দান সফল হয়েছে। ধন্যবাদ!",
      data: { campaignId, amount, newBalance: wallet.balance },
    });
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

export const listMyDonations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const items = await Donation.find({ userId })
    .sort({ createdAt: -1 })
    .populate("campaignId", "title collectedAmount goalAmount")
    .limit(50)
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((d) => ({
        id: String(d._id),
        amount: d.amount,
        campaign: d.campaignId,
        createdAt: d.createdAt,
      })),
    },
  });
});
