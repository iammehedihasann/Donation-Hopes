import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet ?? mongoose.model<IWallet>("Wallet", walletSchema);
