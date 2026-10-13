import { standardsService } from "../services/standards.service.js";
import type { Request, Response } from "express";

export const getStandards = async (
  _req: Request,
  res: Response
) => {
  const standards = await standardsService.getStandards();

  res.json(standards);
};


export const getStandardsAttempts = async (
  _req: Request,
  res: Response,
) => {
  const attempts = await standardsService.getStandardsAttempts();
  return res.json(attempts);
};


export const createStandardsAttempt = async (
  _req: Request,
  res: Response
) => {
  const result = await standardsService.createStandardsAttempt();

  if (!result.created) {
    return res.status(409).json({
      message: 'You can only add an attempt every 3 months',
      nextAvailableDate: result.nextAvailableDate,
    });
  }

  const { attempt } = result;

  res.status(201).json({
    id: attempt.id,
    date: attempt.date,
    status: attempt.status,
    values: {},
  });
};

export const deleteLatestStandardsAttempt = async (
  _req: Request,
  res: Response,
) => {
  const result = await standardsService.deleteLatestStandardsAttempt();

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