import { Router } from "express";
import * as wallet from "../controllers/walletController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { withdrawRequestSchema } from "../validators/schemas";

export const walletRouter = Router();

walletRouter.get("/me", requireAuth, wallet.getMyWallet);
walletRouter.post(
  "/withdraw-request",
  requireAuth,
  validateBody(withdrawRequestSchema),
  wallet.createWithdrawRequest
);
