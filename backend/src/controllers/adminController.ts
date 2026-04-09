import type { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Campaign } from "../models/Campaign";
import { Donation } from "../models/Donation";
import { FundUsage } from "../models/FundUsage";
import { PaymentSubmission } from "../models/PaymentSubmission";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { WithdrawRequest } from "../models/WithdrawRequest";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, donationAgg, savingsAgg, totalCampaignCollected, pendingWithdrawals, pendingPayments] = await Promise.all([
    User.countDocuments({ role: "USER", isDeleted: false }),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
    Campaign.aggregate([{ $group: { _id: null, total: { $sum: "$collectedAmount" } } }]),
    WithdrawRequest.countDocuments({ status: "pending" }),
    PaymentSubmission.countDocuments({ status: "pending" }),
  ]);

  const totalDonations = donationAgg[0]?.total ?? 0;
  const totalSavingsInWallets = savingsAgg[0]?.total ?? 0;
  const totalCollectedCampaigns = totalCampaignCollected[0]?.total ?? 0;

  res.json({
    success: true,
    data: {
      totalUsers: userCount,
      totalDonationsAmount: totalDonations,
      totalSavingsInWallets,
      totalCollectedOnCampaigns: totalCollectedCampaigns,
      pendingWithdrawals,
      pendingPayments,
    },
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find()
    .select("name phone email role status isDeleted createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const wallets = await Wallet.find().lean();
  const balanceByUser = new Map(wallets.map((w) => [String(w.userId), w.balance]));

  res.json({
    success: true,
    data: {
      items: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
        status: (u as any).status,
        isDeleted: (u as any).isDeleted,
        balance: balanceByUser.get(String(u._id)) ?? 0,
        createdAt: u.createdAt,
      })),
    },
  });
});

export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = await User.findById(id).select("name phone email role status isDeleted createdAt").lean();
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");

  const [wallet, donationAgg, txCount] = await Promise.all([
    Wallet.findOne({ userId: id }).lean(),
    Donation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Transaction.countDocuments({ userId: id }),
  ]);

  res.json({
    success: true,
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: (user as any).status,
        isDeleted: (user as any).isDeleted,
        createdAt: user.createdAt,
      },
      walletBalance: wallet?.balance ?? 0,
      totalDonation: donationAgg[0]?.total ?? 0,
      donationCount: donationAgg[0]?.count ?? 0,
      transactionCount: txCount,
    },
  });
});

export const userAction = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { action } = req.body as { action: "suspend" | "activate" | "soft_delete" };

  const user = await User.findById(id);
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");

  if (action === "soft_delete") {
    user.isDeleted = true as any;
    await user.save();
    res.json({ success: true, message: "ব্যবহারকারী ডিলিট করা হয়েছে (soft)" });
    return;
  }
  if (action === "suspend") {
    (user as any).status = "suspended";
    await user.save();
    res.json({ success: true, message: "ব্যবহারকারী স্থগিত হয়েছে" });
    return;
  }
  (user as any).status = "active";
  await user.save();
  res.json({ success: true, message: "ব্যবহারকারী সক্রিয় হয়েছে" });
});

export const listPendingPayments = asyncHandler(async (_req: Request, res: Response) => {
  const items = await PaymentSubmission.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("userId", "name phone")
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((p) => ({
        id: String(p._id),
        user: p.userId,
        method: p.method,
        amount: p.amount,
        screenshotUrl: `/uploads/${p.screenshotPath}`,
        createdAt: p.createdAt,
      })),
    },
  });
});

export const reviewPayment = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.authUser!.id;
  const { id } = req.params;
  const { action, adminNote } = req.body as { action: "verify" | "reject"; adminNote?: string };

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await PaymentSubmission.findById(id).session(session);
    if (!payment) throw new AppError("রেকর্ড পাওয়া যায়নি", 404, "NOT_FOUND");
    if (payment.status !== "pending") throw new AppError("ইতিমধ্যে প্রক্রিয়াকৃত", 400, "INVALID_STATE");

    if (action === "reject") {
      payment.status = "rejected";
      payment.reviewedBy = new mongoose.Types.ObjectId(adminId);
      payment.reviewedAt = new Date();
      payment.adminNote = adminNote;
      await payment.save({ session });
      await session.commitTransaction();
      res.json({ success: true, message: "পেমেন্ট প্রত্যাখ্যান করা হয়েছে" });
      return;
    }

    const wallet = await Wallet.findOne({ userId: payment.userId }).session(session);
    if (!wallet) throw new AppError("ওয়ালেট পাওয়া যায়নি", 404, "WALLET_NOT_FOUND");

    wallet.balance += payment.amount;
    await wallet.save({ session });

    payment.status = "verified";
    payment.reviewedBy = new mongoose.Types.ObjectId(adminId);
    payment.reviewedAt = new Date();
    payment.adminNote = adminNote;
    await payment.save({ session });

    await Transaction.create(
      [
        {
          userId: payment.userId,
          type: "deposit",
          amount: payment.amount,
          status: "completed",
          paymentSubmissionId: payment._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, message: "পেমেন্ট যাচাই হয়েছে এবং ব্যালেন্স যুক্ত হয়েছে" });
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

export const listPendingWithdrawals = asyncHandler(async (_req: Request, res: Response) => {
  const items = await WithdrawRequest.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("userId", "name phone")
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((w) => ({
        id: String(w._id),
        user: w.userId,
        amount: w.amount,
        createdAt: w.createdAt,
      })),
    },
  });
});

