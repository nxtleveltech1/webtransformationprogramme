import { prisma } from "@/lib/db";
import type { ControlColumn, ControlRow } from "@/components/shared/programme-control-table";
import { hasColumn, hasTable } from "@/lib/services/schema-guards";

function isMissingControlSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /does not exist in the current database|column .* does not exist|table .* does not exist/i.test(message);
}

function ownerName(person: { displayName: string; surname?: string | null } | null | undefined, fallback?: string | null) {
  const name = person ? [person.displayName, person.surname].filter(Boolean).join(" ").trim() : "";
  return name || fallback || "Unassigned";
}

export const WBS_COLUMNS: ControlColumn[] = [
  { key: "externalId", label: "ID", kind: "mono" },
  { key: "phase", label: "Phase" },
  { key: "workstream", label: "Workstream" },
  { key: "title", label: "Task" },
  { key: "owner", label: "Owner" },
  { key: "baselineStartDate", label: "Start", kind: "date" },
  { key: "baselineEndDate", label: "End", kind: "date" },
  { key: "status", label: "Status", kind: "status" },
  { key: "rag", label: "RAG", kind: "rag" },
  { key: "percentComplete", label: "%", kind: "number" },
  { key: "criticalPath", label: "Critical" },
  { key: "confidence", label: "Confidence", kind: "confidence" },
];

export const DELIVERABLE_COLUMNS: ControlColumn[] = [
  { key: "externalId", label: "ID", kind: "mono" },
  { key: "name", label: "Deliverable" },
  { key: "workstream", label: "Workstream" },
  { key: "owner", label: "Owner" },
  { key: "startDate", label: "Start", kind: "date" },
  { key: "dueDate", label: "Due", kind: "date" },
  { key: "status", label: "Status", kind: "status" },
  { key: "rag", label: "RAG", kind: "rag" },
  { key: "confidence", label: "Confidence", kind: "confidence" },
];

export const READINESS_COLUMNS: ControlColumn[] = [
  { key: "externalId", label: "ID", kind: "mono" },
  { key: "name", label: "Gate" },
  { key: "workstream", label: "Workstream" },
  { key: "owner", label: "Owner" },
  { key: "dueDate", label: "Due", kind: "date" },
  { key: "status", label: "Status", kind: "status" },
  { key: "rag", label: "RAG", kind: "rag" },
  { key: "blockingIssues", label: "Blockers" },
  { key: "confidence", label: "Confidence", kind: "confidence" },
];

export const EVIDENCE_COLUMNS: ControlColumn[] = [
  { key: "kind", label: "Kind", kind: "status" },
  { key: "entityType", label: "Entity Type" },
  { key: "entityId", label: "Entity ID", kind: "mono" },
  { key: "source", label: "Source" },
  { key: "confidence", label: "Confidence", kind: "confidence" },
  { key: "followUpRequired", label: "Follow-up" },
  { key: "traceRef", label: "Trace" },
];

export const GOVERNANCE_CALENDAR_COLUMNS: ControlColumn[] = [
  { key: "externalId", label: "ID", kind: "mono" },
  { key: "type", label: "Type", kind: "status" },
  { key: "name", label: "Meeting" },
  { key: "cadence", label: "Cadence" },
  { key: "scheduledDate", label: "Date", kind: "date" },
  { key: "owner", label: "Owner" },
  { key: "confidence", label: "Confidence", kind: "confidence" },
];

