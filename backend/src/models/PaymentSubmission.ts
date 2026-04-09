import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type PaymentMethod = "bkash" | "nagad" | "rocket";
export type PaymentSubmissionStatus = "pending" | "verified" | "rejected";

export interface IPaymentSubmission extends Document {
  userId: Types.ObjectId;
  method: PaymentMethod;
  amount: number;
  screenshotPath: string;
  status: PaymentSubmissionStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSubmissionSchema = new Schema<IPaymentSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["bkash", "nagad", "rocket"], required: true },
    amount: { type: Number, required: true, min: 0 },
    screenshotPath: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSubmissionSchema.index({ status: 1, createdAt: -1 });

export const PaymentSubmission: Model<IPaymentSubmission> =
  mongoose.models.PaymentSubmission ??
  mongoose.model<IPaymentSubmission>("PaymentSubmission", paymentSubmissionSchema);
