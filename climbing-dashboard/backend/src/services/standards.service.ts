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

  async createStandardsAttempt(standardId: string, value: number) {
    const latestAttempt = await prisma.standardsAttempt.findFirst({
      orderBy: { date: 'desc' },
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
        values: {
          create: {
            standard: {
              connect: { id: standardId },
            },
            value,
          },
        },
      },
      include: { values: true },
    });
  
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
    const attempt = await prisma.standardsAttempt.findUnique({
      where: { id: attemptId },
    });
  
    if (!attempt) {
      return { saved: false as const, reason: 'notFound' as const };
    }
  
    if (attempt.status !== 'inProgress') {
      return { saved: false as const, reason: 'notInProgress' as const };
    }
  
    await prisma.standardAttemptValue.upsert({
      where: {
        attemptId_standardId: {
          attemptId,
          standardId,
        },
      },
      create: {
        attemptId,
        standardId,
        value,
      },
      update: {
        value,
      },
    });
  
    const updatedAttempt = await prisma.standardsAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { values: true },
    });
  
    return {
      saved: true as const,
      attempt: mapAttempt(updatedAttempt),
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