export async function getWbsControlData() {
  if (!(await hasTable("Task"))) {
    return { rows: [], summary: { total: 0, critical: 0, blocked: 0, inferred: 0 } };
  }
  try {
    const tasks = await prisma.task.findMany({
    orderBy: [{ phase: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      phase: { select: { code: true, name: true } },
      workstream: { select: { name: true } },
      ownerPerson: { select: { displayName: true, surname: true } },
      deliverable: { select: { externalId: true, name: true } },
      _count: { select: { predecessorLinks: true, successorLinks: true, evidenceLinks: true } },
    },
    });

    const rows: ControlRow[] = tasks.map((task) => ({
    externalId: task.externalId,
    phase: task.phase ? `${task.phase.code} ${task.phase.name}` : "Unassigned",
    workstream: task.workstream?.name ?? "Unassigned",
    title: task.title,
    owner: ownerName(task.ownerPerson, task.ownerText),
    baselineStartDate: task.baselineStartDate,
    baselineEndDate: task.baselineEndDate,
    status: task.status,
    rag: task.rag,
    percentComplete: task.percentComplete,
    criticalPath: task.criticalPath ? "Yes" : "No",
    confidence: task.confidence,
    evidenceLinks: task._count.evidenceLinks,
    channel: task.channel,
    domain: task.domain,
    areaJourney: task.areaJourney,
    cluster: task.cluster,
    market: task.market,
    }));

    return {
      rows,
      summary: {
        total: tasks.length,
        critical: tasks.filter((task) => task.criticalPath).length,
        blocked: tasks.filter((task) => task.status === "BLOCKED").length,
        inferred: tasks.filter((task) => task.confidence === "INFERRED").length,
      },
    };
  } catch (error) {
    if (!isMissingControlSchemaError(error)) throw error;
    return { rows: [], summary: { total: 0, critical: 0, blocked: 0, inferred: 0 } };
  }
}

export async function getDeliverablesControlData() {
  if (!(await hasColumn("Deliverable", "externalId")) || !(await hasTable("Task"))) {
    return { rows: [], summary: { total: 0, atRisk: 0, complete: 0, inferred: 0 } };
  }
  try {
    const deliverables = await prisma.deliverable.findMany({
    orderBy: [{ dueDate: "asc" }, { name: "asc" }],
    include: {
      phase: { select: { code: true, name: true } },
      workstream: { select: { name: true } },
      ownerPerson: { select: { displayName: true, surname: true } },
      _count: { select: { tasks: true, risks: true, decisions: true, evidenceLinks: true } },
    },
    });

    const rows: ControlRow[] = deliverables.map((deliverable) => ({
    externalId: deliverable.externalId,
    name: deliverable.name,
    phase: deliverable.phase ? `${deliverable.phase.code} ${deliverable.phase.name}` : "Unassigned",
    workstream: deliverable.workstream?.name ?? "Unassigned",
    owner: ownerName(deliverable.ownerPerson, deliverable.ownerText),
    startDate: deliverable.startDate,
    dueDate: deliverable.dueDate,
    status: deliverable.status,
    rag: deliverable.rag,
    confidence: deliverable.confidence,
    tasks: deliverable._count.tasks,
    risks: deliverable._count.risks,
    decisions: deliverable._count.decisions,
    evidenceLinks: deliverable._count.evidenceLinks,
    }));

    return {
      rows,
      summary: {
        total: deliverables.length,
        atRisk: deliverables.filter((deliverable) => deliverable.rag === "RED" || deliverable.rag === "AMBER").length,
        complete: deliverables.filter((deliverable) => deliverable.status === "COMPLETE").length,
        inferred: deliverables.filter((deliverable) => deliverable.confidence === "INFERRED").length,
      },
    };
  } catch (error) {
    if (!isMissingControlSchemaError(error)) throw error;
    return { rows: [], summary: { total: 0, atRisk: 0, complete: 0, inferred: 0 } };
  }
}

export async function getReadinessControlData() {
  if (!(await hasTable("ReadinessGate"))) {
    return { rows: [], summary: { total: 0, ready: 0, blocked: 0, score: 0 } };
  }
  try {
    const gates = await prisma.readinessGate.findMany({
    orderBy: [{ dueDate: "asc" }, { externalId: "asc" }],
    include: {
      workstream: { select: { name: true } },
      ownerPerson: { select: { displayName: true, surname: true } },
      _count: { select: { criteriaItems: true, evidenceLinks: true } },
    },
    });

    const ready = gates.filter((gate) => gate.status === "READY" || gate.status === "APPROVED").length;
    const rows: ControlRow[] = gates.map((gate) => ({
    externalId: gate.externalId,
    name: gate.name,
    workstream: gate.workstream?.name ?? "Unassigned",
    owner: ownerName(gate.ownerPerson, gate.ownerText),
    dueDate: gate.dueDate,
    status: gate.status,
    rag: gate.rag,
    decisionRequired: gate.decisionRequired,
    blockingIssues: gate.blockingIssues,
    confidence: gate.confidence,
    criteria: gate._count.criteriaItems,
    evidenceLinks: gate._count.evidenceLinks,
    }));

    return {
      rows,
      summary: {
        total: gates.length,
        ready,
        blocked: gates.filter((gate) => gate.status === "BLOCKED").length,
        score: gates.length ? Math.round((ready / gates.length) * 100) : 0,
      },
    };
  } catch (error) {
    if (!isMissingControlSchemaError(error)) throw error;
    return { rows: [], summary: { total: 0, ready: 0, blocked: 0, score: 0 } };
  }
}

export async function getEvidenceControlData() {
  if (!(await hasTable("EvidenceLink"))) {
    return { rows: [], summary: { total: 0, confirmed: 0, inferred: 0, followUp: 0 } };
  }
  try {
    const evidenceLinks = await prisma.evidenceLink.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      sourceDocument: { select: { externalId: true, filePath: true, workshopDay: true } },
    },
    });

    const rows: ControlRow[] = evidenceLinks.map((link) => ({
    kind: link.kind,
    entityType: link.entityType,
    entityId: link.entityId,
    source: link.sourceDocument
      ? `${link.sourceDocument.externalId} (Day ${link.sourceDocument.workshopDay ?? "?"})`
      : "Professional inference / requirement",
    confidence: link.confidence,
    followUpRequired: link.followUpRequired ? "Yes" : "No",
    traceRef: link.traceRef,
    extractedText: link.extractedText,
    }));

    return {
      rows,
      summary: {
        total: evidenceLinks.length,
        confirmed: evidenceLinks.filter((link) => link.confidence === "CONFIRMED").length,
        inferred: evidenceLinks.filter((link) => link.confidence === "INFERRED").length,
        followUp: evidenceLinks.filter((link) => link.followUpRequired).length,
      },
    };
  } catch (error) {
    if (!isMissingControlSchemaError(error)) throw error;
    return { rows: [], summary: { total: 0, confirmed: 0, inferred: 0, followUp: 0 } };
  }
}

