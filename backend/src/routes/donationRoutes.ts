import { Router } from "express";
import * as donations from "../controllers/donationController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { donateSchema } from "../validators/schemas";

export const donationRouter = Router();

donationRouter.post("/", requireAuth, validateBody(donateSchema), donations.createDonation);
donationRouter.get("/me", requireAuth, donations.listMyDonations);
