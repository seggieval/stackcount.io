-- CreateTable
CREATE TABLE "AnalyzeUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastAt" DATETIME NOT NULL,
    "costCents" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AnalyzeCache" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyzeUsage_companyId_userId_date_key" ON "AnalyzeUsage"("companyId", "userId", "date");

-- CreateIndex
CREATE INDEX "AnalyzeCache_companyId_expiresAt_idx" ON "AnalyzeCache"("companyId", "expiresAt");
