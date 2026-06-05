"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { ExportButton } from "@/components/shared/export-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { RagBar, type RagBarDatum } from "@/components/charts/rag-bar";
import { RiskHeatmap } from "@/components/charts/risk-heatmap";
import { IssueAgeing } from "@/components/charts/issue-ageing";
import { MilestoneProgress } from "@/components/charts/milestone-progress";
import { WorkloadBar } from "@/components/charts/workload-bar";
import { titleCase } from "@/lib/utils";
import { RAG_FILL } from "@/lib/services/dashboard";
import type {
  ReportsData,
  ProjectReportRow,
  WorkstreamReportRow,
  RiskReportRow,
  IssueReportRow,
  MilestoneReportRow,
  WorkloadReportRow,
} from "@/lib/services/reports";
import {
  FilterBar,
  applyFilters,
  EMPTY_FILTERS,
  type Filters,
  type FilterControl,
} from "./filter-bar";

type Rag = "RED" | "AMBER" | "GREEN" | null;

const RAG_ORDER = ["RED", "AMBER", "GREEN", "UNSET"] as const;

function ragDistribution<T>(rows: T[], get: (r: T) => string | null): RagBarDatum[] {
  const counts: Record<string, number> = { RED: 0, AMBER: 0, GREEN: 0, UNSET: 0 };
  for (const r of rows) {
    const key = get(r) ?? "UNSET";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return RAG_ORDER.filter((k) => counts[k] > 0).map((k) => ({
    name: k === "UNSET" ? "Not set" : titleCase(k),
    value: counts[k],
    fill: RAG_FILL[k],
  }));
}

function distinct(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort();
}

/** Flat report rows are CSV-safe; widen them for the shared ExportButton. */
function exportRows<T>(rows: T[]): Record<string, unknown>[] {
  return rows as unknown as Record<string, unknown>[];
}

function ReportShell({
  title,
  description,
  chart,
  children,
}: {
  title: string;
  description?: string;
  chart?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {chart}
      {children}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const TABS: { value: string; label: string; controls: FilterControl[] }[] = [
  { value: "executive", label: "Executive", controls: [] },
  { value: "projects", label: "Project RAG", controls: ["workstream", "status", "priority", "rag", "date"] },
  { value: "workstreams", label: "Workstream RAG", controls: ["rag"] },
  { value: "raid", label: "RAID", controls: ["status", "date"] },
  { value: "risks", label: "Risks", controls: ["workstream", "status", "date"] },
  { value: "issues", label: "Issues", controls: ["status", "date"] },
  { value: "milestones", label: "Milestones", controls: ["workstream", "status", "date"] },
  { value: "workload", label: "Resource workload", controls: [] },
];

export function ReportsClient({ data }: { data: ReportsData }) {
  const [tab, setTab] = React.useState("executive");
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);

  const activeControls = TABS.find((t) => t.value === tab)?.controls ?? [];

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v);
        setFilters(EMPTY_FILTERS);
      }}
      className="gap-4"
    >
      <div className="overflow-x-auto">
        <TabsList className="w-max">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {activeControls.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          controls={activeControls}
          workstreamOptions={data.workstreamOptions}
          statusOptions={statusOptionsForTab(tab, data)}
        />
      )}

      <TabsContent value="executive">
        <ExecutiveReport data={data} />
      </TabsContent>
      <TabsContent value="projects">
        <ProjectReport rows={data.projects} filters={filters} />
      </TabsContent>
      <TabsContent value="workstreams">
        <WorkstreamReport rows={data.workstreams} filters={filters} />
      </TabsContent>
      <TabsContent value="raid">
        <RaidReport data={data} filters={filters} />
      </TabsContent>
      <TabsContent value="risks">
        <RiskReport rows={data.risks} filters={filters} />
      </TabsContent>
      <TabsContent value="issues">
        <IssueReport rows={data.issues} filters={filters} />
      </TabsContent>
      <TabsContent value="milestones">
        <MilestoneReport rows={data.milestones} filters={filters} />
      </TabsContent>
      <TabsContent value="workload">
        <WorkloadReport rows={data.workload} />
      </TabsContent>
    </Tabs>
  );
}

