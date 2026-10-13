import { prisma } from '../db/prisma.js';

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

export const standardsService = {
  getStandards() {
    const standards = prisma.standard.findMany();
    return standards;
  },

  getStandardsAttempts() {
    const attempts = prisma.standardsAttempt.findMany();
    return attempts;
  },

  async createStandardsAttempt() {
    const latestAttempt = await prisma.standardsAttempt.findFirst({
      orderBy: {
        date: 'desc',
      },
    });

    if (latestAttempt) {
      const nextAvailableDate = addMonths(latestAttempt.date, 3);

      if (new Date() < nextAvailableDate) {
        return {
          created: false as const,
          nextAvailableDate,
        };
      }
    }

    const attempt = await prisma.standardsAttempt.create({
      data: {
        date: new Date(),
        status: 'inProgress',
      },
    });

    return {
      created: true as const,
      attempt,
    };
  },
};