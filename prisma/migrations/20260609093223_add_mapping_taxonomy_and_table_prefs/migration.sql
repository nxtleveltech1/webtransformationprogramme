-- AlterTable
ALTER TABLE "Dependency" ADD COLUMN     "areaJourney" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "cluster" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "market" TEXT;

-- AlterTable
ALTER TABLE "ProgrammeConstraint" ADD COLUMN     "areaJourney" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "cluster" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "market" TEXT;

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "areaJourney" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "cluster" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "market" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "areaJourney" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "cluster" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "market" TEXT;

-- CreateTable
CREATE TABLE "TablePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tableKey" TEXT NOT NULL,
    "columnVisibility" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TablePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TablePreference_userId_idx" ON "TablePreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TablePreference_userId_tableKey_key" ON "TablePreference"("userId", "tableKey");
