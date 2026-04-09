import { Router } from "express";
import * as payments from "../controllers/paymentController";
import { screenshotUpload } from "../config/upload";
import { requireAuth } from "../middleware/auth";

export const paymentRouter = Router();

paymentRouter.post(
  "/submit",
  requireAuth,
  screenshotUpload.single("screenshot"),
  payments.submitPayment
);
paymentRouter.get("/me", requireAuth, payments.listMyPayments);
