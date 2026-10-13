import { prisma } from '../db/prisma.js';

export const standardsService = {
  getStandards() {
    return prisma.standard.findMany();
  },


  async getStandardsAttempts() {
    const attempts = await prisma.standardsAttempt.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        values: true,
      },
    });

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

  async deleteLatestStandardsAttempt() {
    const latestAttempt = await prisma.standardsAttempt.findFirst({
      orderBy: {
        date: 'desc',
      },
    });

    if (!latestAttempt) {
      return { deleted: false as const, reason: 'notFound' as const };
    }

    if (latestAttempt.status !== 'inProgress') {
      return { deleted: false as const, reason: 'notInProgress' as const };
    }

    await prisma.$transaction(async (tx) => {
      await tx.standardAttemptValue.deleteMany({
        where: {
          attemptId: latestAttempt.id,
        },
      });

      await tx.standardsAttempt.delete({
        where: {
          id: latestAttempt.id,
        },
      });
    });

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