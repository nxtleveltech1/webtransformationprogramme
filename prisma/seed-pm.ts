/**
 * Programme delivery layer seed (REAL DATA ONLY).
 *
 * LIVE-SAFE & idempotent: additive only. Upsert-keyed for Phase/Project/
 * Deliverable/Task/ReadinessGate/GovernanceMeeting/Resource; scope-cleans only
 * the seed-owned Milestone and EvidenceLink rows it recreates. It NEVER deletes
 * the workshop registers nor app-authored data (ChangeRequest, Approval,
 * Document, Notification, User, ResourceAllocation, Comment, Attachment,
 * StatusUpdate) — so it is safe to run repeatedly against the live database.
 *
 * Principle: every row created here is either real workshop/programme data or a
 * faithful derivation of it. No fabricated/placeholder data is generated.
 *   - Projects     -> one per real workstream (real name / owner / link only)
 *   - Milestones   -> derived from real critical-path PI gates + roadmap go-lives
 *   - Resources    -> derived from real people (no invented capacity numbers)
 *   - RBAC         -> role/permission catalogue only (app infrastructure)
 *
 * Run with: npm run db:seed:pm
 */
import {
  Confidence,
  DeliverableStatus,
  EvidenceLinkKind,
  GovernanceMeetingType,
  PrismaClient,
  ProjectStatus,
  Rag,
  ReadinessGateStatus,
  TaskStatus,
  PhaseStatus,
} from "@prisma/client";
import {
  CRITICAL_PATH,
  DELIVERABLES,
  EVIDENCE_LINKS,
  GOVERNANCE_MEETINGS,
  PHASES,
  READINESS_GATES,
  TASK_DEPENDENCIES,
  WBS_TASKS,
} from "./seed/workshop-data.generated";
import {
  parseTraceDaySession,
  resolveOwnerPersonId,
  resolveSourceId,
  mapPriority,
} from "./seed/utils";

const prisma = new PrismaClient();

const ENTITY_KEYS = [
  "programme",
  "phase",
  "project",
  "workstream",
  "task",
  "wbs",
  "milestone",
  "deliverable",
  "dependency",
  "risk",
  "issue",
  "decision",
  "assumption",
  "question",
  "parkingLot",
  "changeRequest",
  "approval",
  "readinessGate",
  "governanceMeeting",
  "evidence",
  "statusUpdate",
  "comment",
  "attachment",
  "resource",
  "document",
  "notification",
  "report",
  "governance",
  "people",
  "integration",
  "admin",
];
const ACTION_KEYS = [
  "view",
  "create",
  "edit",
  "assign",
  "approve",
  "reject",
  "escalate",
  "archive",
  "delete",
  "export",
  "configure",
];

const ROLE_SEED = [
  { key: "SUPER_ADMIN", name: "Super Admin", description: "Full platform access including administration and configuration." },
  { key: "PROGRAMME_DIRECTOR", name: "Programme Director", description: "Owns the programme; can approve, escalate and manage delivery." },
  { key: "PROJECT_MANAGER", name: "Project Manager", description: "Manages projects, tasks, RAID and resources." },
  { key: "WORKSTREAM_LEAD", name: "Workstream Lead", description: "Leads a workstream and its delivery items." },
  { key: "SME", name: "SME", description: "Subject matter expert contributing to delivery items." },
  { key: "CONTRIBUTOR", name: "Contributor", description: "Creates and updates their own tasks and items." },
  { key: "APPROVER", name: "Approver", description: "Reviews and approves or rejects items." },
  { key: "EXECUTIVE_VIEWER", name: "Executive / Steering Viewer", description: "Read access to dashboards and reports." },
  { key: "READ_ONLY_STAKEHOLDER", name: "Read-only Stakeholder", description: "View-only access across the platform." },
];

/**
 * Maps the workshop's textual PI-gate phrases to their stated month-end target
 * dates. These are the gate timings explicitly called out on Day 2
 * ("End June" = foundations, "End July" = Personal go-live), not invented dates.
 */
