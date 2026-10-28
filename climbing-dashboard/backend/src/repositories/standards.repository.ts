
import { prisma } from '../db/prisma.js';

export const standardsRepository = {
  getStandards() {
    return prisma.standard.findMany();
  },

  getStandardsAttempts() {
    return prisma.standardsAttempt.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        values: true,
      },
    });
  },

  createAttempt(standardId: string, value: number) {
    return prisma.standardsAttempt.create({
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
      include: {
        values: true,
      },
    });
  },

  findLatestAttempt() {
    return prisma.standardsAttempt.findFirst({
      orderBy: {
        date: 'desc',
      },
    });
  },

  findUniqueAttempt(attemptId: string) {
    return prisma.standardsAttempt.findUnique({
      where: { id: attemptId },
    });
  },

  saveAttemptValue(attemptId: string, standardId: string, value: number) {
    return prisma.standardAttemptValue.upsert({
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
  },

  updatedAttempt(attemptId: string) {
    return prisma.standardsAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { values: true },
    });
  },

  deleteLatestAttempt(latestAttemptId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.standardAttemptValue.deleteMany({
        where: {
          attemptId: latestAttemptId,
        },
      });

      await tx.standardsAttempt.delete({
        where: {
          id: latestAttemptId,
        },
      });
    });
  }

};
