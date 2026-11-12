import { 
    createStandardsAttempt, 
    completeStandardsAttempt,
    deleteLatestStandardsAttempt, 
    getStandards, 
    getStandardsAttempts,
    saveStandardAttempt
  } from "../controllers/standards.controller.js";
import { Router } from "express";

export const standardsRouter = Router();

standardsRouter.get('/', getStandards);
standardsRouter.get('/attempts', getStandardsAttempts);
standardsRouter.post('/attempts', createStandardsAttempt);
standardsRouter.put(
  '/attempts/:attemptId',
  saveStandardAttempt,
);
standardsRouter.put('/attempts/:attemptId/complete', completeStandardsAttempt);

standardsRouter.delete('/delete-last-attempt', deleteLatestStandardsAttempt);
