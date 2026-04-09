import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "ADMIN" | "USER";
export type UserStatus = "active" | "suspended";

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1, isDeleted: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
