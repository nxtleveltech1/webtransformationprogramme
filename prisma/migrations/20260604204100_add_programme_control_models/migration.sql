-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ReadinessGateStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'READY', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GovernanceMeetingType" AS ENUM ('STEERING_COMMITTEE', 'LEAD_PLANNING', 'PLAYBACK', 'SME_WORKSHOP', 'SIGN_OFF', 'GO_NO_GO', 'HYPERCARE_STANDUP', 'DECISION_FORUM', 'WORKSTREAM_CHECKPOINT');

-- CreateEnum
CREATE TYPE "EvidenceLinkKind" AS ENUM ('SUPPORTS', 'INFERRED_FROM', 'REQUIRES_VALIDATION', 'GAP');

-- DropIndex
DROP INDEX "WorkshopSession_workshopId_sessionNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopSession_workshopId_dayId_sessionNumber_key" ON "WorkshopSession"("workshopId", "dayId", "sessionNumber");

-- AlterTable
ALTER TABLE "Action" ADD COLUMN "taskId" TEXT,
ADD COLUMN "deliverableId" TEXT;

-- AlterTable
ALTER TABLE "Decision" ADD COLUMN "taskId" TEXT,
ADD COLUMN "deliverableId" TEXT;

-- AlterTable
ALTER TABLE "Dependency" ADD COLUMN "taskId" TEXT,
ADD COLUMN "deliverableId" TEXT;

-- AlterTable
ALTER TABLE "Deliverable" ADD COLUMN "externalId" TEXT,
ADD COLUMN "programmeId" TEXT,
ADD COLUMN "phaseId" TEXT,
ADD COLUMN "workstreamId" TEXT,
ADD COLUMN "rag" "Rag",
ADD COLUMN "startDate" TEXT,
ADD COLUMN "acceptanceCriteria" TEXT,
ADD COLUMN "approvalRequirement" TEXT,
ADD COLUMN "evidenceRequired" TEXT,
ADD COLUMN "completionEvidence" TEXT,
ADD COLUMN "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
ADD COLUMN "sourceDocumentId" TEXT,
ADD COLUMN "traceRef" TEXT;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN "taskId" TEXT;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN "phaseId" TEXT,
ADD COLUMN "deliverableId" TEXT;

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN "taskId" TEXT,
ADD COLUMN "deliverableId" TEXT;

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "status" "PhaseStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TEXT,
    "endDate" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "programmeId" TEXT,
    "phaseId" TEXT,
    "workstreamId" TEXT,
    "projectId" TEXT,
    "deliverableId" TEXT,
    "milestoneId" TEXT,
    "parentTaskId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "rag" "Rag",
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "baselineStartDate" TEXT,
    "baselineEndDate" TEXT,
    "forecastStartDate" TEXT,
    "forecastEndDate" TEXT,
    "durationDays" INTEGER,
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "supportingSmes" TEXT,
    "blockers" TEXT,
    "acceptanceCriteria" TEXT,
    "completionEvidence" TEXT,
    "assumptions" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "criticalPath" BOOLEAN NOT NULL DEFAULT false,
    "sourceDocumentId" TEXT,
    "traceRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "predecessorTaskId" TEXT NOT NULL,
    "successorTaskId" TEXT NOT NULL,
    "dependencyType" TEXT,
    "lagDays" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessGate" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "programmeId" TEXT,
    "phaseId" TEXT,
    "workstreamId" TEXT,
    "projectId" TEXT,
    "deliverableId" TEXT,
    "taskId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "evidenceRequired" TEXT NOT NULL,
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "status" "ReadinessGateStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "rag" "Rag",
    "decisionRequired" TEXT,
    "blockingIssues" TEXT,
    "dueDate" TEXT,
    "approvalDate" TEXT,
    "approvalId" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "sourceDocumentId" TEXT,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReadinessGate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessCriterion" (
    "id" TEXT NOT NULL,
    "readinessGateId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceRequired" TEXT,
    "status" "ReadinessGateStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ownerText" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReadinessCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceMeeting" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "programmeId" TEXT,
    "workstreamId" TEXT,
    "type" "GovernanceMeetingType" NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "cadence" TEXT,
    "scheduledDate" TEXT,
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "requiredInputs" TEXT,
    "expectedOutputs" TEXT,
    "escalationPath" TEXT,
    "decisionRefs" TEXT,
    "sourceDocumentId" TEXT,
    "traceRef" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GovernanceMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusUpdate" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "phaseId" TEXT,
    "workstreamId" TEXT,
    "projectId" TEXT,
    "taskId" TEXT,
    "readinessGateId" TEXT,
    "governanceMeetingId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rag" "Rag",
    "status" TEXT,
    "reportedBy" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorText" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mimeType" TEXT,
    "storageRef" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "kind" "EvidenceLinkKind" NOT NULL DEFAULT 'SUPPORTS',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "workstreamId" TEXT,
    "deliverableId" TEXT,
    "taskId" TEXT,
    "actionId" TEXT,
    "riskId" TEXT,
    "issueId" TEXT,
    "decisionId" TEXT,
    "dependencyId" TEXT,
    "milestoneId" TEXT,
    "readinessGateId" TEXT,
    "governanceMeetingId" TEXT,
    "extractedText" TEXT,
    "notes" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phase_programmeId_code_key" ON "Phase"("programmeId", "code");
