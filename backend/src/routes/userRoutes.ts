import { Router } from "express";
import * as users from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { changePasswordSchema, updateProfileSchema } from "../validators/schemas";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, users.getProfile);
userRouter.patch("/profile", requireAuth, validateBody(updateProfileSchema), users.updateProfile);
userRouter.get("/profile/summary", requireAuth, users.getProfileSummary);
userRouter.post("/change-password", requireAuth, validateBody(changePasswordSchema), users.changePassword);
