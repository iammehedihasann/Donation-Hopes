import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ICampaignUpdate extends Document {
  campaignId: Types.ObjectId;
  text: string;
  imagePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignUpdateSchema = new Schema<ICampaignUpdate>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    text: { type: String, required: true, trim: true },
    imagePath: { type: String, trim: true },
  },
  { timestamps: true }
);

campaignUpdateSchema.index({ campaignId: 1, createdAt: -1 });

export const CampaignUpdate: Model<ICampaignUpdate> =
  mongoose.models.CampaignUpdate ??
  mongoose.model<ICampaignUpdate>("CampaignUpdate", campaignUpdateSchema);

