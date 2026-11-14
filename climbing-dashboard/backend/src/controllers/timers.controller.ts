import type { Request, Response } from 'express';
import { timersService } from '../services/timers.service.js';
import type { TimerInput } from '../repositories/timers.repository.js';

const parseTimerInput = (value: unknown): TimerInput | null => {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  const numericFields = ['prep', 'work', 'rest', 'cycles', 'sets', 'restBetweenSets'] as const;
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) return null;

  for (const field of numericFields) {
    const minimum = field === 'cycles' || field === 'sets' ? 1 : 0;
    if (typeof body[field] !== 'number' || !Number.isInteger(body[field]) || body[field] < minimum) return null;
  }

  return {
    name: body.name.trim(),
    prep: body.prep as number,
    work: body.work as number,
    rest: body.rest as number,
    cycles: body.cycles as number,
    sets: body.sets as number,
    restBetweenSets: body.restBetweenSets as number,
  };
};

export const listTimers = async (req: Request, res: Response) => {
  const timers = await timersService.list(req.authUser!.id);
  return res.json(timers);
};

export const getTimer = async (req: Request, res: Response) => {
  const timerId = req.params.timerId;
  if (typeof timerId !== 'string') return res.status(400).json({ message: 'timerId must be a string' });
  const timer = await timersService.find(req.authUser!.id, timerId);
  if (!timer) return res.status(404).json({ message: 'Timer not found' });
  return res.json(timer);
};

export const createTimer = async (req: Request, res: Response) => {
  const input = parseTimerInput(req.body);
  if (!input) {
    return res.status(400).json({ message: 'Provide a name and valid non-negative integer timer values (cycles and sets must be at least 1)' });
  }

  const timer = await timersService.create(req.authUser!.id, input);
  return res.status(201).json(timer);
};

export const updateTimer = async (req: Request, res: Response) => {
  const timerId = req.params.timerId;
  if (typeof timerId !== 'string') return res.status(400).json({ message: 'timerId must be a string' });
  const input = parseTimerInput(req.body);
  if (!input) {
    return res.status(400).json({ message: 'Provide a name and valid non-negative integer timer values (cycles and sets must be at least 1)' });
  }

  const timer = await timersService.update(req.authUser!.id, timerId, input);
  if (!timer) return res.status(404).json({ message: 'Timer not found' });
  return res.json(timer);
};

export const deleteTimer = async (req: Request, res: Response) => {
  const timerId = req.params.timerId;
  if (typeof timerId !== 'string') return res.status(400).json({ message: 'timerId must be a string' });
  const deleted = await timersService.delete(req.authUser!.id, timerId);
  if (!deleted) return res.status(404).json({ message: 'Timer not found' });
  return res.status(204).send();
};
