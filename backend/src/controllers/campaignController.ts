import type { Request, Response } from "express";
import { Campaign } from "../models/Campaign";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const listCampaigns = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Campaign.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: {
      items: items.map((c) => ({
        id: String(c._id),
        title: c.title,
        goalAmount: c.goalAmount,
        collectedAmount: c.collectedAmount,
        description: c.description,
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
        progress:
          c.goalAmount > 0 ? Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100)) : 0,
        createdAt: c.createdAt,
      },
    },
  });
});
