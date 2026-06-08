/**
 * Steering Pack assembly.
 *
 * Composes the branded "Steering Pack" view model and the matching multi-sheet
 * export workbook PURELY from existing services — `getDashboardData` and
 * `getReportsData`. No new queries, no fabricated values: anything missing is
 * rendered as an em dash ("—") by the consumers (cellText / the page).
 */

import { getDashboardData, type DashboardData } from "@/lib/services/dashboard";
import { getReportsData, type ReportsData } from "@/lib/services/reports";
import { stripMarkdown } from "@/lib/utils";
import { toExportRows, type ExportSheet, type ExportWorkbook } from "./types";

export interface SteeringPackData {
  generatedAt: string;
  dashboard: DashboardData;
  reports: ReportsData;
}

/** Fetch everything the Steering Pack needs from existing services. */
export async function getSteeringPackData(): Promise<SteeringPackData> {
  const [dashboard, reports] = await Promise.all([
    getDashboardData(),
    getReportsData(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    dashboard,
    reports,
  };
}

/** The single combined workbook used by the Excel export route. */
export function buildReportsWorkbook(reports: ReportsData): ExportWorkbook {
  const sheets: ExportSheet[] = [
    {
      name: "Project RAG",
      columns: ["code", "name", "programme", "workstream", "status", "priority", "rag", "owner", "startDate", "endDate"],
      headers: {
        code: "Code", name: "Project", programme: "Programme", workstream: "Workstream",
        status: "Status", priority: "Priority", rag: "RAG", owner: "Owner",
        startDate: "Start", endDate: "End",
      },
      rows: toExportRows(reports.projects),
    },
    {
      name: "Workstream RAG",
      columns: ["code", "name", "lead", "rag", "status", "projects", "risks"],
      headers: {
        code: "Code", name: "Workstream", lead: "Lead", rag: "RAG",
        status: "One-line status", projects: "Projects", risks: "Risks",
      },
      rows: toExportRows(reports.workstreams),
    },
    {
      name: "Risks",
      columns: ["externalId", "description", "category", "probability", "impact", "score", "status", "owner", "workstream", "open"],
      headers: {
        externalId: "Ref", description: "Risk", category: "Category", probability: "Probability",
        impact: "Impact", score: "Score", status: "Status", owner: "Owner",
        workstream: "Workstream", open: "Open",
      },
      rows: toExportRows(reports.risks),
    },
    {
      name: "Issues",
      columns: ["externalId", "description", "status", "impact", "owner", "project", "ageDays"],
      headers: {
        externalId: "Ref", description: "Issue", status: "Status", impact: "Impact",
        owner: "Owner", project: "Project", ageDays: "Age (days)",
      },
      rows: toExportRows(reports.issues),
    },
    {
      name: "Dependencies",
      columns: ["externalId", "description", "status", "providingTeam", "receivingTeam", "requiredDate", "workstream"],
      headers: {
        externalId: "Ref", description: "Dependency", status: "Status",
        providingTeam: "Providing team", receivingTeam: "Receiving team",
        requiredDate: "Required", workstream: "Workstream",
      },
      rows: toExportRows(reports.dependencies),
    },
    {
      name: "Decisions",
      columns: ["externalId", "title", "category", "status", "owner", "workstream"],
      headers: {
        externalId: "Ref", title: "Decision", category: "Category",
        status: "Status", owner: "Owner", workstream: "Workstream",
      },
      rows: toExportRows(reports.decisions),
    },
    {
      name: "Assumptions",
      columns: ["externalId", "description", "areaImpacted", "validator"],
      headers: {
        externalId: "Ref", description: "Assumption", areaImpacted: "Area impacted",
        validator: "Validator",
      },
      rows: toExportRows(reports.assumptions),
    },
    {
      name: "Milestones",
      columns: ["title", "targetDate", "status", "varianceDays", "workstream", "project"],
      headers: {
        title: "Milestone", targetDate: "Target", status: "Status",
        varianceDays: "Variance (days)", workstream: "Workstream", project: "Project",
      },
      rows: toExportRows(reports.milestones),
    },
    {
      name: "Resource workload",
      columns: ["name", "role", "team", "allocationPct", "allocations", "capacityHours"],
      headers: {
        name: "Resource", role: "Role", team: "Team", allocationPct: "Allocation %",
        allocations: "Assignments", capacityHours: "Capacity (h)",
      },
      rows: toExportRows(reports.workload),
    },
  ];

  return {
    title: "OM Programme Control — Reports Export",
    subtitle: `Generated ${new Date().toLocaleString("en-GB")}`,
    sheets,
  };
}

/**
 * The Steering Pack workbook: a one-page control summary up front, then the
 * key governance datasets. Reuses the same flat report rows as the UI.
 */
export function buildSteeringPackWorkbook(data: SteeringPackData): ExportWorkbook {
  const { dashboard, reports } = data;
  const m = dashboard.metrics;

  const summarySheet: ExportSheet = {
    name: "Steering Summary",
    columns: ["metric", "value"],
    headers: { metric: "Metric", value: "Value" },
    rows: [
      { metric: "Programme", value: dashboard.programme?.name ?? null },
      { metric: "Programme RAG", value: dashboard.programme?.rag ?? null },
      { metric: "Active projects", value: m.activeProjects },
      { metric: "Workstreams", value: m.workstreams },
      { metric: "Open risks", value: m.openRisks },
      { metric: "Open issues", value: m.openIssues },
      { metric: "Overdue / open actions", value: m.overdueActions },
      { metric: "Pending approvals", value: m.pendingApprovals },
      { metric: "Upcoming milestones", value: m.upcomingMilestones },
      { metric: "Blocked dependencies", value: m.blockedDependencies },
      { metric: "Deliverables", value: m.deliverables },
      { metric: "Readiness score (%)", value: m.readinessScore },
      { metric: "Blocked readiness gates", value: m.blockedReadinessGates },
      { metric: "Critical path tasks", value: m.criticalPathTasks },
      { metric: "Governance meetings", value: m.governanceMeetings },
      { metric: "Evidence follow-ups", value: m.evidenceFollowUps },
      { metric: "Milestone % complete", value: dashboard.milestonePercentComplete },
    ],
  };

  const topRisksSheet: ExportSheet = {
    name: "Top Risks",
    columns: ["externalId", "description", "category", "probability", "impact", "score", "status", "owner"],
    headers: {
      externalId: "Ref", description: "Risk", category: "Category", probability: "Probability",
      impact: "Impact", score: "Score", status: "Status", owner: "Owner",
    },
    rows: toExportRows(dashboard.topRisks),
  };

  const reportsWorkbook = buildReportsWorkbook(reports);

  return {
    title: "Old Mutual — Steering Pack",
    subtitle: `Generated ${new Date(data.generatedAt).toLocaleString("en-GB")}`,
    sheets: [summarySheet, topRisksSheet, ...reportsWorkbook.sheets],
  };
}

/** Plain-text executive summary excerpt for the pack header (no markdown). */
export function execSummaryText(reports: ReportsData): {
  day: string;
  version: string | null;
  body: string;
} | null {
  const latest = reports.execSummaries[0];
  if (!latest) return null;
  return {
    day: latest.day,
    version: latest.version,
    body: stripMarkdown(latest.bodyMarkdown),
  };
}