function statusOptionsForTab(tab: string, data: ReportsData): string[] {
  switch (tab) {
    case "projects":
      return distinct(data.projects.map((r) => r.status));
    case "raid":
      return distinct([
        ...data.risks.map((r) => r.status),
        ...data.issues.map((r) => r.status),
        ...data.dependencies.map((r) => r.status),
        ...data.decisions.map((r) => r.status),
      ]);
    case "risks":
      return distinct(data.risks.map((r) => r.status));
    case "issues":
      return distinct(data.issues.map((r) => r.status));
    case "milestones":
      return distinct(data.milestones.map((r) => r.status));
    default:
      return [];
  }
}

/* ── Executive report ─────────────────────────────────────────────────────── */

function ExecutiveReport({ data }: { data: ReportsData }) {
  const latest = data.execSummaries[0] ?? null;
  const projectRag = ragDistribution(data.projects, (p) => p.rag);
  const workstreamRag = ragDistribution(data.workstreams, (w) => w.rag);

  return (
    <ReportShell
      title="Executive report"
      description="Programme narrative and portfolio health for steering committee."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Projects by RAG" description="Portfolio delivery confidence">
          <RagBar data={projectRag} emptyMessage="No projects" />
        </ChartCard>
        <ChartCard title="Workstreams by RAG" description="Workstream health">
          <RagBar data={workstreamRag} emptyMessage="No workstreams" />
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Steering pack control coverage</CardTitle>
          <CardDescription>
            Delivery controls now included in report/export modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Deliverables", data.controlSummary.deliverables],
            ["WBS tasks", data.controlSummary.wbsTasks],
            ["Critical path", data.controlSummary.criticalPathTasks],
            ["Readiness score", `${data.controlSummary.readinessScore}%`],
            ["Readiness gates", data.controlSummary.readinessGates],
            ["Governance events", data.controlSummary.governanceMeetings],
            ["Evidence links", data.controlSummary.evidenceLinks],
            ["Evidence follow-up", data.controlSummary.evidenceFollowUps],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-card/80 p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                {label}
              </p>
              <p className="mt-2 text-2xl font-black tabular-nums">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Executive summary
            {latest ? ` — ${titleCase(latest.day)}` : ""}
          </CardTitle>
          {latest?.version && (
            <CardDescription>Version {latest.version}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="prose-sm max-w-none space-y-2 text-sm leading-relaxed whitespace-pre-wrap">
              {latest.bodyMarkdown}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No executive summary has been published yet.
            </p>
          )}
        </CardContent>
      </Card>
    </ReportShell>
  );
}

/* ── Project RAG report ───────────────────────────────────────────────────── */

