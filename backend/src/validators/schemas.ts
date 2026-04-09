import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  email: z
    .union([z.string().email("সঠিক ইমেইল দিন"), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

export const loginEmailSchema = z.object({
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, "সঠিক ফোন নম্বর দিন"),
  otp: z.string().min(4, "OTP দিন"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

export const withdrawRequestSchema = z.object({
  amount: z.coerce.number().positive("পরিমাণ ০ এর বেশি হতে হবে"),
});

export const donateSchema = z.object({
  campaignId: z.string().min(1, "ক্যাম্পেইন নির্বাচন করুন"),
  amount: z.coerce.number().positive("পরিমাণ ০ এর বেশি হতে হবে"),
});

export const campaignCreateSchema = z.object({
  title: z.string().min(2),
  goalAmount: z.coerce.number().min(0),
  description: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const adminReviewPaymentSchema = z.object({
  action: z.enum(["verify", "reject"]),
  adminNote: z.string().optional(),
});

export const adminReviewWithdrawSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().optional(),
});

export const fundUsageSchema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  usageDate: z.coerce.date().optional(),
  campaignId: z.string().optional(),
});
