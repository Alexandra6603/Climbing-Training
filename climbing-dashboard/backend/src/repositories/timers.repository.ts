import { prisma } from '../db/prisma.js';

export type TimerInput = {
  name: string;
  prep: number;
  work: number;
  rest: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
};

export const timersRepository = {
  list(userId: string) {
    return prisma.timer.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  },

  find(userId: string, timerId: string) {
    return prisma.timer.findFirst({ where: { id: timerId, userId } });
  },

  create(userId: string, data: TimerInput) {
    return prisma.timer.create({ data: { ...data, userId } });
  },

  update(userId: string, timerId: string, data: TimerInput) {
    return prisma.timer.updateMany({ where: { id: timerId, userId }, data });
  },

  delete(userId: string, timerId: string) {
    return prisma.timer.deleteMany({ where: { id: timerId, userId } });
  },

  countForUser(userId: string) {
    return prisma.timer.count({ where: { userId } });
  },

  createDefaults(userId: string, timers: TimerInput[]) {
    return prisma.timer.createMany({ data: timers.map((timer) => ({ ...timer, userId })) });
  },
};