function ProjectReport({
  rows,
  filters,
}: {
  rows: ProjectReportRow[];
  filters: Filters;
}) {
  const filtered = applyFilters(rows, filters, {
    search: (r) => `${r.code} ${r.name} ${r.owner}`,
    workstream: (r) => r.workstream,
    status: (r) => r.status,
    priority: (r) => r.priority,
    rag: (r) => r.rag,
    date: (r) => r.createdAt,
  });

  const columns: ColumnDef<ProjectReportRow>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Project" },
    { accessorKey: "workstream", header: "Workstream" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <PriorityBadge priority={row.original.priority} /> },
    { accessorKey: "rag", header: "RAG", cell: ({ row }) => <RagIndicator value={row.original.rag as Rag} showLabel={false} /> },
    { accessorKey: "owner", header: "Owner" },
  ];

  return (
    <ReportShell
      title="Project RAG report"
      description="Delivery status and confidence across the project portfolio."
      chart={
        <ChartCard title="Projects by RAG" description="Filtered portfolio">
          <RagBar
            data={ragDistribution(filtered, (p) => p.rag)}
            emptyMessage="No matching projects"
            className="aspect-[16/6] w-full"
          />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search projects…"
        emptyTitle="No projects match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="project-rag-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── Workstream RAG report ────────────────────────────────────────────────── */

function WorkstreamReport({
  rows,
  filters,
}: {
  rows: WorkstreamReportRow[];
  filters: Filters;
}) {
  const filtered = applyFilters(rows, filters, {
    search: (r) => `${r.code} ${r.name} ${r.lead}`,
    rag: (r) => r.rag,
  });

  const columns: ColumnDef<WorkstreamReportRow>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Workstream" },
    { accessorKey: "lead", header: "Lead" },
    { accessorKey: "rag", header: "RAG", cell: ({ row }) => <RagIndicator value={row.original.rag as Rag} showLabel={false} /> },
    { accessorKey: "projects", header: "Projects" },
    { accessorKey: "risks", header: "Risks" },
    { accessorKey: "status", header: "One-line status" },
  ];

  return (
    <ReportShell
      title="Workstream RAG report"
      description="Health and delivery confidence by workstream."
      chart={
        <ChartCard title="Workstreams by RAG">
          <RagBar
            data={ragDistribution(filtered, (w) => w.rag)}
            emptyMessage="No matching workstreams"
            className="aspect-[16/6] w-full"
          />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search workstreams…"
        emptyTitle="No workstreams match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="workstream-rag-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── RAID report ──────────────────────────────────────────────────────────── */

interface RaidRow {
  id: string;
  type: string;
  ref: string;
  summary: string;
  status: string;
  owner: string;
  createdAt: string;
}

function RaidReport({ data, filters }: { data: ReportsData; filters: Filters }) {
  const combined: RaidRow[] = React.useMemo(() => {
    const risks = data.risks.map((r) => ({
      id: r.id, type: "Risk", ref: r.externalId, summary: r.description,
      status: r.status, owner: r.owner, createdAt: r.createdAt,
    }));
    const assumptions = data.assumptions.map((a) => ({
      id: a.id, type: "Assumption", ref: a.externalId, summary: a.description,
      status: "—", owner: a.validator, createdAt: a.createdAt,
    }));
    const issues = data.issues.map((i) => ({
      id: i.id, type: "Issue", ref: i.externalId, summary: i.description,
      status: i.status, owner: i.owner, createdAt: i.createdAt,
    }));
    const deps = data.dependencies.map((d) => ({
      id: d.id, type: "Dependency", ref: d.externalId, summary: d.description,
      status: d.status, owner: d.receivingTeam, createdAt: d.createdAt,
    }));
    const decisions = data.decisions.map((d) => ({
      id: d.id, type: "Decision", ref: d.externalId, summary: d.title,
      status: d.status, owner: d.owner, createdAt: d.createdAt,
    }));
    return [...risks, ...assumptions, ...issues, ...deps, ...decisions];
  }, [data]);

  const filtered = applyFilters(combined, filters, {
    search: (r) => `${r.type} ${r.ref} ${r.summary} ${r.owner}`,
    status: (r) => r.status,
    date: (r) => r.createdAt,
  });

  const typeCounts: RagBarDatum[] = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered) counts[r.type] = (counts[r.type] ?? 0) + 1;
    const palette: Record<string, string> = {
      Risk: "var(--rag-red)",
      Issue: "var(--rag-amber)",
      Dependency: "var(--chart-1)",
      Decision: "var(--chart-2)",
      Assumption: "var(--chart-3)",
    };
    return Object.entries(counts).map(([name, value]) => ({
      name, value, fill: palette[name] ?? "var(--chart-1)",
    }));
  }, [filtered]);

  const columns: ColumnDef<RaidRow>[] = [
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { accessorKey: "ref", header: "Ref", cell: ({ row }) => <span className="font-mono text-xs">{row.original.ref}</span> },
    { accessorKey: "summary", header: "Summary", cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.summary}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "owner", header: "Owner" },
  ];

  return (
    <ReportShell
      title="RAID report"
      description="Consolidated risks, assumptions, issues, dependencies and decisions."
      chart={
        <ChartCard title="RAID by type">
          <RagBar data={typeCounts} emptyMessage="No RAID items" className="aspect-[16/6] w-full" />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search RAID items…"
        emptyTitle="No RAID items match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="raid-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── Risk report ──────────────────────────────────────────────────────────── */

function RiskReport({ rows, filters }: { rows: RiskReportRow[]; filters: Filters }) {
  const filtered = applyFilters(rows, filters, {
    search: (r) => `${r.externalId} ${r.description} ${r.owner} ${r.category}`,
    workstream: (r) => r.workstream,
    status: (r) => r.status,
    date: (r) => r.createdAt,
  });

  const categoryData: RagBarDatum[] = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered) counts[r.category] = (counts[r.category] ?? 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name: titleCase(name), value }));
  }, [filtered]);

  const columns: ColumnDef<RiskReportRow>[] = [
    { accessorKey: "externalId", header: "Ref", cell: ({ row }) => <span className="font-mono text-xs">{row.original.externalId}</span> },
    { accessorKey: "description", header: "Risk", cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.description}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => titleCase(row.original.category) },
    { accessorKey: "probability", header: "Prob.", cell: ({ row }) => titleCase(row.original.probability) },
    { accessorKey: "impact", header: "Impact", cell: ({ row }) => titleCase(row.original.impact) },
    { accessorKey: "score", header: "Score", cell: ({ row }) => <span className="tabular-nums">{row.original.score}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "owner", header: "Owner" },
  ];

  return (
    <ReportShell
      title="Risk report"
      description="Risk exposure by probability, impact and category."
      chart={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Risk heatmap" description="Probability × impact">
            <RiskHeatmap risks={filtered} />
          </ChartCard>
          <ChartCard title="Risks by category">
            <RagBar data={categoryData} emptyMessage="No matching risks" />
          </ChartCard>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search risks…"
        emptyTitle="No risks match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="risk-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── Issue report ─────────────────────────────────────────────────────────── */

function IssueReport({ rows, filters }: { rows: IssueReportRow[]; filters: Filters }) {
  const filtered = applyFilters(rows, filters, {
    search: (r) => `${r.externalId} ${r.description} ${r.owner}`,
    status: (r) => r.status,
    date: (r) => r.createdAt,
  });

  const ageing = React.useMemo(() => {
    const buckets = [
      { bucket: "≤7d", count: 0 },
      { bucket: "8–30d", count: 0 },
      { bucket: "31–90d", count: 0 },
      { bucket: ">90d", count: 0 },
    ];
    for (const i of filtered) {
      const d = i.ageDays ?? 999;
      if (d <= 7) buckets[0].count += 1;
      else if (d <= 30) buckets[1].count += 1;
      else if (d <= 90) buckets[2].count += 1;
      else buckets[3].count += 1;
    }
    return buckets;
  }, [filtered]);

  const columns: ColumnDef<IssueReportRow>[] = [
    { accessorKey: "externalId", header: "Ref", cell: ({ row }) => <span className="font-mono text-xs">{row.original.externalId}</span> },
    { accessorKey: "description", header: "Issue", cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.description}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "impact", header: "Impact", cell: ({ row }) => <span className="line-clamp-2 max-w-xs">{row.original.impact}</span> },
    { accessorKey: "owner", header: "Owner" },
    { accessorKey: "ageDays", header: "Age (days)", cell: ({ row }) => <span className="tabular-nums">{row.original.ageDays ?? "—"}</span> },
  ];

  return (
    <ReportShell
      title="Issue report"
      description="Open issues and how long they have been outstanding."
      chart={
        <ChartCard title="Issue ageing" description="Time since raised">
          <IssueAgeing data={ageing} className="aspect-[16/6] w-full" />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search issues…"
        emptyTitle="No issues match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="issue-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── Milestone report ─────────────────────────────────────────────────────── */

const MILESTONE_DONE = /complete|done|met|achieved|delivered/i;

function MilestoneReport({
  rows,
  filters,
}: {
  rows: MilestoneReportRow[];
  filters: Filters;
}) {
  const filtered = applyFilters(rows, filters, {
    search: (r) => `${r.title} ${r.workstream} ${r.project}`,
    workstream: (r) => r.workstream,
    status: (r) => r.status,
    date: (r) => r.createdAt,
  });

  const { statusData, percent } = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let done = 0;
    for (const m of filtered) {
      counts[m.status] = (counts[m.status] ?? 0) + 1;
      if (MILESTONE_DONE.test(m.status)) done += 1;
    }
    const statusData = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: MILESTONE_DONE.test(name) ? "var(--rag-green)" : "var(--chart-1)",
    }));
    const percent = filtered.length
      ? Math.round((done / filtered.length) * 100)
      : 0;
    return { statusData, percent };
  }, [filtered]);

  const columns: ColumnDef<MilestoneReportRow>[] = [
    { accessorKey: "title", header: "Milestone" },
    { accessorKey: "targetDate", header: "Target" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      accessorKey: "varianceDays",
      header: "Variance (days)",
      cell: ({ row }) => {
        const v = row.original.varianceDays;
        if (v === null) return <span className="text-muted-foreground">—</span>;
        return (
          <span className={v > 0 ? "text-rag-red tabular-nums" : "text-rag-green tabular-nums"}>
            {v > 0 ? `+${v}` : v}
          </span>
        );
      },
    },
    { accessorKey: "workstream", header: "Workstream" },
    { accessorKey: "project", header: "Project" },
  ];

  return (
    <ReportShell
      title="Milestone report"
      description="Delivery against planned milestones and schedule variance."
      chart={
        <ChartCard title="Milestone progress">
          <MilestoneProgress data={statusData} percentComplete={percent} />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search milestones…"
        emptyTitle="No milestones match"
        toolbar={<ExportButton rows={exportRows(filtered)} filename="milestone-report" entity="report" />}
      />
    </ReportShell>
  );
}