CREATE INDEX "Phase_programmeId_idx" ON "Phase"("programmeId");
CREATE INDEX "Phase_status_idx" ON "Phase"("status");
CREATE UNIQUE INDEX "Task_externalId_key" ON "Task"("externalId");
CREATE INDEX "Task_programmeId_idx" ON "Task"("programmeId");
CREATE INDEX "Task_phaseId_idx" ON "Task"("phaseId");
CREATE INDEX "Task_workstreamId_idx" ON "Task"("workstreamId");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_deliverableId_idx" ON "Task"("deliverableId");
CREATE INDEX "Task_milestoneId_idx" ON "Task"("milestoneId");
CREATE INDEX "Task_parentTaskId_idx" ON "Task"("parentTaskId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_criticalPath_idx" ON "Task"("criticalPath");
CREATE UNIQUE INDEX "TaskDependency_predecessorTaskId_successorTaskId_key" ON "TaskDependency"("predecessorTaskId", "successorTaskId");
CREATE INDEX "TaskDependency_successorTaskId_idx" ON "TaskDependency"("successorTaskId");
CREATE UNIQUE INDEX "ReadinessGate_externalId_key" ON "ReadinessGate"("externalId");
CREATE INDEX "ReadinessGate_programmeId_idx" ON "ReadinessGate"("programmeId");
CREATE INDEX "ReadinessGate_phaseId_idx" ON "ReadinessGate"("phaseId");
CREATE INDEX "ReadinessGate_workstreamId_idx" ON "ReadinessGate"("workstreamId");
CREATE INDEX "ReadinessGate_projectId_idx" ON "ReadinessGate"("projectId");
CREATE INDEX "ReadinessGate_deliverableId_idx" ON "ReadinessGate"("deliverableId");
CREATE INDEX "ReadinessGate_taskId_idx" ON "ReadinessGate"("taskId");
CREATE INDEX "ReadinessGate_status_idx" ON "ReadinessGate"("status");
CREATE INDEX "ReadinessGate_rag_idx" ON "ReadinessGate"("rag");
CREATE INDEX "ReadinessCriterion_readinessGateId_idx" ON "ReadinessCriterion"("readinessGateId");
CREATE INDEX "ReadinessCriterion_status_idx" ON "ReadinessCriterion"("status");
CREATE UNIQUE INDEX "GovernanceMeeting_externalId_key" ON "GovernanceMeeting"("externalId");
CREATE INDEX "GovernanceMeeting_programmeId_idx" ON "GovernanceMeeting"("programmeId");
CREATE INDEX "GovernanceMeeting_workstreamId_idx" ON "GovernanceMeeting"("workstreamId");
CREATE INDEX "GovernanceMeeting_type_idx" ON "GovernanceMeeting"("type");
CREATE INDEX "GovernanceMeeting_scheduledDate_idx" ON "GovernanceMeeting"("scheduledDate");
CREATE INDEX "StatusUpdate_programmeId_idx" ON "StatusUpdate"("programmeId");
CREATE INDEX "StatusUpdate_phaseId_idx" ON "StatusUpdate"("phaseId");
CREATE INDEX "StatusUpdate_workstreamId_idx" ON "StatusUpdate"("workstreamId");
CREATE INDEX "StatusUpdate_projectId_idx" ON "StatusUpdate"("projectId");
CREATE INDEX "StatusUpdate_taskId_idx" ON "StatusUpdate"("taskId");
CREATE INDEX "StatusUpdate_readinessGateId_idx" ON "StatusUpdate"("readinessGateId");
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");
CREATE INDEX "Attachment_entityType_entityId_idx" ON "Attachment"("entityType", "entityId");
CREATE INDEX "Attachment_sourceDocumentId_idx" ON "Attachment"("sourceDocumentId");
CREATE INDEX "EvidenceLink_entityType_entityId_idx" ON "EvidenceLink"("entityType", "entityId");
CREATE INDEX "EvidenceLink_sourceDocumentId_idx" ON "EvidenceLink"("sourceDocumentId");
CREATE INDEX "EvidenceLink_workstreamId_idx" ON "EvidenceLink"("workstreamId");
CREATE INDEX "EvidenceLink_deliverableId_idx" ON "EvidenceLink"("deliverableId");
CREATE INDEX "EvidenceLink_taskId_idx" ON "EvidenceLink"("taskId");
CREATE INDEX "EvidenceLink_readinessGateId_idx" ON "EvidenceLink"("readinessGateId");
CREATE INDEX "EvidenceLink_kind_idx" ON "EvidenceLink"("kind");
CREATE UNIQUE INDEX "Deliverable_externalId_key" ON "Deliverable"("externalId");
CREATE INDEX "Deliverable_programmeId_idx" ON "Deliverable"("programmeId");
CREATE INDEX "Deliverable_phaseId_idx" ON "Deliverable"("phaseId");
CREATE INDEX "Deliverable_workstreamId_idx" ON "Deliverable"("workstreamId");
CREATE INDEX "Deliverable_rag_idx" ON "Deliverable"("rag");
CREATE INDEX "Milestone_phaseId_idx" ON "Milestone"("phaseId");
CREATE INDEX "Milestone_deliverableId_idx" ON "Milestone"("deliverableId");
CREATE INDEX "Decision_taskId_idx" ON "Decision"("taskId");
CREATE INDEX "Decision_deliverableId_idx" ON "Decision"("deliverableId");
CREATE INDEX "Action_taskId_idx" ON "Action"("taskId");
CREATE INDEX "Action_deliverableId_idx" ON "Action"("deliverableId");
CREATE INDEX "Risk_taskId_idx" ON "Risk"("taskId");
CREATE INDEX "Risk_deliverableId_idx" ON "Risk"("deliverableId");
CREATE INDEX "Issue_taskId_idx" ON "Issue"("taskId");
CREATE INDEX "Dependency_taskId_idx" ON "Dependency"("taskId");
CREATE INDEX "Dependency_deliverableId_idx" ON "Dependency"("deliverableId");

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_predecessorTaskId_fkey" FOREIGN KEY ("predecessorTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_successorTaskId_fkey" FOREIGN KEY ("successorTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessGate" ADD CONSTRAINT "ReadinessGate_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadinessCriterion" ADD CONSTRAINT "ReadinessCriterion_readinessGateId_fkey" FOREIGN KEY ("readinessGateId") REFERENCES "ReadinessGate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GovernanceMeeting" ADD CONSTRAINT "GovernanceMeeting_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GovernanceMeeting" ADD CONSTRAINT "GovernanceMeeting_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GovernanceMeeting" ADD CONSTRAINT "GovernanceMeeting_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GovernanceMeeting" ADD CONSTRAINT "GovernanceMeeting_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_readinessGateId_fkey" FOREIGN KEY ("readinessGateId") REFERENCES "ReadinessGate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_governanceMeetingId_fkey" FOREIGN KEY ("governanceMeetingId") REFERENCES "GovernanceMeeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Dependency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_readinessGateId_fkey" FOREIGN KEY ("readinessGateId") REFERENCES "ReadinessGate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_governanceMeetingId_fkey" FOREIGN KEY ("governanceMeetingId") REFERENCES "GovernanceMeeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
