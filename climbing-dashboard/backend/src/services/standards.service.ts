import { prisma } from '../db/prisma.js';
import { standardsRepository } from '../repositories/standards.repository.js';

export const standardsService = {
  getStandards() {
    return standardsRepository.getStandards();
  },

  async getStandardsAttempts() {
    const attempts = await standardsRepository.getStandardsAttempts();
  
    return attempts.map((attempt) => ({
      id: attempt.id,
      date: attempt.date,
      status: attempt.status,
      values: Object.fromEntries(
        attempt.values.map((item) => [
          item.standardId,
          item.value,
        ]),
      ),
    }));
  },

  async createStandardsAttempt(standardId: string, value: number) {
    const latestAttempt = await standardsRepository.findLatestAttempt();

    if (latestAttempt) {
      const nextAvailableDate = addMonths(latestAttempt.date, 3);
  
      if (new Date() < nextAvailableDate) {
        return {
          created: false as const,
          nextAvailableDate,
        };
      }
    }
  
    const attempt = await standardsRepository.createAttempt(standardId, value)
  
    return {
      created: true as const,
      attempt: mapAttempt(attempt),
    };
  },
  
  async saveStandardAttempt(
    attemptId: string,
    standardId: string,
    value: number,
  ) {
    const attempt = await standardsRepository.findUniqueAttempt(attemptId)
  
    if (!attempt) {
      return { saved: false as const, reason: 'notFound' as const };
    }
  
    if (attempt.status !== 'inProgress') {
      return { saved: false as const, reason: 'notInProgress' as const };
    }
  
    await standardsRepository.saveAttemptValue(attemptId, standardId, value)
  
    const updatedAttempt = await standardsRepository.updatedAttempt(attemptId)
  
    return {
      saved: true as const,
      attempt: mapAttempt(updatedAttempt),
    };
  },

  async deleteLatestStandardsAttempt() {
    const latestAttempt = await standardsRepository.findLatestAttempt()

    if (!latestAttempt) {
      return { deleted: false as const, reason: 'notFound' as const };
    }

    if (latestAttempt.status !== 'inProgress') {
      return { deleted: false as const, reason: 'notInProgress' as const };
    }

    await standardsRepository.deleteLatestAttempt(latestAttempt.id)

    return { deleted: true as const };
  },
};

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(day, lastDay));

  return result;
}

function mapAttempt(attempt: {
  id: string;
  date: Date;
  status: string;
  values: { standardId: string; value: number }[];
}) {
  return {
    id: attempt.id,
    date: attempt.date,
    status: attempt.status,
    values: Object.fromEntries(
      attempt.values.map((item) => [
        item.standardId,
        item.value,
      ]),
    ),
  };
}