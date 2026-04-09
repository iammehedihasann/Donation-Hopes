import { Router } from "express";
import * as transparency from "../controllers/transparencyController";

export const transparencyRouter = Router();

transparencyRouter.get("/", transparency.getTransparency);
