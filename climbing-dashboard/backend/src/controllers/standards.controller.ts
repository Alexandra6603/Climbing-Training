import { standardsService } from "../services/standards.service.js";
import type { Request, Response } from "express";

export const getStandards = async (
  _req: Request,
  res: Response
) => {
  const standards = await standardsService.getStandards();

  res.json(standards);
};