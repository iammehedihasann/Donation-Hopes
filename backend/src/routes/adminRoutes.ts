import { Router } from "express";
import * as admin from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  adminReviewPaymentSchema,
  adminReviewWithdrawSchema,
  campaignCreateSchema,
  campaignUpdateSchema,
  fundUsageSchema,
} from "../validators/schemas";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/stats", admin.getStats);
adminRouter.get("/users", admin.listUsers);
adminRouter.get("/donations", admin.listAllDonations);

adminRouter.get("/payments/pending", admin.listPendingPayments);
adminRouter.patch(
  "/payments/:id",
  validateBody(adminReviewPaymentSchema),
  admin.reviewPayment
);

adminRouter.get("/withdrawals/pending", admin.listPendingWithdrawals);
adminRouter.patch(
  "/withdrawals/:id",
  validateBody(adminReviewWithdrawSchema),
  admin.reviewWithdrawal
);

adminRouter.get("/campaigns", admin.listAllCampaignsAdmin);
adminRouter.post("/campaigns", validateBody(campaignCreateSchema), admin.createCampaign);
adminRouter.patch("/campaigns/:id", validateBody(campaignUpdateSchema), admin.updateCampaign);
adminRouter.delete("/campaigns/:id", admin.deleteCampaign);

adminRouter.post("/fund-usage", validateBody(fundUsageSchema), admin.createFundUsage);
adminRouter.get("/fund-usage", admin.listFundUsage);