export const reviewWithdrawal = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.authUser!.id;
  const { id } = req.params;
  const { action, adminNote } = req.body as { action: "approve" | "reject"; adminNote?: string };

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const wr = await WithdrawRequest.findById(id).session(session);
    if (!wr) throw new AppError("অনুরোধ পাওয়া যায়নি", 404, "NOT_FOUND");
    if (wr.status !== "pending") throw new AppError("ইতিমধ্যে প্রক্রিয়াকৃত", 400, "INVALID_STATE");

    if (action === "reject") {
      wr.status = "rejected";
      wr.reviewedBy = new mongoose.Types.ObjectId(adminId);
      wr.reviewedAt = new Date();
      wr.adminNote = adminNote;
      await wr.save({ session });
      await Transaction.create(
        [
          {
            userId: wr.userId,
            type: "withdraw",
            amount: wr.amount,
            status: "rejected",
            withdrawRequestId: wr._id,
            note: adminNote,
          },
        ],
        { session }
      );
      await session.commitTransaction();
      res.json({ success: true, message: "উত্তোলন প্রত্যাখ্যান করা হয়েছে" });
      return;
    }

    const wallet = await Wallet.findOne({ userId: wr.userId }).session(session);
    if (!wallet) throw new AppError("ওয়ালেট পাওয়া যায়নি", 404, "WALLET_NOT_FOUND");
    if (wallet.balance < wr.amount) throw new AppError("ব্যবহারকারীর ব্যালেন্স এখন অপর্যাপ্ত", 400, "INSUFFICIENT_BALANCE");

    wallet.balance -= wr.amount;
    await wallet.save({ session });

    wr.status = "approved";
    wr.reviewedBy = new mongoose.Types.ObjectId(adminId);
    wr.reviewedAt = new Date();
    wr.adminNote = adminNote;
    await wr.save({ session });

    await Transaction.create(
      [
        {
          userId: wr.userId,
          type: "withdraw",
          amount: wr.amount,
          status: "completed",
          withdrawRequestId: wr._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, message: "উত্তোলন অনুমোদিত হয়েছে" });
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { title, goalAmount, description, isActive } = req.body as {
    title: string;
    goalAmount: number;
    description?: string;
    isActive?: boolean;
  };
  const c = await Campaign.create({
    title,
    goalAmount,
    collectedAmount: 0,
    description,
    isActive: isActive ?? true,
  });
  res.status(201).json({
    success: true,
    message: "ক্যাম্পেইন তৈরি হয়েছে",
    data: { id: String(c._id) },
  });
});

export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const c = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) throw new AppError("ক্যাম্পেইন পাওয়া যায়নি", 404, "NOT_FOUND");
  res.json({ success: true, message: "ক্যাম্পেইন আপডেট হয়েছে" });
});

export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const c = await Campaign.findByIdAndDelete(req.params.id);
  if (!c) throw new AppError("ক্যাম্পেইন পাওয়া যায়নি", 404, "NOT_FOUND");
  res.json({ success: true, message: "ক্যাম্পেইন মুছে ফেলা হয়েছে" });
});

export const listAllCampaignsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Campaign.find().sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: {
      items: items.map((c) => ({
        id: String(c._id),
        title: c.title,
        goalAmount: c.goalAmount,
        collectedAmount: c.collectedAmount,
        isActive: c.isActive,
        createdAt: c.createdAt,
      })),
    },
  });
});

export const createFundUsage = asyncHandler(async (req: Request, res: Response) => {
  const { title, amount, description, usageDate, campaignId } = req.body as {
    title: string;
    amount: number;
    description?: string;
    usageDate?: Date;
    campaignId?: string;
  };
  const doc = await FundUsage.create({
    title,
    amount,
    description,
    usageDate: usageDate ?? new Date(),
    ...(campaignId && isValidObjectId(campaignId) ? { campaignId } : {}),
  });
  res.status(201).json({
    success: true,
    message: "খরচের রেকর্ড যুক্ত হয়েছে",
    data: { id: String(doc._id) },
  });
});

export const listFundUsage = asyncHandler(async (_req: Request, res: Response) => {
  const items = await FundUsage.find().sort({ usageDate: -1 }).limit(100).lean();
  res.json({
    success: true,
    data: {
      items: items.map((f) => ({
        id: String(f._id),
        title: f.title,
        amount: f.amount,
        description: f.description,
        usageDate: f.usageDate,
        campaignId: f.campaignId ? String(f.campaignId) : undefined,
      })),
    },
  });
});

export const listAllDonations = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Donation.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("userId", "name phone")
    .populate("campaignId", "title")
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((d) => ({
        id: String(d._id),
        amount: d.amount,
        user: d.userId,
        campaign: d.campaignId,
        createdAt: d.createdAt,
      })),
    },
  });
});
