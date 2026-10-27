import { 
    createStandardsAttempt, 
    deleteLatestStandardsAttempt, 
    getStandards, 
    getStandardsAttempts,
    saveStandardAttempt
  } from "../controllers/standards.controller.js";
import { Router } from "express";

export const standardsRouter = Router();

standardsRouter.get('/', getStandards);
standardsRouter.get('/attempts', getStandardsAttempts);
standardsRouter.delete('/attempts', deleteLatestStandardsAttempt);
standardsRouter.post('/attempts', createStandardsAttempt);
standardsRouter.put(
  '/attempts/:attemptId/values/:standardId',
  saveStandardAttempt,
);