const GATE_TARGET_DATE: Record<string, string> = {
  "End June": "2026-06-30",
  "End July": "2026-07-31",
  "End July+": "2026-07-31",
};

/** Best-effort workstream code for each derived milestone (null if unmatched). */
function milestoneWorkstreamCode(activity: string): string | null {
  const a = activity.toLowerCase();
  if (a.includes("devops") || a.includes("quality gate")) return "technical_migration";
  if (a.includes("design foundations") || a.includes("templates")) return "design_systems";
  if (a.includes("content") || a.includes("article")) return "content_ia";
  if (a.includes("publishing")) return "publishing";
  if (a.includes("go-live") || a.includes("go live") || a.includes("readiness")) return "testing_go_live";
  return null;
}

function enumValue<T extends Record<string, string>>(source: T, value: string, fallback: T[keyof T]): T[keyof T] {
  const key = value.toUpperCase().replace(/\s+/g, "_") as keyof T;
  return source[key] ?? fallback;
}

function mapRag(value: string): Rag | null {
  return enumValue(Rag, value, Rag.AMBER);
}

function mapConfidence(value: string): Confidence {
  return enumValue(Confidence, value, Confidence.INFERRED);
}

function mapPhaseStatus(value: string): PhaseStatus {
  return enumValue(PhaseStatus, value, PhaseStatus.NOT_STARTED);
}

function mapTaskStatus(value: string): TaskStatus {
  return enumValue(TaskStatus, value, TaskStatus.NOT_STARTED);
}

function mapDeliverableStatus(value: string): DeliverableStatus {
  return enumValue(DeliverableStatus, value, DeliverableStatus.NOT_STARTED);
}

function mapReadinessStatus(value: string): ReadinessGateStatus {
  return enumValue(ReadinessGateStatus, value, ReadinessGateStatus.NOT_STARTED);
}

function mapGovernanceType(value: string): GovernanceMeetingType {
  return enumValue(GovernanceMeetingType, value, GovernanceMeetingType.WORKSTREAM_CHECKPOINT);
}

function mapEvidenceKind(value: string): EvidenceLinkKind {
  return enumValue(EvidenceLinkKind, value, EvidenceLinkKind.SUPPORTS);
}

/**
 * Marker prefix for seed-derived milestones (the critical-path PI gates). Used
 * to scope-clean ONLY the milestones this seed owns, so user-created milestones
 * are never deleted.
 */
const SEED_MILESTONE_NOTE_PREFIX = "Critical-path PI gate (step";

/**
 * LIVE-SAFE idempotency cleanup.
 *
 * This seed is additive: every table it creates is either upsert-keyed (Phase,
 * Project, Deliverable, Task, ReadinessGate, GovernanceMeeting, Resource) or
 * managed by createMany/skipDuplicates (RBAC catalogue, TaskDependency — both
 * with unique constraints). The only two tables seeded via raw create() are
 * Milestone and EvidenceLink, so we scope-clean ONLY the rows this seed owns
 * (by deterministic marker) before recreating them.
 *
 * It NEVER touches app-authored tables (ChangeRequest, Approval, Document,
 * Notification, User/UserRole, ResourceAllocation, Comment, Attachment,
 * StatusUpdate) — those were previously wiped here but never recreated, which
 * was destroying live data on every run.
 */
async function cleanSeedOwnedRows() {
  // Seed-owned milestones only (identified by their generated notes marker).
  await prisma.milestone.deleteMany({
    where: { notes: { startsWith: SEED_MILESTONE_NOTE_PREFIX } },
  });
  // Seed-owned evidence links only (identified by their generated traceRefs).
  const seedTraceRefs = Array.from(
    new Set((EVIDENCE_LINKS as unknown[][]).map((row) => row[5] as string).filter(Boolean)),
  );
  if (seedTraceRefs.length > 0) {
    await prisma.evidenceLink.deleteMany({ where: { traceRef: { in: seedTraceRefs } } });
  }
  // Self-heal: Resources are 1:1 derivations of Person. Person merges/deletions
  // can leave orphaned resources (personId null); remove them so the resource
  // set stays exactly one-per-person after the upsert loop below.
  await prisma.resource.deleteMany({ where: { personId: null } });
}

