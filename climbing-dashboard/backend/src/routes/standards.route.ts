import { 
    createStandardsAttempt, 
    completeStandardsAttempt,
    deleteLatestStandardsAttempt, 
    getStandards, 
    getStandardsAttempts,
    saveStandardAttempt
  } from "../controllers/standards.controller.js";
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

export const standardsRouter = Router();

standardsRouter.use(requireAuth);
standardsRouter.get('/', getStandards);
standardsRouter.get('/attempts', getStandardsAttempts);
standardsRouter.post('/attempts', createStandardsAttempt);
standardsRouter.put(
  '/attempts/:attemptId',
  saveStandardAttempt,
);
standardsRouter.put('/attempts/:attemptId/complete', completeStandardsAttempt);

standardsRouter.delete('/delete-last-attempt', deleteLatestStandardsAttempt);
