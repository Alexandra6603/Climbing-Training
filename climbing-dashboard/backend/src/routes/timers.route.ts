import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { createTimer, deleteTimer, getTimer, listTimers, updateTimer } from '../controllers/timers.controller.js';

export const timersRouter = Router();

timersRouter.use(requireAuth);
timersRouter.get('/', listTimers);
timersRouter.get('/:timerId', getTimer);
timersRouter.post('/', createTimer);
timersRouter.put('/:timerId', updateTimer);
timersRouter.delete('/:timerId', deleteTimer);
