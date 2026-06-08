-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScenarioTargetType" AS ENUM ('TASK', 'MILESTONE');

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "programmeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioChange" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "targetType" "ScenarioTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetLabel" TEXT,
    "deltaDays" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scenario_programmeId_idx" ON "Scenario"("programmeId");

-- CreateIndex
CREATE INDEX "Scenario_status_idx" ON "Scenario"("status");

-- CreateIndex
CREATE INDEX "ScenarioChange_scenarioId_idx" ON "ScenarioChange"("scenarioId");

-- CreateIndex
CREATE INDEX "ScenarioChange_targetType_targetId_idx" ON "ScenarioChange"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioChange" ADD CONSTRAINT "ScenarioChange_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
