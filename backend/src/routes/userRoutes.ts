import { Router } from "express";
import * as users from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema } from "../validators/schemas";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, users.getProfile);
userRouter.patch("/profile", requireAuth, validateBody(updateProfileSchema), users.updateProfile);
