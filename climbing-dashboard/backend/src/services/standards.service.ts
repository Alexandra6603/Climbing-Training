import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const standardsService = {
  getStandards() {
    const standards = prisma.standard.findMany();
    return standards;
  },

  getStandardsAttempts() {
    const attempts = prisma.standardsAttempt.findMany();
    return attempts;
  },
};