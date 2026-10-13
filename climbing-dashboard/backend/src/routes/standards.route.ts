import { 
    createStandardsAttempt, 
    deleteLatestStandardsAttempt, 
    getStandards, 
    getStandardsAttempts 
  } from "../controllers/standards.controller.js";
import { Router } from "express";

export const standardsRouter = Router();

standardsRouter.get('/', getStandards);
standardsRouter.get('/attempts', getStandardsAttempts);
standardsRouter.post('/attempts', createStandardsAttempt);
standardsRouter.delete('/attempts', deleteLatestStandardsAttempt);

