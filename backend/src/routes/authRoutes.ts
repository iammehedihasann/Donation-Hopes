import { Router } from "express";
import * as auth from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authRouteLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import {
  loginEmailSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/schemas";

export const authRouter = Router();

authRouter.use(authRouteLimiter);

authRouter.post("/register", validateBody(registerSchema), auth.register);
authRouter.post("/login/email", validateBody(loginEmailSchema), auth.loginEmail);
authRouter.post("/login/phone/send-otp", validateBody(sendOtpSchema), auth.sendPhoneOtp);
authRouter.post("/login/phone/verify", validateBody(verifyOtpSchema), auth.verifyPhoneOtp);
authRouter.get("/me", requireAuth, auth.me);
