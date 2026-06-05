import { prisma } from "@/lib/db";
import { riskScore } from "@/lib/enums";
import { relativeDays } from "@/lib/utils";
import { formatOwnerDisplay } from "@/lib/format-person";
import { hasColumn, hasTable } from "@/lib/services/schema-guards";

export const RAG_FILL: Record<string, string> = {
  RED: "var(--rag-red)",
  AMBER: "var(--rag-amber)",
  GREEN: "var(--rag-green)",
  UNSET: "var(--muted-foreground)",
};

const RISK_CLOSED = /closed|resolved|mitigated|done|complete|retired|accepted/i;
const MILESTONE_DONE = /complete|done|met|achieved|delivered/i;

export function isRiskOpen(status: string | null | undefined): boolean {
  if (!status) return true;
  return !RISK_CLOSED.test(status);
}

export interface DashboardData {
  programme: { name: string; rag: string | null } | null;
  metrics: {
    activeProjects: number;
    workstreams: number;
    openRisks: number;
    openIssues: number;
    overdueActions: number;
    pendingApprovals: number;
    upcomingMilestones: number;
    blockedDependencies: number;
    deliverables: number;
    readinessScore: number;
    blockedReadinessGates: number;
    criticalPathTasks: number;
    governanceMeetings: number;
    evidenceFollowUps: number;
  };
  ragDistribution: { name: string; value: number; fill?: string }[];
  riskHeatmap: { probability: string; impact: string }[];
  issueAgeing: { bucket: string; count: number }[];
  milestoneStatus: { name: string; value: number; fill?: string }[];
  milestonePercentComplete: number;
  topRisks: {
    id: string;
    externalId: string;
    description: string;
    category: string;
    probability: string;
    impact: string;
    score: number;
    status: string;
    owner: string;
  }[];
  escalations: {
    id: string;
    title: string;
    body: string | null;
    priority: string;
    createdAt: string;
  }[];
  pendingApprovalsList: {
    id: string;
    externalId: string;
    title: string;
    approver: string;
    priority: string;
    dueDate: string | null;
  }[];
  execSummary: {
    day: string;
    version: string | null;
    excerpt: string;
    publishedAt: string | null;
  } | null;
}

function ageBucket(days: number | null): number {
  if (days === null) return 3;
  if (days <= 7) return 0;
  if (days <= 30) return 1;
  if (days <= 90) return 2;
  return 3;
}

