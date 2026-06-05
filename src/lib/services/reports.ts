import { prisma } from "@/lib/db";
import { formatOwnerDisplay, formatWorkstreamLead } from "@/lib/format-person";
import { riskScore } from "@/lib/enums";
import { relativeDays } from "@/lib/utils";
import { isRiskOpen } from "@/lib/services/dashboard";
import { hasColumn, hasTable } from "@/lib/services/schema-guards";

export interface ProjectReportRow {
  id: string;
  code: string;
  name: string;
  programme: string;
  workstream: string;
  status: string;
  priority: string;
  rag: string | null;
  owner: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface WorkstreamReportRow {
  id: string;
  code: string;
  name: string;
  lead: string;
  rag: string | null;
  status: string;
  projects: number;
  risks: number;
  createdAt: string;
}

export interface RiskReportRow {
  id: string;
  externalId: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  score: number;
  status: string;
  owner: string;
  workstream: string;
  open: boolean;
  createdAt: string;
}

export interface IssueReportRow {
  id: string;
  externalId: string;
  description: string;
  status: string;
  impact: string;
  owner: string;
  project: string;
  ageDays: number | null;
  createdAt: string;
}

export interface DependencyReportRow {
  id: string;
  externalId: string;
  description: string;
  status: string;
  providingTeam: string;
  receivingTeam: string;
  requiredDate: string;
  workstream: string;
  createdAt: string;
}

export interface DecisionReportRow {
  id: string;
  externalId: string;
  title: string;
  category: string;
  status: string;
  owner: string;
  workstream: string;
  createdAt: string;
}

export interface AssumptionReportRow {
  id: string;
  externalId: string;
  description: string;
  areaImpacted: string;
  validator: string;
  createdAt: string;
}

export interface MilestoneReportRow {
  id: string;
  title: string;
  targetDate: string;
  status: string;
  varianceDays: number | null;
  workstream: string;
  project: string;
  createdAt: string;
}

export interface WorkloadReportRow {
  id: string;
  name: string;
  role: string;
  team: string;
  allocationPct: number;
  capacityHours: number | null;
  allocations: number;
  createdAt: string;
}

export interface ReportsData {
  projects: ProjectReportRow[];
  workstreams: WorkstreamReportRow[];
  risks: RiskReportRow[];
  issues: IssueReportRow[];
  dependencies: DependencyReportRow[];
  decisions: DecisionReportRow[];
  assumptions: AssumptionReportRow[];
  milestones: MilestoneReportRow[];
  workload: WorkloadReportRow[];
  execSummaries: {
    id: string;
    day: string;
    version: string | null;
    bodyMarkdown: string;
    publishedAt: string | null;
  }[];
  controlSummary: {
    deliverables: number;
    wbsTasks: number;
    criticalPathTasks: number;
    readinessGates: number;
    readinessScore: number;
    governanceMeetings: number;
    evidenceLinks: number;
    evidenceFollowUps: number;
  };
  workstreamOptions: string[];
}

const DASH = "\u2014";

export async function getReportsData(): Promise<ReportsData> {
  const [
    projects,
    workstreams,
    risks,
    issues,
    dependencies,
    decisions,
    assumptions,
    milestones,
    resources,
    execSummaries,
    deliverableCount,
    taskCounts,
    readinessGates,
    governanceMeetingCount,
    evidenceCounts,
  ] = await Promise.all([
    prisma.project.findMany({
      orderBy: { name: "asc" },
      include: {
        programme: { select: { name: true } },
        workstream: { select: { name: true } },
        ownerPerson: { select: { displayName: true, surname: true } },
      },
    }),
    prisma.workstream.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        leadPerson: { select: { displayName: true, surname: true } },
        _count: { select: { projects: true, risks: true } },
      },
    }),
    prisma.risk.findMany({
      orderBy: { externalId: "asc" },
      select: {
        id: true,
        externalId: true,
        description: true,
        category: true,
        probability: true,
        impact: true,
        status: true,
        ownerText: true,
        createdAt: true,
        ownerPerson: { select: { displayName: true, surname: true } },
        workstream: { select: { name: true } },
      },
    }),
    prisma.issue.findMany({
      orderBy: { externalId: "asc" },
      select: {
        id: true,
        externalId: true,
        description: true,
        status: true,
        currentImpact: true,
        ownerText: true,
        createdAt: true,
        ownerPerson: { select: { displayName: true, surname: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.dependency.findMany({
      orderBy: { externalId: "asc" },
      select: {
        id: true,
        externalId: true,
        description: true,
        status: true,
        providingTeam: true,
        receivingTeam: true,
        requiredDate: true,
        createdAt: true,
        workstream: { select: { name: true } },
      },
    }),
    prisma.decision.findMany({
      orderBy: { externalId: "asc" },
      select: {
        id: true,
        externalId: true,
        title: true,
        description: true,
        category: true,
        status: true,
        ownerText: true,
        createdAt: true,
        ownerPerson: { select: { displayName: true, surname: true } },
        workstream: { select: { name: true } },
      },
    }),
    prisma.assumption.findMany({
      orderBy: { externalId: "asc" },
      include: { validatorPerson: { select: { displayName: true } } },
    }),
    prisma.milestone.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        targetDate: true,
        status: true,
        varianceDays: true,
        createdAt: true,
        workstream: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.resource.findMany({
      orderBy: { displayName: "asc" },
      include: { allocations: { select: { allocationPct: true } } },
    }),
    prisma.executiveSummary.findMany({
      orderBy: [{ day: "desc" }],
      select: {
        id: true,
        day: true,
        version: true,
        bodyMarkdown: true,
        publishedAt: true,
      },
    }),
    hasColumn("Deliverable", "externalId").then((exists) => exists ? prisma.deliverable.count() : 0),
    hasTable("Task").then((exists) =>
      exists
        ? Promise.all([
            prisma.task.count(),
            prisma.task.count({ where: { criticalPath: true } }),
          ])
        : [0, 0],
    ),
    hasTable("ReadinessGate").then((exists) => exists ? prisma.readinessGate.findMany({ select: { status: true } }) : []),
    hasTable("GovernanceMeeting").then((exists) => exists ? prisma.governanceMeeting.count() : 0),
    hasTable("EvidenceLink").then((exists) =>
      exists
        ? Promise.all([
            prisma.evidenceLink.count(),
            prisma.evidenceLink.count({ where: { followUpRequired: true } }),
          ])
        : [0, 0],
    ),
  ]);

  const projectRows: ProjectReportRow[] = projects.map((p) => ({
    id: p.id,
    code: p.code ?? DASH,
    name: p.name,
    programme: p.programme?.name ?? DASH,
    workstream: p.workstream?.name ?? DASH,
    status: p.status,
    priority: p.priority,
    rag: p.rag,
    owner: formatOwnerDisplay(p.ownerText, p.ownerPerson),
    startDate: p.startDate ?? DASH,
    endDate: p.endDate ?? DASH,
    createdAt: p.createdAt.toISOString(),
  }));

  const workstreamRows: WorkstreamReportRow[] = workstreams.map((w) => ({
    id: w.id,
    code: w.code,
    name: w.name,
    lead: formatWorkstreamLead(w.leadText, w.leadPerson),
    rag: w.rag,
    status: w.oneLineStatus ?? DASH,
    projects: w._count.projects,
    risks: w._count.risks,
    createdAt: w.createdAt.toISOString(),
  }));

  const riskRows: RiskReportRow[] = risks.map((r) => ({
    id: r.id,
    externalId: r.externalId,
    description: r.description,
    category: r.category,
    probability: r.probability,
    impact: r.impact,
    score: riskScore(r.probability, r.impact),
    status: r.status,
    owner: formatOwnerDisplay(r.ownerText, r.ownerPerson),
    workstream: r.workstream?.name ?? DASH,
    open: isRiskOpen(r.status),
    createdAt: r.createdAt.toISOString(),
  }));

  const issueRows: IssueReportRow[] = issues.map((i) => ({
    id: i.id,
    externalId: i.externalId,
    description: i.description,
    status: i.status,
    impact: i.currentImpact ?? DASH,
    owner: formatOwnerDisplay(i.ownerText, i.ownerPerson),
    project: i.project?.name ?? DASH,
    ageDays: relativeDays(i.createdAt),
    createdAt: i.createdAt.toISOString(),
  }));

  const dependencyRows: DependencyReportRow[] = dependencies.map((d) => ({
    id: d.id,
    externalId: d.externalId,
    description: d.description,
    status: d.status,
    providingTeam: d.providingTeam ?? DASH,
    receivingTeam: d.receivingTeam ?? DASH,
    requiredDate: d.requiredDate ?? DASH,
    workstream: d.workstream?.name ?? DASH,
    createdAt: d.createdAt.toISOString(),
  }));

  const decisionRows: DecisionReportRow[] = decisions.map((d) => ({
    id: d.id,
    externalId: d.externalId,
    title: d.title ?? d.description.slice(0, 80),
    category: d.category ?? DASH,
    status: d.status,
    owner: formatOwnerDisplay(d.ownerText, d.ownerPerson),
    workstream: d.workstream?.name ?? DASH,
    createdAt: d.createdAt.toISOString(),
  }));

  const assumptionRows: AssumptionReportRow[] = assumptions.map((a) => ({
    id: a.id,
    externalId: a.externalId,
    description: a.description,
    areaImpacted: a.areaImpacted ?? DASH,
    validator: a.validatorPerson?.displayName ?? a.validatorText ?? "Unassigned",
    createdAt: a.createdAt.toISOString(),
  }));

  const milestoneRows: MilestoneReportRow[] = milestones.map((m) => ({
    id: m.id,
    title: m.title,
    targetDate: m.targetDate ?? DASH,
    status: m.status ?? "Unset",
    varianceDays: m.varianceDays,
    workstream: m.workstream?.name ?? DASH,
    project: m.project?.name ?? DASH,
    createdAt: m.createdAt.toISOString(),
  }));

  const workloadRows: WorkloadReportRow[] = resources.map((r) => ({
    id: r.id,
    name: r.displayName,
    role: r.role ?? DASH,
    team: r.team ?? DASH,
    allocationPct: r.allocations.reduce((sum, a) => sum + a.allocationPct, 0),
    capacityHours: r.capacityHours,
    allocations: r.allocations.length,
    createdAt: r.createdAt.toISOString(),
  }));

  const workstreamOptions = Array.from(
    new Set(workstreams.map((w) => w.name)),
  ).sort();
  const readyGates = readinessGates.filter((gate) => gate.status === "READY" || gate.status === "APPROVED").length;
  const readinessScore = readinessGates.length ? Math.round((readyGates / readinessGates.length) * 100) : 0;

  return {
    projects: projectRows,
    workstreams: workstreamRows,
    risks: riskRows,
    issues: issueRows,
    dependencies: dependencyRows,
    decisions: decisionRows,
    assumptions: assumptionRows,
    milestones: milestoneRows,
    workload: workloadRows,
    execSummaries: execSummaries.map((e) => ({
      id: e.id,
      day: e.day,
      version: e.version,
      bodyMarkdown: e.bodyMarkdown,
      publishedAt: e.publishedAt ? e.publishedAt.toISOString() : null,
    })),
    controlSummary: {
      deliverables: deliverableCount,
      wbsTasks: taskCounts[0],
      criticalPathTasks: taskCounts[1],
      readinessGates: readinessGates.length,
      readinessScore,
      governanceMeetings: governanceMeetingCount,
      evidenceLinks: evidenceCounts[0],
      evidenceFollowUps: evidenceCounts[1],
    },
    workstreamOptions,
  };
}
