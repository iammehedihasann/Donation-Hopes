import { Router } from "express";
import * as updates from "../controllers/campaignUpdateController";
import { screenshotUpload } from "../config/upload";
import { requireAuth, requireRole } from "../middleware/auth";

export const campaignUpdateRouter = Router();

// Public: list updates for campaign
campaignUpdateRouter.get("/:id/updates", updates.listUpdatesPublic);

// Admin: create update (text + optional image)
campaignUpdateRouter.post(
  "/:id/updates",
  requireAuth,
  requireRole("ADMIN"),
  screenshotUpload.single("image"),
  updates.createUpdateAdmin
);

