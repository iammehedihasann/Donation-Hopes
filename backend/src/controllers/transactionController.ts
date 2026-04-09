import type { Request, Response } from "express";
import { Transaction } from "../models/Transaction";
import { asyncHandler } from "../utils/asyncHandler";

export const listMyTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser!.id;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const items = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((t) => ({
        id: String(t._id),
        type: t.type,
        amount: t.amount,
        status: t.status,
        campaignId: t.campaignId ? String(t.campaignId) : undefined,
        note: t.note,
        createdAt: t.createdAt,
      })),
    },
  });
});
