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
standardsRouter.post('/attempts', createStandardsAttempt);
standardsRouter.put(
  '/attempts/:attemptId', //перенести в тело запроса айдишник норматива
  saveStandardAttempt,
);

standardsRouter.delete('/delete-last-attempt', deleteLatestStandardsAttempt);