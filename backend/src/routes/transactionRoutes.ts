import { Router } from "express";
import * as tx from "../controllers/transactionController";
import { requireAuth } from "../middleware/auth";

export const transactionRouter = Router();

transactionRouter.get("/me", requireAuth, tx.listMyTransactions);
