import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  goalAmount: number;
  collectedAmount: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    goalAmount: { type: Number, required: true, min: 0 },
    collectedAmount: { type: Number, required: true, default: 0, min: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ?? mongoose.model<ICampaign>("Campaign", campaignSchema);