function excerpt(markdown: string, max = 600): string {
  const text = markdown
    .replace(/[#>*_`]/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    programme,
    projects,
    workstreamCount,
    risks,
    issues,
    actionsOpen,
    pendingApprovals,
    milestones,
    blockedDependencies,
    escalations,
    pendingApprovalRows,
    execSummary,
    deliverables,
    readinessGates,
    criticalPathTasks,
    governanceMeetings,
    evidenceFollowUps,
  ] = await Promise.all([
    prisma.programme.findFirst({
      orderBy: { createdAt: "asc" },
      select: { name: true, rag: true },
    }),
    prisma.project.findMany({ select: { rag: true, status: true } }),
    prisma.workstream.count(),
    prisma.risk.findMany({
      select: {
        id: true,
        externalId: true,
        description: true,
        category: true,
        probability: true,
        impact: true,
        status: true,
        ownerPerson: { select: { displayName: true, surname: true } },
        ownerText: true,
      },
    }),
    prisma.issue.findMany({ select: { status: true, createdAt: true } }),
    prisma.action.count({ where: { status: { notIn: ["DONE"] } } }),
    prisma.approval.count({ where: { status: "PENDING" } }),
    prisma.milestone.findMany({ select: { status: true } }),
    prisma.dependency.count({ where: { status: { in: ["BLOCKED", "AT_RISK"] } } }),
    prisma.notification.findMany({
      where: { type: "ESCALATION" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, body: true, priority: true, createdAt: true },
    }),
    prisma.approval.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        externalId: true,
        title: true,
        priority: true,
        dueDate: true,
        approverPerson: { select: { displayName: true, surname: true } },
        approverText: true,
      },
    }),
    prisma.executiveSummary.findFirst({
      orderBy: [{ day: "desc" }, { updatedAt: "desc" }],
      select: { day: true, version: true, bodyMarkdown: true, publishedAt: true },
    }),
    hasColumn("Deliverable", "externalId").then((exists) => exists ? prisma.deliverable.count() : 0),
    hasTable("ReadinessGate").then((exists) => exists ? prisma.readinessGate.findMany({ select: { status: true } }) : []),
    hasTable("Task").then((exists) => exists ? prisma.task.count({ where: { criticalPath: true } }) : 0),
    hasTable("GovernanceMeeting").then((exists) => exists ? prisma.governanceMeeting.count() : 0),
    hasTable("EvidenceLink").then((exists) => exists ? prisma.evidenceLink.count({ where: { followUpRequired: true } }) : 0),
  ]);

  // RAG distribution (projects by rag)
  const ragCounts: Record<string, number> = { RED: 0, AMBER: 0, GREEN: 0, UNSET: 0 };
  for (const p of projects) {
    const key = p.rag ?? "UNSET";
    ragCounts[key] = (ragCounts[key] ?? 0) + 1;
  }
  const ragDistribution = (["RED", "AMBER", "GREEN", "UNSET"] as const)
    .filter((k) => ragCounts[k] > 0)
    .map((k) => ({
      name: k === "UNSET" ? "Not set" : k.charAt(0) + k.slice(1).toLowerCase(),
      value: ragCounts[k],
      fill: RAG_FILL[k],
    }));

  // Risk heatmap source + open count + top risks
  const openRisks = risks.filter((r) => isRiskOpen(r.status)).length;
  const riskHeatmap = risks.map((r) => ({
    probability: r.probability,
    impact: r.impact,
  }));
  const topRisks = [...risks]
    .map((r) => ({
      id: r.id,
      externalId: r.externalId,
      description: r.description,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      score: riskScore(r.probability, r.impact),
      status: r.status,
      owner: formatOwnerDisplay(r.ownerText, r.ownerPerson),
    }))
    .filter((r) => isRiskOpen(r.status))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Issue ageing
  const openIssues = issues.filter(
    (i) => i.status === "OPEN" || i.status === "IN_PROGRESS",
  ).length;
  const bucketLabels = ["≤7d", "8–30d", "31–90d", ">90d"];
  const bucketCounts = [0, 0, 0, 0];
  for (const i of issues) {
    bucketCounts[ageBucket(relativeDays(i.createdAt))] += 1;
  }
  const issueAgeing = bucketLabels.map((bucket, idx) => ({
    bucket,
    count: bucketCounts[idx],
  }));

  // Milestone status + completion
  const msCounts: Record<string, number> = {};
  let msDone = 0;
  for (const m of milestones) {
    const label = m.status?.trim() || "Unset";
    msCounts[label] = (msCounts[label] ?? 0) + 1;
    if (m.status && MILESTONE_DONE.test(m.status)) msDone += 1;
  }
  const milestoneStatus = Object.entries(msCounts).map(([name, value]) => ({
    name,
    value,
    fill: MILESTONE_DONE.test(name) ? RAG_FILL.GREEN : "var(--chart-1)",
  }));
  const milestonePercentComplete = milestones.length
    ? Math.round((msDone / milestones.length) * 100)
    : 0;
  const upcomingMilestones = milestones.length - msDone;
  const readyGates = readinessGates.filter(
    (gate) => gate.status === "READY" || gate.status === "APPROVED",
  ).length;
  const readinessScore = readinessGates.length
    ? Math.round((readyGates / readinessGates.length) * 100)
    : 0;
  const blockedReadinessGates = readinessGates.filter((gate) => gate.status === "BLOCKED").length;

  return {
    programme: programme ? { name: programme.name, rag: programme.rag } : null,
    metrics: {
      activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
      workstreams: workstreamCount,
      openRisks,
      openIssues,
      overdueActions: actionsOpen,
      pendingApprovals,
      upcomingMilestones,
      blockedDependencies,
      deliverables,
      readinessScore,
      blockedReadinessGates,
      criticalPathTasks,
      governanceMeetings,
      evidenceFollowUps,
    },
    ragDistribution,
    riskHeatmap,
    issueAgeing,
    milestoneStatus,
    milestonePercentComplete,
    topRisks,
    escalations: escalations.map((e) => ({
      id: e.id,
      title: e.title,
      body: e.body,
      priority: e.priority,
      createdAt: e.createdAt.toISOString(),
    })),
    pendingApprovalsList: pendingApprovalRows.map((a) => ({
      id: a.id,
      externalId: a.externalId,
      title: a.title,
      approver: formatOwnerDisplay(a.approverText, a.approverPerson),
      priority: a.priority,
      dueDate: a.dueDate ?? null,
    })),
    execSummary: execSummary
      ? {
          day: execSummary.day,
          version: execSummary.version,
          excerpt: excerpt(execSummary.bodyMarkdown),
          publishedAt: execSummary.publishedAt
            ? execSummary.publishedAt.toISOString()
            : null,
        }
      : null,
  };
}
