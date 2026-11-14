CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prep" INTEGER NOT NULL,
    "work" INTEGER NOT NULL,
    "rest" INTEGER NOT NULL,
    "cycles" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "restBetweenSets" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Timer_userId_idx" ON "Timer"("userId");

ALTER TABLE "Timer"
    ADD CONSTRAINT "Timer_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
