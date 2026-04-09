import type { Request, Response } from "express";
import { Campaign } from "../models/Campaign";
import { CampaignUpdate } from "../models/CampaignUpdate";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { relativeScreenshotPath } from "../config/upload";

export const listUpdatesPublic = asyncHandler(async (req: Request, res: Response) => {
  const campaignId = String(req.params.id);
  const items = await CampaignUpdate.find({ campaignId }).sort({ createdAt: -1 }).limit(30).lean();
  res.json({
    success: true,
    data: {
      items: items.map((u) => ({
        id: String(u._id),
        text: u.text,
        imageUrl: u.imagePath ? `/uploads/${u.imagePath}` : undefined,
        createdAt: u.createdAt,
      })),
    },
  });
});

export const createUpdateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const campaignId = String(req.params.id);
  const { text } = req.body as { text?: string };
  if (!text?.trim()) throw new AppError("টেক্সট দিন", 400, "VALIDATION_ERROR");

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new AppError("ক্যাম্পেইন পাওয়া যায়নি", 404, "NOT_FOUND");

  const file = req.file;
  const imagePath = file ? relativeScreenshotPath(file.filename) : undefined;

  const doc = await CampaignUpdate.create({
    campaignId,
    text: text.trim(),
    ...(imagePath ? { imagePath } : {}),
  });

  res.status(201).json({
    success: true,
    message: "আপডেট যুক্ত হয়েছে",
    data: { id: String(doc._id) },
  });
});

