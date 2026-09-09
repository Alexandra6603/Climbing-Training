import 'dotenv/config';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const standards = await prisma.standard.createMany({
    data: [
      {
        id: 'deadHangLeft',
        name: 'Dead hang L',
        unit: 'kg',
      },
      {
        id: 'deadHangRight',
        name: 'Dead hang R',
        unit: 'kg',
      },
      {
        id: 'pinchLeft',
        name: 'Pinch L',
        unit: 'kg',
      },
      {
        id: 'pinchRight',
        name: 'Pinch R',
        unit: 'kg',
      },
      {
        id: 'hang7sec',
        name: 'Hang 7 seconds',
        unit: 'kg',
      },
      {
        id: 'hang7to3',
        name: 'Hang 7x3',
        unit: 'rep',
      },
      {
        id: 'weightedPullUps',
        name: 'Weighted pull ups',
        unit: 'kg',
      },
      {
        id: 'pushUps',
        name: 'Push ups',
        unit: 'rep',
      },
      {
        id: 'plank',
        name: 'Plank/Hold',
        unit: 'sec',
      },
      {
        id: 'jump',
        name: 'Jump',
        unit: 'sm',
      },
      {
        id: 'hang',
        name: 'Hang',
        unit: 'sec',
      },
      {
        id: 'pullUps',
        name: 'Pull ups',
        unit: 'rep',
      },
      {
        id: 'boxSplit',
        name: 'Box split',
        unit: 'sm',
      },
      {
        id: 'KneeToWall',
        name: 'Knee to wall',
        unit: 'sm',
      },
      {
        id: 'shoulderMob',
        name: 'Shoulder mobility',
        unit: 'sm',
      },
    ],
  });

  const attempt = await prisma.standardsAttempt.create({
    data: {
      date: new Date('2026-05-12T13:56:34.813Z'),
      status: 'completed',
  
      values: {
        create: [
          {
            standardId: 'deadHangLeft',
            value: 31,
          },
          {
            standardId: 'deadHangRight',
            value: 31,
          },
          {
            standardId: 'pinchLeft',
            value: 15,
          },
          {
            standardId: 'pinchRight',
            value: 17,
          },
          {
            standardId: 'hang7sec',
            value: 0,
          },
          {
            standardId: 'hang7to3',
            value: 0,
          },
          {
            standardId: 'weightedPullUps',
            value: 0,
          },
          {
            standardId: 'pushUps',
            value: 11,
          },
          {
            standardId: 'plank',
            value: 50,
          },
          {
            standardId: 'jump',
            value: 258,
          },
          {
            standardId: 'hang',
            value: 100,
          },
          {
            standardId: 'pullUps',
            value: 0,
          },
          {
            standardId: 'boxSplit',
            value: 159,
          },
          {
            standardId: 'KneeToWall',
            value: 8,
          },
          {
            standardId: 'shoulderMob',
            value: 6,
          },
        ],
      },
    },
  });
  
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });