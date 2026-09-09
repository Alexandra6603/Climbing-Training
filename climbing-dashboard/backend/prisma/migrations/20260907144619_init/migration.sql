/*
  Warnings:

  - The primary key for the `Standard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `unit` to the `Standard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "StandardsAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StandardAttemptValue" (
    "attemptId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "value" REAL NOT NULL,

    PRIMARY KEY ("attemptId", "standardId"),
    CONSTRAINT "StandardAttemptValue_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "StandardsAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StandardAttemptValue_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Standard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL
);
INSERT INTO "new_Standard" ("id", "name") SELECT "id", "name" FROM "Standard";
DROP TABLE "Standard";
ALTER TABLE "new_Standard" RENAME TO "Standard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
