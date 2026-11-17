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
      message: 'Укажите норматив и корректное числовое значение.',
    });
  }

  let result;
  try {
    result = await standardsService.createStandardsAttempt(req.authUser!.id, standardId, value);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Некорректное значение норматива.' });
  }

  if (!result.created) {
    if (result.nextAvailableDate === null) return res.status(404).json({ message: 'Норматив не найден.' });
    return res.status(409).json({
      message: 'Новую попытку можно добавить не чаще одного раза в три месяца.',
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
      message: 'Укажите попытку, норматив и корректное числовое значение.',
    });
  }

  let result;
  try {
    result = await standardsService.saveStandardAttempt(req.authUser!.id, attemptId, standardId, value);
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Некорректное значение норматива.' });
  }

  if (!result.saved) {
    if (result.reason === 'notFound') {
      return res.status(404).json({
        message: 'Попытка не найдена.',
      });
    }

    return res.status(409).json({
      message: 'Завершённую попытку нельзя изменить.',
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
      message: 'Не удалось определить попытку.',
    });
  }

  const result = await standardsService.completeStandardsAttempt(req.authUser!.id, attemptId);

  if (!result.completed) {
    if (result.reason === 'notFound') {
      return res.status(404).json({
        message: 'Попытка не найдена.',
      });
    }

    return res.status(409).json({
      message: 'Эта попытка уже завершена.',
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
        message: 'Попыток не найдено.',
      });
    }

    return res.status(409).json({
      message: 'Последнюю попытку нельзя удалить, потому что она уже завершена.',
    });
  }

  return res.status(204).send();
};
