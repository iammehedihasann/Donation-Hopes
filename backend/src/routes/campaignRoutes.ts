import { Router } from "express";
import * as campaigns from "../controllers/campaignController";

export const campaignRouter = Router();

campaignRouter.get("/", campaigns.listCampaigns);
campaignRouter.get("/:id", campaigns.getCampaign);
