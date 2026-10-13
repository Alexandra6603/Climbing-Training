import { standardsService } from "../services/standards.service.js";
import type { Request, Response } from "express";

export const getStandards = async (
  _req: Request,
  res: Response
) => {
  const standards = await standardsService.getStandards();

  res.json(standards);
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