import { getStandards } from "../controllers/standards.controller.js";
import { Router } from "express";

export const standardsRouter = Router();

standardsRouter.get("/", getStandards);