export async function getGovernanceCalendarControlData() {
  if (!(await hasTable("GovernanceMeeting"))) {
    return { rows: [], summary: { total: 0, goNoGo: 0, hypercare: 0, inferred: 0 } };
  }
  try {
    const meetings = await prisma.governanceMeeting.findMany({
    orderBy: [{ scheduledDate: "asc" }, { externalId: "asc" }],
    include: {
      ownerPerson: { select: { displayName: true, surname: true } },
      _count: { select: { evidenceLinks: true, statusUpdates: true } },
    },
    });

    const rows: ControlRow[] = meetings.map((meeting) => ({
    externalId: meeting.externalId,
    type: meeting.type,
    name: meeting.name,
    cadence: meeting.cadence,
    scheduledDate: meeting.scheduledDate,
    owner: ownerName(meeting.ownerPerson, meeting.ownerText),
    requiredInputs: meeting.requiredInputs,
    expectedOutputs: meeting.expectedOutputs,
    confidence: meeting.confidence,
    evidenceLinks: meeting._count.evidenceLinks,
    statusUpdates: meeting._count.statusUpdates,
    }));

    return {
      rows,
      summary: {
        total: meetings.length,
        goNoGo: meetings.filter((meeting) => meeting.type === "GO_NO_GO").length,
        hypercare: meetings.filter((meeting) => meeting.type === "HYPERCARE_STANDUP").length,
        inferred: meetings.filter((meeting) => meeting.confidence === "INFERRED").length,
      },
    };
  } catch (error) {
    if (!isMissingControlSchemaError(error)) throw error;
    return { rows: [], summary: { total: 0, goNoGo: 0, hypercare: 0, inferred: 0 } };
  }
}
