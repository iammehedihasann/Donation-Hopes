import type { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.authUser!.id;
  const user = await User.findById(id);
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");
  res.json({
    success: true,
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.authUser!.id;
  const { name, email } = req.body as { name?: string; email?: string };

  const user = await User.findById(id);
  if (!user) throw new AppError("ব্যবহারকারী পাওয়া যায়নি", 404, "USER_NOT_FOUND");

  if (name) user.name = name;
  if (email !== undefined) {
    if (email) {
      const taken = await User.findOne({ email, _id: { $ne: id } });
      if (taken) throw new AppError("এই ইমেইল ব্যবহৃত", 409, "EMAIL_EXISTS");
      user.email = email;
    } else {
      user.set("email", undefined);
    }
  }
  await user.save();

  res.json({
    success: true,
    message: "প্রোফাইল আপডেট হয়েছে",
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    },
  });
});
