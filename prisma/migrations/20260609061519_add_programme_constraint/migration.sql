-- CreateTable
CREATE TABLE "ProgrammeConstraint" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "constraintType" TEXT,
    "severity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "requiredAction" TEXT,
    "relatedDeliverable" TEXT,
    "ownerText" TEXT,
    "ownerPersonId" TEXT,
    "programmeId" TEXT,
    "workstreamId" TEXT,
    "taskId" TEXT,
    "sourceEvidence" TEXT,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammeConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeConstraint_externalId_key" ON "ProgrammeConstraint"("externalId");

-- CreateIndex
CREATE INDEX "ProgrammeConstraint_constraintType_idx" ON "ProgrammeConstraint"("constraintType");

-- CreateIndex
CREATE INDEX "ProgrammeConstraint_status_idx" ON "ProgrammeConstraint"("status");

-- CreateIndex
CREATE INDEX "ProgrammeConstraint_workstreamId_idx" ON "ProgrammeConstraint"("workstreamId");

-- CreateIndex
CREATE INDEX "ProgrammeConstraint_taskId_idx" ON "ProgrammeConstraint"("taskId");

-- AddForeignKey
ALTER TABLE "ProgrammeConstraint" ADD CONSTRAINT "ProgrammeConstraint_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeConstraint" ADD CONSTRAINT "ProgrammeConstraint_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeConstraint" ADD CONSTRAINT "ProgrammeConstraint_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeConstraint" ADD CONSTRAINT "ProgrammeConstraint_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
