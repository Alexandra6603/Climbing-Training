
import { prisma } from '../db/prisma.js';

export const standardsRepository = {
  getStandards() {
    return prisma.standard.findMany();
  },

  findStandard(id: string) {
    return prisma.standard.findUnique({ where: { id } });
  },

  getStandardsAttempts(userId: string) {
    return prisma.standardsAttempt.findMany({
      where: { userId },
      orderBy: {
        date: 'desc',
      },
      include: {
        values: { include: { standard: true } },
      },
    });
  },

  createAttempt(userId: string, standardId: string, value: number) {
    return prisma.standardsAttempt.create({
      data: {
        date: new Date(),
        status: 'inProgress',
        userId,
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
        values: { include: { standard: true } },
      },
    });
  },

  findLatestAttempt(userId: string) {
    return prisma.standardsAttempt.findFirst({
      where: { userId },
      orderBy: {
        date: 'desc',
      },
    });
  },

  findUniqueAttempt(attemptId: string, userId: string) {
    return prisma.standardsAttempt.findUnique({
      where: { id: attemptId, userId },
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
      include: { values: { include: { standard: true } } },
    });
  },

  completeAttempt(attemptId: string) {
    return prisma.standardsAttempt.update({
      where: { id: attemptId },
      data: { status: 'completed' },
      include: { values: { include: { standard: true } } },
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