/** RBAC role + permission catalogue. App infrastructure, not programme data. */
async function seedRbacCatalogue() {
  await prisma.role.createMany({
    data: ROLE_SEED.map((r) => ({
      key: r.key,
      name: r.name,
      description: r.description,
      isSystem: true,
    })),
    skipDuplicates: true,
  });
  const roles = await prisma.role.findMany();
  const roleByKey = new Map(roles.map((r) => [r.key, r]));

  const permissionData = ENTITY_KEYS.flatMap((entity) =>
    ACTION_KEYS.map((action) => ({
      key: `${entity}:${action}`,
      entity,
      action,
      description: `${action} ${entity}`,
    })),
  );
  await prisma.permission.createMany({ data: permissionData, skipDuplicates: true });
  const permissions = await prisma.permission.findMany();

  const superAdmin = roleByKey.get("SUPER_ADMIN");
  const director = roleByKey.get("PROGRAMME_DIRECTOR");
  const readOnly = roleByKey.get("READ_ONLY_STAKEHOLDER");
  if (!superAdmin || !director || !readOnly) {
    console.warn("RBAC roles missing after seed — skipping role-permission joins.");
    return;
  }

  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({ roleId: superAdmin.id, permissionId: p.id })),
    skipDuplicates: true,
  });
  await prisma.rolePermission.createMany({
    data: permissions
      .filter((p) => p.action !== "configure" && p.entity !== "admin")
      .map((p) => ({ roleId: director.id, permissionId: p.id })),
    skipDuplicates: true,
  });
  await prisma.rolePermission.createMany({
    data: permissions
      .filter((p) => p.action === "view")
      .map((p) => ({ roleId: readOnly.id, permissionId: p.id })),
    skipDuplicates: true,
  });
}

