import type { Request, Response } from "express";
import { z } from "zod";
import { PaymentSubmission } from "../models/PaymentSubmission";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { relativeScreenshotPath } from "../config/upload";

const submitBodySchema = z.object({
  method: z.enum(["bkash", "nagad", "rocket"]),
  amount: z.coerce.number().positive("পরিমাণ সঠিক দিন"),
});

export const submitPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const file = req.file;
  if (!file) throw new AppError("পেমেন্ট স্ক্রিনশট আপলোড করুন", 400, "SCREENSHOT_REQUIRED");

  const parsed = submitBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "ইনপুট সঠিক নয়", 400, "VALIDATION_ERROR");
  }

  const { method, amount } = parsed.data;
  const screenshotPath = relativeScreenshotPath(file.filename);

  const doc = await PaymentSubmission.create({
    userId,
    method,
    amount,
    screenshotPath,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "জমার অনুরোধ জমা হয়েছে। অ্যাডমিন যাচাই করলে ব্যালেন্স যুক্ত হবে।",
    data: { id: String(doc._id), method, amount },
  });
});

export const listMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const items = await PaymentSubmission.find({ userId }).sort({ createdAt: -1 }).limit(30).lean();
  res.json({
    success: true,
    data: {
      items: items.map((p) => ({
        id: String(p._id),
        method: p.method,
        amount: p.amount,
        status: p.status,
        screenshotUrl: `/uploads/${p.screenshotPath}`,
        createdAt: p.createdAt,
      })),
    },
  });
});
