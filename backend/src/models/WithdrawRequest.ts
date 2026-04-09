import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type WithdrawRequestStatus = "pending" | "approved" | "rejected";

export interface IWithdrawRequest extends Document {
  userId: Types.ObjectId;
  amount: number;
  status: WithdrawRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawRequestSchema = new Schema<IWithdrawRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

withdrawRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const WithdrawRequest: Model<IWithdrawRequest> =
  mongoose.models.WithdrawRequest ??
  mongoose.model<IWithdrawRequest>("WithdrawRequest", withdrawRequestSchema);
