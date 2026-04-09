import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IDonation extends Document {
  userId: Types.ObjectId;
  campaignId: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

donationSchema.index({ campaignId: 1, createdAt: -1 });

export const Donation: Model<IDonation> =
  mongoose.models.Donation ?? mongoose.model<IDonation>("Donation", donationSchema);
