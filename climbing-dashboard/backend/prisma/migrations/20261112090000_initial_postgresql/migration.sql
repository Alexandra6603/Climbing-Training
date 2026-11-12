CREATE TABLE "Standard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    CONSTRAINT "Standard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "photoUrl" TEXT,
    "profileType" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthSession" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("tokenHash")
);

CREATE TABLE "StandardsAttempt" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "StandardsAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StandardAttemptValue" (
    "attemptId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "StandardAttemptValue_pkey" PRIMARY KEY ("attemptId", "standardId")
);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
CREATE INDEX "StandardsAttempt_userId_idx" ON "StandardsAttempt"("userId");

ALTER TABLE "AuthSession"
    ADD CONSTRAINT "AuthSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StandardsAttempt"
    ADD CONSTRAINT "StandardsAttempt_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StandardAttemptValue"
    ADD CONSTRAINT "StandardAttemptValue_attemptId_fkey"
    FOREIGN KEY ("attemptId") REFERENCES "StandardsAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StandardAttemptValue"
    ADD CONSTRAINT "StandardAttemptValue_standardId_fkey"
    FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
