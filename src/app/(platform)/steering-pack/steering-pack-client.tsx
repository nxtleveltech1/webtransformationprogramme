"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { useRole } from "@/lib/rbac/role-context";
import { titleCase } from "@/lib/utils";
import type { SteeringPackData } from "@/lib/export/steering-pack";

type Rag = "RED" | "AMBER" | "GREEN" | null;

const MILESTONE_DONE = /complete|done|met|achieved|delivered/i;

export function SteeringPackClient({ data }: { data: SteeringPackData }) {
  const { can } = useRole();
  const canExport = can("export", "report");

  const { dashboard, reports } = data;
  const m = dashboard.metrics;
  const generated = new Date(data.generatedAt).toLocaleString("en-GB");
  const exec = reports.execSummaries[0] ?? null;

  const raidCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      Risk: reports.risks.length,
      Issue: reports.issues.length,
      Dependency: reports.dependencies.length,
      Decision: reports.decisions.length,
      Assumption: reports.assumptions.length,
    };
    return Object.entries(counts).filter(([, v]) => v > 0);
  }, [reports]);

  const milestonePreview = reports.milestones.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Export actions — hidden when printing this page directly */}
      {canExport && (
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button asChild>
            <a href="/steering-pack/print?print=1" target="_blank" rel="noopener noreferrer">
              <FileDown className="size-4" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/steering-pack/excel?scope=steering">
              <FileSpreadsheet className="size-4" />
              Download Excel
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/steering-pack/print" target="_blank" rel="noopener noreferrer">
              <Printer className="size-4" />
              Open print view
            </a>
          </Button>
        </div>
      )}

      {/* Branded pack header */}
      <div
        className="rounded-xl px-6 py-5 text-white print:rounded-none"
        style={{ background: "linear-gradient(135deg, #009677, #8DC63F)" }}
      >
        <p className="text-xs font-semibold tracking-wider uppercase opacity-90">
          Old Mutual · Programme Control
        </p>
        <h2 className="mt-1 text-2xl font-bold">Steering Committee Pack</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-95">
          <span>{dashboard.programme?.name ?? "Programme"}</span>
          {dashboard.programme?.rag && (
            <Badge className="border-white/30 bg-white/15 text-white">
              {dashboard.programme.rag} RAG
            </Badge>
          )}
          <span>· Generated {generated}</span>
        </p>
      </div>

      {/* Executive summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Executive summary{exec ? ` — ${titleCase(exec.day)}` : ""}
          </CardTitle>
          {exec?.version && <CardDescription>Version {exec.version}</CardDescription>}
        </CardHeader>
        <CardContent>
          {exec ? (
            <div className="prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {exec.bodyMarkdown}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No executive summary has been published yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Programme RAG / health metrics */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-heritage">
          Programme health
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Active projects" value={m.activeProjects} />
          <MetricCard label="Workstreams" value={m.workstreams} />
          <MetricCard label="Open risks" value={m.openRisks} tone="danger" />
          <MetricCard label="Open issues" value={m.openIssues} tone="warning" />
          <MetricCard label="Pending approvals" value={m.pendingApprovals} />
          <MetricCard label="Upcoming milestones" value={m.upcomingMilestones} />
          <MetricCard label="Blocked dependencies" value={m.blockedDependencies} tone="danger" />
          <MetricCard label="Readiness" value={`${m.readinessScore}%`} tone="success" />
          <MetricCard label="Deliverables" value={reports.controlSummary.deliverables} />
          <MetricCard label="Critical path" value={reports.controlSummary.criticalPathTasks} />
          <MetricCard label="Governance events" value={reports.controlSummary.governanceMeetings} />
          <MetricCard
            label="Milestones complete"
            value={`${dashboard.milestonePercentComplete}%`}
            tone="success"
          />
        </div>
      </section>

      {/* Top risks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top risks</CardTitle>
          <CardDescription>Highest-scoring open risks by probability × impact.</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.topRisks.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Ref</th>
                    <th className="py-2 pr-3 font-semibold">Risk</th>
                    <th className="py-2 pr-3 font-semibold">Category</th>
                    <th className="py-2 pr-3 font-semibold">Score</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topRisks.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs">{r.externalId}</td>
                      <td className="py-2 pr-3">
                        <span className="line-clamp-2 max-w-md">{r.description}</span>
                      </td>
                      <td className="py-2 pr-3">{titleCase(r.category)}</td>
                      <td className="py-2 pr-3 tabular-nums">{r.score}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-2">{r.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No open risks" description="No risks are currently open." />
          )}
        </CardContent>
      </Card>

      {/* RAID summary + readiness */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">RAID summary</CardTitle>
            <CardDescription>Consolidated governance register counts.</CardDescription>
          </CardHeader>
          <CardContent>
            {raidCounts.length ? (
              <div className="flex flex-wrap gap-2">
                {raidCounts.map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-sm">
                    {type}: <span className="ml-1 font-bold text-brand-heritage">{count}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No RAID items.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Readiness</CardTitle>
            <CardDescription>Go / no-go gate posture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Readiness score</span>
              <span className="font-bold tabular-nums">{m.readinessScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Readiness gates</span>
              <span className="font-bold tabular-nums">{reports.controlSummary.readinessGates}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blocked gates</span>
              <span className="font-bold tabular-nums">{m.blockedReadinessGates}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Evidence follow-ups</span>
              <span className="font-bold tabular-nums">{m.evidenceFollowUps}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestone delivery</CardTitle>
          <CardDescription>
            Delivery against planned milestones ({dashboard.milestonePercentComplete}% complete).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestonePreview.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Milestone</th>
                    <th className="py-2 pr-3 font-semibold">Target</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 pr-3 font-semibold">Variance</th>
                    <th className="py-2 font-semibold">Workstream</th>
                  </tr>
                </thead>
                <tbody>
                  {milestonePreview.map((ms) => (
                    <tr key={ms.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{ms.title}</td>
                      <td className="py-2 pr-3">{ms.targetDate}</td>
                      <td className="py-2 pr-3">
                        {MILESTONE_DONE.test(ms.status) ? (
                          <RagIndicator value={"GREEN" as Rag} showLabel={false} />
                        ) : (
                          <StatusBadge status={ms.status} />
                        )}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {ms.varianceDays === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className={ms.varianceDays > 0 ? "text-rag-red" : "text-rag-green"}>
                            {ms.varianceDays > 0 ? `+${ms.varianceDays}` : ms.varianceDays}
                          </span>
                        )}
                      </td>
                      <td className="py-2">{ms.workstream}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.milestones.length > milestonePreview.length && (
                <p className="mt-2 text-xs text-muted-foreground">
                  + {reports.milestones.length - milestonePreview.length} more — see the full Excel
                  export.
                </p>
              )}
            </div>
          ) : (
            <EmptyState title="No milestones" description="No milestones have been planned." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
