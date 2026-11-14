import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const standards = [
  { id: 'deadHangLeft', name: 'Dead hang L', unit: 'kg' },
  { id: 'deadHangRight', name: 'Dead hang R', unit: 'kg' },
  { id: 'pinchLeft', name: 'Pinch L', unit: 'kg' },
  { id: 'pinchRight', name: 'Pinch R', unit: 'kg' },
  { id: 'hang7sec', name: 'Hang 7 seconds', unit: 'kg' },
  { id: 'hang7to3', name: 'Hang 7x3', unit: 'rep' },
  { id: 'weightedPullUps', name: 'Weighted pull ups', unit: 'kg' },
  { id: 'pushUps', name: 'Push ups', unit: 'rep' },
  { id: 'plank', name: 'Plank/Hold', unit: 'sec' },
  { id: 'jump', name: 'Jump', unit: 'sm' },
  { id: 'hang', name: 'Hang', unit: 'sec' },
  { id: 'pullUps', name: 'Pull ups', unit: 'rep' },
  { id: 'boxSplit', name: 'Box split', unit: 'sm' },
  { id: 'KneeToWall', name: 'Knee to wall', unit: 'sm' },
  { id: 'shoulderMob', name: 'Shoulder mobility', unit: 'sm' },
];

const timers = [
  { name: 'Тренировка 1', prep: 5, work: 7, rest: 3, cycles: 3, sets: 2, restBetweenSets: 15 },
  { name: 'Тренировка 2', prep: 10, work: 7, rest: 3, cycles: 12, sets: 3, restBetweenSets: 180 },
  { name: 'Тренировка 3', prep: 10, work: 40, rest: 20, cycles: 3, sets: 3, restBetweenSets: 240 },
];

async function main() {
  for (const standard of standards) {
    await prisma.standard.upsert({
      where: { id: standard.id },
      create: standard,
      update: { name: standard.name, unit: standard.unit },
    });
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    if (await prisma.timer.count({ where: { userId: user.id } }) === 0) {
      await prisma.timer.createMany({
        data: timers.map((timer) => ({ ...timer, userId: user.id })),
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
