import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IFundUsage extends Document {
  title: string;
  amount: number;
  description?: string;
  usageDate: Date;
  campaignId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fundUsageSchema = new Schema<IFundUsage>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    usageDate: { type: Date, required: true, default: () => new Date() },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  },
  { timestamps: true }
);

export const FundUsage: Model<IFundUsage> =
  mongoose.models.FundUsage ?? mongoose.model<IFundUsage>("FundUsage", fundUsageSchema);
