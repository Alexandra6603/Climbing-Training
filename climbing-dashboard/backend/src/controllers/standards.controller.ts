import type { Request, Response } from 'express';
import { standardsService } from '../services/standards.service.js';

export const getStandards = async (
  _req: Request,
  res: Response,
) => {
  const standards = await standardsService.getStandards();
  return res.json(standards);
};

export const getStandardsAttempts = async (
  req: Request,
  res: Response,
) => {
  const attempts = await standardsService.getStandardsAttempts(req.authUser!.id);
  return res.json(attempts);
};

export const createStandardsAttempt = async (
  req: Request,
  res: Response,
) => {
  const { standardId, value } = req.body;

  if (
    typeof standardId !== 'string' ||
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return res.status(400).json({
      message: 'standardId must be a string and value must be a finite number',
    });
  }

  const result = await standardsService.createStandardsAttempt(
    req.authUser!.id,
    standardId,
    value,
  );

  if (!result.created) {
    return res.status(409).json({
      message: 'You can only add an attempt every 3 months',
      nextAvailableDate: result.nextAvailableDate,
    });
  }

  return res.status(201).json(result.attempt);
};

export const saveStandardAttempt = async (
  req: Request,
  res: Response,
) => {
  const { attemptId } = req.params;
  const { standardId, value } = req.body;

  if (
    typeof attemptId !== 'string' ||
    typeof standardId !== 'string' ||
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return res.status(400).json({
      message: 'attemptId and standardId must be strings, and value must be a finite number',
    });
  }

  const result = await standardsService.saveStandardAttempt(
    req.authUser!.id,
    attemptId,
    standardId,
    value,
  );

  if (!result.saved) {
    if (result.reason === 'notFound') {
      return res.status(404).json({
        message: 'Standards attempt not found',
      });
    }

    return res.status(409).json({
      message: 'Cannot edit a completed attempt',
    });
  }

  return res.json(result.attempt);
};

export const completeStandardsAttempt = async (
  req: Request,
  res: Response,
) => {
  const { attemptId } = req.params;

  if (typeof attemptId !== 'string') {
    return res.status(400).json({
      message: 'attemptId must be a string',
    });
  }

  const result = await standardsService.completeStandardsAttempt(req.authUser!.id, attemptId);

  if (!result.completed) {
    if (result.reason === 'notFound') {
      return res.status(404).json({
        message: 'Standards attempt not found',
      });
    }

    return res.status(409).json({
      message: 'This attempt is already completed',
    });
  }

  return res.json(result.attempt);
};

export const deleteLatestStandardsAttempt = async (
  req: Request,
  res: Response,
) => {
  const result = await standardsService.deleteLatestStandardsAttempt(req.authUser!.id);

  if (!result.deleted) {
    if (result.reason === 'notFound') {
      return res.status(404).json({
        message: 'No standards attempts found',
      });
    }

    return res.status(409).json({
      message: 'The latest attempt cannot be deleted because it is not in progress',
    });
  }

  return res.status(204).send();
};
