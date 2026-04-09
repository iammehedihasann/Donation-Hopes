import type { Request, Response } from "express";
import { Donation } from "../models/Donation";
import { CampaignUpdate } from "../models/CampaignUpdate";
import { Campaign } from "../models/Campaign";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const listCampaigns = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Campaign.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  const ids = items.map((c) => c._id);
  const donorAgg = await Donation.aggregate([
    { $match: { campaignId: { $in: ids } } },
    { $group: { _id: "$campaignId", donors: { $addToSet: "$userId" } } },
    { $project: { count: { $size: "$donors" } } },
  ]);
  const donorCountByCampaign = new Map(donorAgg.map((r) => [String(r._id), r.count as number]));

  res.json({
    success: true,
    data: {
      items: items.map((c) => ({
        id: String(c._id),
        title: c.title,
        goalAmount: c.goalAmount,
        collectedAmount: c.collectedAmount,
        description: c.description,
        donorCount: donorCountByCampaign.get(String(c._id)) ?? 0,
        progress:
          c.goalAmount > 0 ? Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100)) : 0,
        createdAt: c.createdAt,
      })),
    },
  });
});

export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
  const c = await Campaign.findById(req.params.id).lean();
  if (!c) throw new AppError("ক্যাম্পেইন পাওয়া যায়নি", 404, "NOT_FOUND");

  const [donorAgg, updates] = await Promise.all([
    Donation.aggregate([
      { $match: { campaignId: c._id } },
      { $group: { _id: "$campaignId", donors: { $addToSet: "$userId" } } },
      { $project: { count: { $size: "$donors" } } },
    ]),
    CampaignUpdate.find({ campaignId: c._id }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const donorCount = donorAgg[0]?.count ?? 0;

  res.json({
    success: true,
    data: {
      campaign: {
        id: String(c._id),
        title: c.title,
        goalAmount: c.goalAmount,
        collectedAmount: c.collectedAmount,
        description: c.description,
        isActive: c.isActive,
        donorCount,
        progress:
          c.goalAmount > 0 ? Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100)) : 0,
        createdAt: c.createdAt,
        updates: updates.map((u) => ({
          id: String(u._id),
          text: u.text,
          imageUrl: u.imagePath ? `/uploads/${u.imagePath}` : undefined,
          createdAt: u.createdAt,
        })),
      },
    },
  });
});
