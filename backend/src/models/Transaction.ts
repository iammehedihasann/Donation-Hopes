import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type TransactionType = "deposit" | "withdraw" | "donate";
export type TransactionStatus = "pending" | "completed" | "failed" | "rejected";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  campaignId?: Types.ObjectId;
  paymentSubmissionId?: Types.ObjectId;
  withdrawRequestId?: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw", "donate"], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "rejected"],
      default: "pending",
    },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    paymentSubmissionId: { type: Schema.Types.ObjectId, ref: "PaymentSubmission" },
    withdrawRequestId: { type: Schema.Types.ObjectId, ref: "WithdrawRequest" },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ?? mongoose.model<ITransaction>("Transaction", transactionSchema);
