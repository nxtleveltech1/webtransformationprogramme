import {
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  CalendarDays,
  CornerDownRight,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportButton } from "@/components/shared/export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCriticalPath, isSlipping } from "@/lib/services/critical-path";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CriticalPathPage() {
  let data: Awaited<ReturnType<typeof getCriticalPath>>;

  try {
    data = await getCriticalPath();
  } catch {
    return (
      <ErrorState description="The critical path could not be loaded. Please try again." />
    );
  }

  const { steps, summary } = data;

  if (steps.length === 0) {
    return (
      <ViewGuard entity="milestone" entityLabel="the critical path">
        <div className="space-y-6">
          <PageHeader
            title="Critical Path"
            description="The ordered chain of critical-path steps gating programme delivery."
          />
          <EmptyState
            title="No critical path defined"
            description="Critical-path steps have not been seeded yet."
          />
        </div>
      </ViewGuard>
    );
  }

  const exportRows = steps.map((s) => ({
    step: s.stepNumber,
    activity: s.activity,
    owner: s.ownerText ?? "",
    predecessor: s.predecessor ?? "",
    dueDate: s.dueDate ?? "",
    status: s.status ?? "",
    critical: s.isCritical ? "yes" : "no",
    slipping: isSlipping(s.status) ? "yes" : "no",
  }));

  return (
    <ViewGuard entity="milestone" entityLabel="the critical path">
      <div className="space-y-6">
        <PageHeader
          title="Critical Path"
          description="The ordered chain of critical-path steps gating programme delivery."
          actions={
            <ExportButton
              rows={exportRows}
              filename="critical-path"
              entity="milestone"
            />
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total steps"
            value={summary.total}
            icon={GitBranch}
            tone="default"
            hint="Steps in the critical-path chain"
          />
          <MetricCard
            label="Critical steps"
            value={summary.critical}
            icon={AlertTriangle}
            tone="danger"
            hint="Flagged as gating delivery"
          />
          <MetricCard
            label="Completed"
            value={summary.completed}
            icon={CheckCircle2}
            tone="success"
            hint="Delivered or achieved"
          />
          <MetricCard
            label="Slipping"
            value={summary.slipping}
            icon={Clock}
            tone="warning"
            hint="At risk, delayed or blocked"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="size-4" />
              Critical-path sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="border-border/60 relative space-y-6 border-l pl-8">
              {steps.map((step) => {
                const slipping = isSlipping(step.status);
                return (
                  <li key={step.id} className="relative">
                    <span
                      className={
                        "absolute top-0.5 -left-[41px] flex size-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums " +
                        (slipping
                          ? "bg-rag-red/10 border-rag-red/40 text-rag-red"
                          : step.isCritical
                            ? "bg-rag-amber/10 border-rag-amber/40 text-rag-amber"
                            : "bg-background border-border text-muted-foreground")
                      }
                      aria-hidden
                    >
                      {step.stepNumber}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{step.activity}</p>
                          {step.isCritical && (
                            <Badge className="bg-rag-red/10 text-rag-red border-rag-red/30">
                              Critical
                            </Badge>
                          )}
                          {slipping && (
                            <span className="text-rag-red inline-flex items-center gap-1 text-xs font-medium">
                              <AlertTriangle className="size-3" />
                              Slipping
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          {step.ownerText && (
                            <span className="inline-flex items-center gap-1">
                              <User className="size-3" />
                              {step.ownerText}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {formatDate(step.dueDate)}
                          </span>
                          {step.predecessor && (
                            <span className="inline-flex items-center gap-1">
                              <CornerDownRight className="size-3" />
                              after: {step.predecessor}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={step.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </ViewGuard>
  );
}