/* ── Resource workload report ─────────────────────────────────────────────── */

function WorkloadReport({ rows }: { rows: WorkloadReportRow[] }) {
  const chartData = React.useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.allocationPct - a.allocationPct)
        .slice(0, 12)
        .map((r) => ({ name: r.name, value: r.allocationPct })),
    [rows],
  );

  const columns: ColumnDef<WorkloadReportRow>[] = [
    { accessorKey: "name", header: "Resource" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "team", header: "Team" },
    {
      accessorKey: "allocationPct",
      header: "Allocation %",
      cell: ({ row }) => {
        const v = row.original.allocationPct;
        const tone = v > 100 ? "text-rag-red" : v >= 85 ? "text-rag-amber" : "text-rag-green";
        return <span className={`${tone} font-medium tabular-nums`}>{v}%</span>;
      },
    },
    { accessorKey: "allocations", header: "Assignments" },
    {
      accessorKey: "capacityHours",
      header: "Capacity (h)",
      cell: ({ row }) => row.original.capacityHours ?? "—",
    },
  ];

  return (
    <ReportShell
      title="Resource workload report"
      description="Allocation across resources, highlighting over-utilisation."
      chart={
        <ChartCard title="Top allocations" description="Total allocation % per resource">
          <WorkloadBar data={chartData} className="aspect-[16/8] w-full" />
        </ChartCard>
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search resources…"
        emptyTitle="No resources found"
        toolbar={<ExportButton rows={exportRows(rows)} filename="resource-workload-report" entity="report" />}
      />
    </ReportShell>
  );
}
