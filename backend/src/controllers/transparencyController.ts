import type { Request, Response } from "express";
import { Campaign } from "../models/Campaign";
import { Donation } from "../models/Donation";
import { FundUsage } from "../models/FundUsage";
import { Wallet } from "../models/Wallet";
import { asyncHandler } from "../utils/asyncHandler";

export const getTransparency = asyncHandler(async (_req: Request, res: Response) => {
  const [donationAgg, fundAgg, savingsAgg, campaigns, fundUsages] = await Promise.all([
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    FundUsage.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
    Campaign.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
    FundUsage.find().sort({ usageDate: -1 }).limit(30).lean(),
  ]);

  const totalDonations = donationAgg[0]?.total ?? 0;
  const totalFundUsage = fundAgg[0]?.total ?? 0;
  const totalSavingsHeld = savingsAgg[0]?.total ?? 0;

  res.json({
    success: true,
    data: {
      totalDonations,
      totalReportedFundUsage: totalFundUsage,
      totalSavingsInUserWallets: totalSavingsHeld,
      campaigns: campaigns.map((c) => ({
        id: String(c._id),
        title: c.title,
        goalAmount: c.goalAmount,
        collectedAmount: c.collectedAmount,
        progress:
          c.goalAmount > 0 ? Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100)) : 0,
      })),
      fundUsages: fundUsages.map((f) => ({
        id: String(f._id),
        title: f.title,
        amount: f.amount,
        description: f.description,
        usageDate: f.usageDate,
      })),
    },
  });
});
