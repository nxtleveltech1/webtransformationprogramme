-- CreateEnum
CREATE TYPE "ProgrammeStatus" AS ENUM ('ACTIVE', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('CONFIRMED', 'INFERRED', 'UNCONFIRMED', 'REQUIRES_VALIDATION');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('CONFIRMED', 'PROPOSED', 'DEFERRED', 'REJECTED', 'UNCLEAR');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'UNCONFIRMED', 'SUGGESTED', 'OPEN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('BUSINESS', 'TECHNICAL', 'PROCESS', 'PEOPLE', 'RESOURCE', 'GOVERNANCE', 'DATA', 'SECURITY', 'TIMELINE', 'FINANCIAL', 'VENDOR', 'CHANGE', 'DELIVERY');

-- CreateEnum
CREATE TYPE "Probability" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Impact" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DependencyStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'MET', 'BLOCKED', 'AT_RISK');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('OPEN', 'ANSWERED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "IngestStatus" AS ENUM ('INGESTED', 'PARTIAL', 'RECONCILED', 'EXCLUDED', 'PENDING');

-- CreateEnum
CREATE TYPE "AnalysisLens" AS ENUM ('A_PROCESS', 'B_RACI', 'C_RESOURCING', 'D_TECHNICAL', 'E_DELIVERY', 'F_STAKEHOLDER', 'G_CHANGE');

-- CreateEnum
CREATE TYPE "AnalysisCompleteness" AS ENUM ('COMPLETE', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "RegisterType" AS ENUM ('DECISION', 'ACTION', 'RISK', 'ISSUE', 'ASSUMPTION', 'DEPENDENCY', 'OPEN_QUESTION', 'PARKING_LOT', 'TRADEOFF');

-- CreateEnum
CREATE TYPE "LinkKind" AS ENUM ('RELATED', 'BLOCKS', 'MITIGATES', 'ANSWERS', 'IMPLEMENTS', 'TRACES', 'ESCALATES');

-- CreateEnum
CREATE TYPE "SessionOutputType" AS ENUM ('SUMMARY', 'KEY_POINTS', 'DECISIONS', 'ACTIONS', 'RISKS', 'ISSUES', 'DEPENDENCIES', 'OPEN_QUESTIONS', 'PARKING_LOT', 'CLARIFICATIONS');

-- CreateEnum
CREATE TYPE "ExecutiveSummaryDay" AS ENUM ('DAY1', 'DAY2', 'FINAL');

-- CreateEnum
CREATE TYPE "ExportArtifactType" AS ENUM ('XLSX', 'HTML');

-- CreateEnum
CREATE TYPE "ExportVariant" AS ENUM ('CANONICAL', 'CURSOR', 'GPT');

-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('PLATFORM', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "GlossaryCategory" AS ENUM ('ACRONYM', 'SYSTEM', 'TERM', 'PROCESS');

-- CreateEnum
CREATE TYPE "DsZone" AS ENUM ('RED', 'GREEN', 'MIXED');

-- CreateEnum
CREATE TYPE "PageTreatment" AS ENUM ('AS_IS', 'NEW_TEMPLATE', 'RESTYLE', 'CONSOLIDATE', 'RETIRE');

-- CreateEnum
CREATE TYPE "StakeholderRoleType" AS ENUM ('SPONSOR', 'APPROVER', 'SME', 'DECISION_MAKER', 'INFORMED');

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "scopeTension" TEXT,
    "hardDeadline" TEXT,
    "pageBaseline" INTEGER,
    "mvpSummary" TEXT,
    "status" "ProgrammeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopEvent" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "WorkshopStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopDay" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "theme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopSession" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "dayId" TEXT,
    "sessionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "facilitator" TEXT,
    "scribe" TEXT,
    "purpose" TEXT,
    "location" TEXT,
    "bodyMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAgendaItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "covered" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTopic" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "businessImplication" TEXT,
    "technicalImplication" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionOutput" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "outputType" "SessionOutputType" NOT NULL,
    "bodyMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDocument" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT,
    "externalId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "workshopDay" INTEGER,
    "authoritativeFor" TEXT,
    "ingestStatus" "IngestStatus" NOT NULL DEFAULT 'INGESTED',
    "excludedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionLogEntry" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "sourceIds" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRecord" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "sourceExternalId" TEXT,
    "conflict" TEXT,
    "disposition" TEXT,
    "humanValidationRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptExcerpt" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "sessionId" TEXT,
    "speakerName" TEXT,
    "text" TEXT NOT NULL,
    "approximateTime" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'UNCONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptExcerpt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "surname" TEXT,
    "email" TEXT,
    "roleDescription" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "functionDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonTeam" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workstream" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leadPersonId" TEXT,
    "oneLineStatus" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workstream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholderRole" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "roleType" "StakeholderRoleType" NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakeholderRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "country" TEXT,
    "tenantNotes" TEXT,
    "validationStatus" "Confidence" NOT NULL DEFAULT 'UNCONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerJourney" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessArea" TEXT,
    "cluster" TEXT,
    "notes" TEXT,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "category" "GlossaryCategory" NOT NULL DEFAULT 'TERM',
    "confidence" "Confidence" NOT NULL DEFAULT 'INFERRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "ownerTeam" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetDate" TEXT,
    "piGate" TEXT,
    "workstreamId" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessMetric" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "name" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScopeOption" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "appetite" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScopeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageMigrationItem" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "url" TEXT,
    "treatment" "PageTreatment",
    "effortEstimate" TEXT,
    "ownerName" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageMigrationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dsZone" "DsZone",
    "contentstackMapped" BOOLEAN,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "approver" TEXT,
    "requiredDecision" TEXT,
    "dueDate" TEXT,
    "rationale" TEXT,
    "optionsConsidered" TEXT,
    "tradeoffs" TEXT,
    "followUp" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "workstreamId" TEXT,
    "sourceDocumentId" TEXT,
    "bodyMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "area" TEXT,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "teamText" TEXT,
    "dueDate" TEXT,
    "notes" TEXT,
    "acceptanceCriteria" TEXT,
    "expectedOutput" TEXT,
    "supportingContributors" TEXT,
    "relatedRefs" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "workstreamId" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RiskCategory" NOT NULL DEFAULT 'BUSINESS',
    "probability" "Probability" NOT NULL DEFAULT 'UNKNOWN',
    "impact" "Impact" NOT NULL DEFAULT 'UNKNOWN',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "mitigationDiscussed" TEXT,
    "mitigationRequired" TEXT,
    "escalationRequired" TEXT,
    "dueDate" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "workstreamId" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currentImpact" TEXT,
    "affectedTeams" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "ownerPersonId" TEXT,
    "ownerText" TEXT,
    "resolutionRequired" TEXT,
    "targetResolutionDate" TEXT,
    "blockedWorkstream" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assumption" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "areaImpacted" TEXT,
    "validationRequired" TEXT,
    "riskIfWrong" TEXT,
    "validatorPersonId" TEXT,
    "validatorText" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "streamText" TEXT,
    "dependentWorkstream" TEXT,
    "providingTeam" TEXT,
    "receivingTeam" TEXT,
    "requiredDate" TEXT,
    "delayRisk" TEXT,
    "escalation" TEXT,
    "status" "DependencyStatus" NOT NULL DEFAULT 'OPEN',
    "ownerText" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "workstreamId" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenQuestion" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "raisedBy" TEXT,
    "relevantTeam" TEXT,
    "ownerToAnswer" TEXT,
    "impactIfUnanswered" TEXT,
    "status" "QuestionStatus" NOT NULL DEFAULT 'OPEN',
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingLotItem" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "whyParked" TEXT,
    "followUp" TEXT,
    "priority" "Priority",
    "suggestedForum" TEXT,
    "ownerText" TEXT,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "traceRef" TEXT,
    "sourceDocumentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParkingLotItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tradeoff" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "category" TEXT,
    "dimension" TEXT,
    "optionsText" TEXT,
    "ownerText" TEXT,
    "decisionNeeded" TEXT,
    "status" TEXT,
    "dueDate" TEXT,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tradeoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriticalPathStep" (
    "id" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "ownerText" TEXT,
    "predecessor" TEXT,
    "dueDate" TEXT,
    "status" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriticalPathStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapActivity" (
    "id" TEXT NOT NULL,
    "workstream" TEXT,
    "activity" TEXT NOT NULL,
    "ownerText" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "dependency" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "traceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceForum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "chair" TEXT,
    "members" TEXT,
    "cadence" TEXT,
    "inputs" TEXT,
    "outputs" TEXT,
    "escalation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceForum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamInput" (
    "id" TEXT NOT NULL,
    "workstream" TEXT,
    "leadText" TEXT,
    "artefact" TEXT,
    "ask" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "dependency" TEXT,
    "riskRef" TEXT,
    "readiness" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisArtifact" (
    "id" TEXT NOT NULL,
    "lens" "AnalysisLens" NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "completeness" "AnalysisCompleteness" NOT NULL DEFAULT 'INCOMPLETE',
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaciRow" (
    "id" TEXT NOT NULL,
    "analysisArtifactId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "programme" TEXT,
    "product" TEXT,
    "design" TEXT,
    "execution" TEXT,
    "publishing" TEXT,
    "crossChannels" TEXT,
    "seo" TEXT,
    "regional" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaciRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessWorkflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentStateSteps" TEXT,
    "futureStateSteps" TEXT,
    "ownerText" TEXT,
    "bottlenecks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceConstraint" (
    "id" TEXT NOT NULL,
    "role" TEXT,
    "namedResource" TEXT,
    "capacityConcern" TEXT,
    "confirmedVsSuggested" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveSummary" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT,
    "day" "ExecutiveSummaryDay" NOT NULL,
    "version" TEXT,
    "bodyMarkdown" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutiveSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaReportItem" (
    "id" TEXT NOT NULL,
    "severity" TEXT,
    "artifact" TEXT,
    "finding" TEXT NOT NULL,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QaReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportArtifact" (
    "id" TEXT NOT NULL,
    "type" "ExportArtifactType" NOT NULL,
    "path" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "variant" "ExportVariant" NOT NULL DEFAULT 'CANONICAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterSequence" (
    "id" TEXT NOT NULL,
    "registerType" "RegisterType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "highestUsed" TEXT NOT NULL,
    "nextFree" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisterSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterLink" (
    "id" TEXT NOT NULL,
    "fromType" "RegisterType" NOT NULL,
    "fromExternalId" TEXT NOT NULL,
    "toType" "RegisterType" NOT NULL,
    "toExternalId" TEXT NOT NULL,
    "linkKind" "LinkKind" NOT NULL DEFAULT 'RELATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraceReference" (
    "id" TEXT NOT NULL,
    "entityType" "RegisterType" NOT NULL,
    "entityExternalId" TEXT NOT NULL,
    "workshopDay" INTEGER,
    "sessionRef" TEXT,
    "sourceExternalId" TEXT,
    "segment" TEXT,
    "rawTrace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopDay_workshopId_dayNumber_key" ON "WorkshopDay"("workshopId", "dayNumber");

-- CreateIndex
CREATE INDEX "WorkshopSession_dayId_idx" ON "WorkshopSession"("dayId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopSession_workshopId_sessionNumber_key" ON "WorkshopSession"("workshopId", "sessionNumber");

-- CreateIndex
CREATE INDEX "SessionAgendaItem_sessionId_idx" ON "SessionAgendaItem"("sessionId");

-- CreateIndex
CREATE INDEX "SessionTopic_sessionId_idx" ON "SessionTopic"("sessionId");

-- CreateIndex
CREATE INDEX "SessionOutput_sessionId_idx" ON "SessionOutput"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceDocument_externalId_key" ON "SourceDocument"("externalId");

-- CreateIndex
CREATE INDEX "SourceDocument_workshopDay_idx" ON "SourceDocument"("workshopDay");

-- CreateIndex
CREATE INDEX "SourceDocument_ingestStatus_idx" ON "SourceDocument"("ingestStatus");

-- CreateIndex
CREATE INDEX "ReconciliationRecord_sourceExternalId_idx" ON "ReconciliationRecord"("sourceExternalId");

-- CreateIndex
CREATE INDEX "Person_displayName_idx" ON "Person"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Person_displayName_surname_key" ON "Person"("displayName", "surname");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PersonTeam_personId_teamId_key" ON "PersonTeam"("personId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Workstream_code_key" ON "Workstream"("code");

-- CreateIndex
CREATE INDEX "Workstream_programmeId_idx" ON "Workstream"("programmeId");

-- CreateIndex
CREATE INDEX "StakeholderRole_personId_idx" ON "StakeholderRole"("personId");

-- CreateIndex
CREATE INDEX "Site_programmeId_idx" ON "Site"("programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_term_key" ON "GlossaryTerm"("term");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPlatform_name_key" ON "SystemPlatform"("name");

-- CreateIndex
CREATE INDEX "SuccessMetric_programmeId_idx" ON "SuccessMetric"("programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_externalId_key" ON "Decision"("externalId");

-- CreateIndex
CREATE INDEX "Decision_status_idx" ON "Decision"("status");

-- CreateIndex
CREATE INDEX "Decision_workstreamId_idx" ON "Decision"("workstreamId");

-- CreateIndex
CREATE UNIQUE INDEX "Action_externalId_key" ON "Action"("externalId");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE INDEX "Action_priority_idx" ON "Action"("priority");

-- CreateIndex
CREATE INDEX "Action_workstreamId_idx" ON "Action"("workstreamId");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_externalId_key" ON "Risk"("externalId");

-- CreateIndex
CREATE INDEX "Risk_category_idx" ON "Risk"("category");

-- CreateIndex
CREATE INDEX "Risk_status_idx" ON "Risk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_externalId_key" ON "Issue"("externalId");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Assumption_externalId_key" ON "Assumption"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Dependency_externalId_key" ON "Dependency"("externalId");

-- CreateIndex
CREATE INDEX "Dependency_status_idx" ON "Dependency"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OpenQuestion_externalId_key" ON "OpenQuestion"("externalId");

-- CreateIndex
CREATE INDEX "OpenQuestion_status_idx" ON "OpenQuestion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingLotItem_externalId_key" ON "ParkingLotItem"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Tradeoff_externalId_key" ON "Tradeoff"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CriticalPathStep_stepNumber_key" ON "CriticalPathStep"("stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisArtifact_lens_key" ON "AnalysisArtifact"("lens");

-- CreateIndex
CREATE INDEX "RaciRow_analysisArtifactId_idx" ON "RaciRow"("analysisArtifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutiveSummary_day_key" ON "ExecutiveSummary"("day");

-- CreateIndex
CREATE UNIQUE INDEX "RegisterSequence_registerType_key" ON "RegisterSequence"("registerType");

-- CreateIndex
CREATE INDEX "RegisterLink_fromExternalId_idx" ON "RegisterLink"("fromExternalId");

-- CreateIndex
CREATE INDEX "RegisterLink_toExternalId_idx" ON "RegisterLink"("toExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "RegisterLink_fromType_fromExternalId_toType_toExternalId_li_key" ON "RegisterLink"("fromType", "fromExternalId", "toType", "toExternalId", "linkKind");

-- CreateIndex
CREATE INDEX "TraceReference_entityExternalId_idx" ON "TraceReference"("entityExternalId");

-- CreateIndex
CREATE INDEX "TraceReference_sourceExternalId_idx" ON "TraceReference"("sourceExternalId");

-- AddForeignKey
ALTER TABLE "WorkshopEvent" ADD CONSTRAINT "WorkshopEvent_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopDay" ADD CONSTRAINT "WorkshopDay_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "WorkshopEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSession" ADD CONSTRAINT "WorkshopSession_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "WorkshopEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopSession" ADD CONSTRAINT "WorkshopSession_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "WorkshopDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAgendaItem" ADD CONSTRAINT "SessionAgendaItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTopic" ADD CONSTRAINT "SessionTopic_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOutput" ADD CONSTRAINT "SessionOutput_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceDocument" ADD CONSTRAINT "SourceDocument_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "WorkshopEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRecord" ADD CONSTRAINT "ReconciliationRecord_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptExcerpt" ADD CONSTRAINT "TranscriptExcerpt_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptExcerpt" ADD CONSTRAINT "TranscriptExcerpt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkshopSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTeam" ADD CONSTRAINT "PersonTeam_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTeam" ADD CONSTRAINT "PersonTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workstream" ADD CONSTRAINT "Workstream_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workstream" ADD CONSTRAINT "Workstream_leadPersonId_fkey" FOREIGN KEY ("leadPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderRole" ADD CONSTRAINT "StakeholderRole_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessMetric" ADD CONSTRAINT "SuccessMetric_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeOption" ADD CONSTRAINT "ScopeOption_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageMigrationItem" ADD CONSTRAINT "PageMigrationItem_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_validatorPersonId_fkey" FOREIGN KEY ("validatorPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenQuestion" ADD CONSTRAINT "OpenQuestion_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingLotItem" ADD CONSTRAINT "ParkingLotItem_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaciRow" ADD CONSTRAINT "RaciRow_analysisArtifactId_fkey" FOREIGN KEY ("analysisArtifactId") REFERENCES "AnalysisArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveSummary" ADD CONSTRAINT "ExecutiveSummary_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "WorkshopEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