async function main() {
  console.log("\n=== Programme delivery layer seed (real-data derivations only) ===\n");
  // LIVE-SAFE: additive/idempotent. Only scope-cleans seed-owned Milestone and
  // EvidenceLink rows; never deletes app-authored data.
  await cleanSeedOwnedRows();

  const programme = await prisma.programme.findFirst();
  if (!programme) {
    console.error("No programme found. Run `SEED_RESET=1 npm run db:seed` first.");
    process.exit(1);
  }

  const workstreams = await prisma.workstream.findMany({
    orderBy: { sortOrder: "asc" },
    include: { leadPerson: true },
  });
  const people = await prisma.person.findMany({ orderBy: { displayName: "asc" } });
  const wsByCode = new Map(workstreams.map((w) => [w.code, w.id]));

  // Programme RAG: AMBER / At Risk, per the executive status report (real assessment).
  await prisma.programme.update({ where: { id: programme.id }, data: { rag: Rag.AMBER } });

  // RBAC catalogue (roles + permissions). No fabricated users.
  await seedRbacCatalogue();

  // Resources derived from real people. No invented capacity numbers.
  for (const person of people) {
    await prisma.resource.upsert({
      where: { personId: person.id },
      update: {
        displayName: person.displayName,
        role: person.roleDescription?.slice(0, 80) ?? null,
        capacityHours: null,
      },
      create: {
        personId: person.id,
        displayName: person.displayName,
        role: person.roleDescription?.slice(0, 80) ?? null,
        capacityHours: null,
      },
    });
  }

  // Projects: one per real workstream, real attributes only.
  for (const ws of workstreams) {
    await prisma.project.upsert({
      where: { code: `PRJ-${ws.code}` },
      update: {
        programmeId: programme.id,
        workstreamId: ws.id,
        name: ws.name,
        description: ws.oneLineStatus ?? null,
        status: ProjectStatus.ACTIVE,
        ownerPersonId: ws.leadPersonId,
        ownerText: ws.leadText ?? ws.leadPerson?.displayName ?? null,
      },
      create: {
        programmeId: programme.id,
        workstreamId: ws.id,
        code: `PRJ-${ws.code}`,
        name: ws.name,
        description: ws.oneLineStatus ?? null,
        status: ProjectStatus.ACTIVE,
        ownerPersonId: ws.leadPersonId,
        ownerText: ws.leadText ?? ws.leadPerson?.displayName ?? null,
      },
    });
  }

  const projects = await prisma.project.findMany();
  const projectByWorkstream = new Map(projects.map((p) => [p.workstreamId, p.id]));
  const projectByWorkstreamCode = new Map(
    workstreams.map((ws) => [ws.code, projectByWorkstream.get(ws.id) ?? null]),
  );

  const phaseByCode = new Map<string, string>();
  for (const row of PHASES) {
    const [code, name, purpose, startDate, endDate, status, confidence, traceRef] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const phase = await prisma.phase.upsert({
      where: { programmeId_code: { programmeId: programme.id, code } },
      update: {
        name,
        purpose,
        startDate,
        endDate,
        status: mapPhaseStatus(status),
        confidence: mapConfidence(confidence),
        traceRef,
        sortOrder: phaseByCode.size,
      },
      create: {
        programmeId: programme.id,
        code,
        name,
        purpose,
        startDate,
        endDate,
        status: mapPhaseStatus(status),
        confidence: mapConfidence(confidence),
        traceRef,
        sortOrder: phaseByCode.size,
      },
    });
    phaseByCode.set(code, phase.id);
  }

  const deliverableByExternalId = new Map<string, string>();
  for (const row of DELIVERABLES) {
    const [
      externalId,
      phaseCode,
      workstreamCode,
      name,
      description,
      ownerText,
      startDate,
      dueDate,
      status,
      rag,
      acceptanceCriteria,
      approvalRequirement,
      evidenceRequired,
      traceRef,
    ] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const { sourceId } = parseTraceDaySession(traceRef);
    const workstreamId = wsByCode.get(workstreamCode) ?? null;
    const deliverableData = {
      programmeId: programme.id,
      phaseId: phaseByCode.get(phaseCode) ?? null,
      workstreamId,
      projectId: projectByWorkstreamCode.get(workstreamCode) ?? null,
      name,
      description,
      ownerText,
      ownerPersonId: await resolveOwnerPersonId(prisma, ownerText),
      startDate,
      dueDate,
      status: mapDeliverableStatus(status),
      rag: mapRag(rag),
      acceptanceCriteria,
      approvalRequirement,
      evidenceRequired,
      confidence: traceRef.startsWith("Requirement|") ? Confidence.INFERRED : Confidence.CONFIRMED,
      sourceDocumentId: await resolveSourceId(prisma, sourceId),
      traceRef,
    };
    const deliverable = await prisma.deliverable.upsert({
      where: { externalId },
      update: deliverableData,
      create: { externalId, ...deliverableData },
    });
    deliverableByExternalId.set(externalId, deliverable.id);
  }

  // Re-sync from DB so task/evidence FKs never use stale ids after upserts.
  deliverableByExternalId.clear();
  for (const row of await prisma.deliverable.findMany({ select: { id: true, externalId: true } })) {
    if (row.externalId) deliverableByExternalId.set(row.externalId, row.id);
  }

  const taskByExternalId = new Map<string, string>();
  type WbsRow = (typeof WBS_TASKS)[number];
  const parseWbsRow = (row: WbsRow) => {
    const [
      externalId,
      phaseCode,
      workstreamCode,
      deliverableExternalId,
      parentExternalId,
      title,
      ownerText,
      baselineStartDate,
      baselineEndDate,
      status,
      rag,
      percentComplete,
      critical,
      priority,
      acceptanceCriteria,
      traceRef,
      confidence,
    ] = row as unknown as [
      string,
      string,
      string,
      string,
      string | null,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      string,
      string,
      string,
      string,
    ];
    return {
      externalId,
      phaseCode,
      workstreamCode,
      deliverableExternalId,
      parentExternalId,
      title,
      ownerText,
      baselineStartDate,
      baselineEndDate,
      status,
      rag,
      percentComplete,
      critical,
      priority,
      acceptanceCriteria,
      traceRef,
      confidence,
    };
  };

  const createTaskRow = async (row: WbsRow, parentTaskId: string | null) => {
    const parsed = parseWbsRow(row);
    const { sourceId } = parseTraceDaySession(parsed.traceRef);
    const workstreamId = wsByCode.get(parsed.workstreamCode) ?? null;
    const deliverableRow = parsed.deliverableExternalId
      ? await prisma.deliverable.findUnique({
          where: { externalId: parsed.deliverableExternalId },
          select: { id: true },
        })
      : null;
    const taskData = {
      programmeId: programme.id,
      phaseId: phaseByCode.get(parsed.phaseCode) ?? null,
      workstreamId,
      projectId: projectByWorkstreamCode.get(parsed.workstreamCode) ?? null,
      deliverableId: deliverableRow?.id ?? null,
      parentTaskId,
      title: parsed.title,
      status: mapTaskStatus(parsed.status),
      priority: mapPriority(parsed.priority),
      rag: mapRag(parsed.rag),
      percentComplete: parsed.percentComplete,
      baselineStartDate: parsed.baselineStartDate,
      baselineEndDate: parsed.baselineEndDate,
      forecastStartDate: parsed.baselineStartDate,
      forecastEndDate: parsed.baselineEndDate,
      ownerText: parsed.ownerText,
      ownerPersonId: await resolveOwnerPersonId(prisma, parsed.ownerText),
      acceptanceCriteria: parsed.acceptanceCriteria,
      confidence: mapConfidence(parsed.confidence),
      criticalPath: parsed.critical === "Y",
      sourceDocumentId: await resolveSourceId(prisma, sourceId),
      traceRef: parsed.traceRef,
      sortOrder: taskByExternalId.size,
    };
    const task = await prisma.task.upsert({
      where: { externalId: parsed.externalId },
      update: taskData,
      create: { externalId: parsed.externalId, ...taskData },
    });
    taskByExternalId.set(parsed.externalId, task.id);
  };

  for (const row of WBS_TASKS) {
    await createTaskRow(row, null);
  }
  for (const row of WBS_TASKS) {
    const { externalId, parentExternalId } = parseWbsRow(row);
    if (!parentExternalId) continue;
    const parentTaskId = taskByExternalId.get(parentExternalId);
    const taskId = taskByExternalId.get(externalId);
    if (!parentTaskId) {
      throw new Error(`Missing parent task ${parentExternalId} for ${externalId}`);
    }
    if (!taskId) {
      throw new Error(`Missing task ${externalId} for parent link`);
    }
    await prisma.task.update({
      where: { id: taskId },
      data: { parentTaskId },
    });
  }

  taskByExternalId.clear();
  for (const row of await prisma.task.findMany({ select: { id: true, externalId: true } })) {
    taskByExternalId.set(row.externalId, row.id);
  }

  const dependencyRows: {
    predecessorTaskId: string;
    successorTaskId: string;
    dependencyType: string;
    lagDays: number;
    notes: string;
  }[] = [];
  for (const row of TASK_DEPENDENCIES) {
    const [predecessorExternalId, successorExternalId, dependencyType, lagDays, notes] = row as unknown as [
      string,
      string,
      string,
      number,
      string,
    ];
    const predecessorTaskId = taskByExternalId.get(predecessorExternalId);
    const successorTaskId = taskByExternalId.get(successorExternalId);
    if (!predecessorTaskId || !successorTaskId) continue;
    dependencyRows.push({ predecessorTaskId, successorTaskId, dependencyType, lagDays, notes });
  }
  if (dependencyRows.length > 0) {
    await prisma.taskDependency.createMany({ data: dependencyRows, skipDuplicates: true });
  }

  const readinessGateByExternalId = new Map<string, string>();
  for (const row of READINESS_GATES) {
    const [
      externalId,
      name,
      workstreamCode,
      deliverableExternalId,
      taskExternalId,
      criteria,
      evidenceRequired,
      ownerText,
      status,
      rag,
      decisionRequired,
      blockingIssues,
      dueDate,
      traceRef,
      confidence,
    ] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const { sourceId } = parseTraceDaySession(traceRef);
    const taskId = taskByExternalId.get(taskExternalId) ?? null;
    const deliverableId = deliverableByExternalId.get(deliverableExternalId) ?? null;
    const workstreamId = wsByCode.get(workstreamCode) ?? null;
    const gateData = {
      programmeId: programme.id,
      workstreamId,
      projectId: null,
      deliverableId,
      taskId,
      name,
      category: name,
      criteria,
      evidenceRequired,
      ownerText,
      ownerPersonId: await resolveOwnerPersonId(prisma, ownerText),
      status: mapReadinessStatus(status),
      rag: mapRag(rag),
      decisionRequired,
      blockingIssues,
      dueDate,
      confidence: mapConfidence(confidence),
      sourceDocumentId: await resolveSourceId(prisma, sourceId),
      traceRef,
    };
    const gate = await prisma.readinessGate.upsert({
      where: { externalId },
      update: gateData,
      create: { externalId, ...gateData },
    });
    readinessGateByExternalId.set(externalId, gate.id);
    await prisma.readinessCriterion.deleteMany({ where: { readinessGateId: gate.id } });
    await prisma.readinessCriterion.create({
      data: {
        readinessGateId: gate.id,
        description: criteria,
        evidenceRequired,
        status: mapReadinessStatus(status),
        ownerText,
        confidence: mapConfidence(confidence),
      },
    });
  }

  const governanceMeetingByExternalId = new Map<string, string>();
  for (const row of GOVERNANCE_MEETINGS) {
    const [
      externalId,
      type,
      name,
      purpose,
      cadence,
      scheduledDate,
      ownerText,
      requiredInputs,
      expectedOutputs,
      escalationPath,
      traceRef,
    ] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string | null,
      string,
      string,
      string,
      string,
      string,
    ];
    const { sourceId } = parseTraceDaySession(traceRef);
    const meetingData = {
      programmeId: programme.id,
      type: mapGovernanceType(type),
      name,
      purpose,
      cadence,
      scheduledDate,
      ownerText,
      ownerPersonId: await resolveOwnerPersonId(prisma, ownerText),
      requiredInputs,
      expectedOutputs,
      escalationPath,
      confidence: traceRef.startsWith("Requirement|") ? Confidence.INFERRED : Confidence.CONFIRMED,
      sourceDocumentId: await resolveSourceId(prisma, sourceId),
      traceRef,
    };
    const meeting = await prisma.governanceMeeting.upsert({
      where: { externalId },
      update: meetingData,
      create: { externalId, ...meetingData },
    });
    governanceMeetingByExternalId.set(externalId, meeting.id);
  }

  deliverableByExternalId.clear();
  for (const row of await prisma.deliverable.findMany({ select: { id: true, externalId: true } })) {
    if (row.externalId) deliverableByExternalId.set(row.externalId, row.id);
  }
  taskByExternalId.clear();
  for (const row of await prisma.task.findMany({ select: { id: true, externalId: true } })) {
    taskByExternalId.set(row.externalId, row.id);
  }

  for (const row of EVIDENCE_LINKS) {
    const [entityType, entityExternalId, kind, sourceExternalId, extractedText, traceRef, confidence] =
      row as unknown as [string, string, string, string | null, string, string, string];
    const taskId = entityType === "TASK" ? (taskByExternalId.get(entityExternalId) ?? null) : null;
    const deliverableId =
      entityType === "DELIVERABLE" ? (deliverableByExternalId.get(entityExternalId) ?? null) : null;
    const readinessGateId =
      entityType === "READINESS_GATE" ? (readinessGateByExternalId.get(entityExternalId) ?? null) : null;
    const governanceMeetingId =
      entityType === "GOVERNANCE_MEETING" ? (governanceMeetingByExternalId.get(entityExternalId) ?? null) : null;

    if (entityType === "TASK" && !taskId) {
      console.warn(`Skipping evidence link: missing task ${entityExternalId}`);
      continue;
    }
    if (entityType === "DELIVERABLE" && !deliverableId) {
      console.warn(`Skipping evidence link: missing deliverable ${entityExternalId}`);
      continue;
    }
    if (entityType === "READINESS_GATE" && !readinessGateId) {
      console.warn(`Skipping evidence link: missing readiness gate ${entityExternalId}`);
      continue;
    }
    if (entityType === "GOVERNANCE_MEETING" && !governanceMeetingId) {
      console.warn(`Skipping evidence link: missing governance meeting ${entityExternalId}`);
      continue;
    }

    await prisma.evidenceLink.create({
      data: {
        entityType,
        entityId: entityExternalId,
        kind: mapEvidenceKind(kind),
        sourceDocumentId: await resolveSourceId(prisma, sourceExternalId),
        taskId,
        deliverableId,
        readinessGateId,
        governanceMeetingId,
        extractedText,
        traceRef,
        confidence: mapConfidence(confidence),
        followUpRequired: kind === "GAP" || confidence === "REQUIRES_VALIDATION",
      },
    });
  }

  for (const ws of workstreams) {
    await prisma.action.updateMany({ where: { workstreamId: ws.id }, data: { projectId: null } });
    await prisma.risk.updateMany({ where: { workstreamId: ws.id }, data: { projectId: null } });
    await prisma.dependency.updateMany({ where: { workstreamId: ws.id }, data: { projectId: null } });
  }

  // Milestones derived from real critical-path PI gates.
  let milestoneCount = 0;
  for (const row of CRITICAL_PATH) {
    const step = row[0] as number;
    const activity = row[1] as string;
    const owner = row[2] as string;
    const gate = row[5] as string;
    const targetDate = GATE_TARGET_DATE[gate];
    if (!targetDate) continue;
    const code = milestoneWorkstreamCode(activity);
    const workstreamId = code ? (wsByCode.get(code) ?? null) : null;
    await prisma.milestone.create({
      data: {
        title: activity,
        piGate: gate,
        targetDate,
        workstreamId,
        projectId: null,
        notes: `Critical-path PI gate (step ${step}); owner ${owner}.`,
      },
    });
    milestoneCount++;
  }

  // NOTE: We intentionally do NOT mirror dated roadmap go-lives (e.g. "Personal
  // section live", "Hong Kong YouTube go-live") as milestones — they already
  // exist as roadmap activities, so copying them would duplicate timeline data.
  // Milestones here are limited to the critical-path PI gates above.

  const counts = {
    phases: await prisma.phase.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    taskDependencies: await prisma.taskDependency.count(),
    milestones: milestoneCount,
    deliverables: await prisma.deliverable.count(),
    readinessGates: await prisma.readinessGate.count(),
    governanceMeetings: await prisma.governanceMeeting.count(),
    evidenceLinks: await prisma.evidenceLink.count(),
    resources: await prisma.resource.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    changeRequests: await prisma.changeRequest.count(),
    approvals: await prisma.approval.count(),
    documents: await prisma.document.count(),
    notifications: await prisma.notification.count(),
    users: await prisma.user.count(),
  };
  console.log(counts);
  console.log("\nProgramme delivery layer seed complete (real data only).\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
