"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  CircleDot,
  Flag,
  GaugeCircle,
  Minus,
  Repeat,
} from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportButton } from "@/components/shared/export-button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CpmResult, CpmTaskResult } from "@/lib/services/cpm";

const DURATION_SOURCE_LABEL: Record<CpmTaskResult["durationSource"], string> = {
  baseline: "Baseline dates",
  forecast: "Forecast dates",
  durationDays: "Stored duration",
  none: "No usable dates",
};

/**
 * Computed-criticality badge. Status is conveyed with an icon + text, never by
 * colour alone, to satisfy the accessibility rule.
 */
function CriticalityBadge({ task }: { task: CpmTaskResult }) {
  if (task.inCycle) {
    return (
      <Badge className="border-rag-amber/30 bg-rag-amber/10 text-rag-amber">
        <Repeat className="mr-1 size-3" />
        In cycle
      </Badge>
    );
  }
  if (task.isCritical) {
    return (
      <Badge className="border-rag-red/30 bg-rag-red/10 text-rag-red">
        <AlertTriangle className="mr-1 size-3" />
        Critical
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleDot className="mr-1 size-3" />
      Has slack
    </Badge>
  );
}

/** Float / slack cell with a defensive note for undated tasks. */
function FloatCell({ task }: { task: CpmTaskResult }) {
  if (!task.hasDuration) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Minus className="size-3" />
            n/a
          </span>
        </TooltipTrigger>
        <TooltipContent>
          No parseable baseline or forecast dates — scheduled as
          least-constrained (0-day duration), so float is not meaningful.
        </TooltipContent>
      </Tooltip>
    );
  }
  const float = task.totalFloat;
  return (
    <span
      className={cn(
        "tabular-nums text-sm font-medium",
        float <= 0 ? "text-rag-red" : float <= 3 ? "text-rag-amber" : "text-foreground",
      )}
    >
      {float}d
    </span>
  );
}

export function CpmClient({ result }: { result: CpmResult }) {
  const { tasks, criticalChain, cycles, summary, projectDurationDays } = result;

  const columns = React.useMemo<ColumnDef<CpmTaskResult>[]>(
    () => [
      {
        accessorKey: "externalId",
        header: "WBS",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums text-xs">
            {row.original.externalId ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Task",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.title}</span>
            {row.original.workstreamName && (
              <span className="text-muted-foreground text-xs">
                {row.original.workstreamName}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "computed",
        header: "Computed",
        accessorFn: (r) => (r.inCycle ? 2 : r.isCritical ? 1 : 0),
        cell: ({ row }) => <CriticalityBadge task={row.original} />,
      },
      {
        id: "flagged",
        header: "Flagged",
        accessorFn: (r) => (r.flaggedCritical ? 1 : 0),
        cell: ({ row }) =>
          row.original.flaggedCritical ? (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Flag className="size-3" />
              Flagged
            </span>
          ) : (
            <span className="text-muted-foreground/60 text-xs">—</span>
          ),
      },
      {
        id: "float",
        header: "Float / slack",
        accessorFn: (r) => (r.hasDuration ? r.totalFloat : Number.MAX_SAFE_INTEGER),
        cell: ({ row }) => <FloatCell task={row.original} />,
      },
      {
        accessorKey: "durationDays",
        header: "Duration",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="tabular-nums text-sm">
                {row.original.hasDuration ? `${row.original.durationDays}d` : "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {DURATION_SOURCE_LABEL[row.original.durationSource]}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "esef",
        header: "ES / EF",
        accessorFn: (r) => r.earlyStart,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums text-xs">
            {row.original.earlyStart} / {row.original.earlyFinish}
          </span>
        ),
      },
      {
        id: "lslf",
        header: "LS / LF",
        accessorFn: (r) => r.lateStart,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums text-xs">
            {row.original.lateStart} / {row.original.lateFinish}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? (
            <StatusBadge status={row.original.status} />
          ) : (
            <span className="text-muted-foreground/60 text-xs">—</span>
          ),
      },
    ],
    [],
  );

  const exportRows = tasks.map((t) => ({
    wbs: t.externalId ?? "",
    task: t.title,
    workstream: t.workstreamName ?? "",
    computedCritical: t.isCritical ? "yes" : "no",
    flaggedCritical: t.flaggedCritical ? "yes" : "no",
    float: t.hasDuration ? t.totalFloat : "",
    durationDays: t.hasDuration ? t.durationDays : "",
    durationSource: t.durationSource,
    earlyStart: t.earlyStart,
    earlyFinish: t.earlyFinish,
    lateStart: t.lateStart,
    lateFinish: t.lateFinish,
    inCycle: t.inCycle ? "yes" : "no",
    status: t.status ?? "",
  }));

  return (
    <div className="space-y-6">
      {cycles.length > 0 && (
        <div className="border-rag-amber/40 bg-rag-amber/10 flex flex-col gap-1 rounded-md border p-3 text-sm">
          <span className="text-rag-amber inline-flex items-center gap-2 font-semibold">
            <Repeat className="size-4" />
            {cycles.length} dependency cycle{cycles.length === 1 ? "" : "s"} detected
          </span>
          <span className="text-muted-foreground text-xs">
            Cyclic dependencies cannot be scheduled and are excluded from float
            calculation. Resolve these to restore a valid critical path:
          </span>
          <ul className="text-muted-foreground mt-1 list-disc space-y-0.5 pl-5 text-xs">
            {cycles.map((c, i) => (
              <li key={i}>{c.labels.join(" → ")}</li>
            ))}
          </ul>
        </div>
      )}

      {criticalChain.length > 0 && (
        <div className="rounded-md border p-4">
          <div className="mb-3 flex items-center gap-2">
            <GaugeCircle className="text-rag-red size-4" />
            <h3 className="text-sm font-semibold">
              Computed critical chain ({criticalChain.length} task
              {criticalChain.length === 1 ? "" : "s"}, project duration{" "}
              {projectDurationDays}d)
            </h3>
          </div>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
            {criticalChain.map((t, i) => (
              <li key={t.id} className="flex items-center gap-1">
                <span className="border-rag-red/30 bg-rag-red/10 text-rag-red inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium">
                  {t.externalId ? `${t.externalId} ` : ""}
                  {t.title}
                </span>
                {i < criticalChain.length - 1 && (
                  <span className="text-muted-foreground" aria-hidden>
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tasks}
        searchPlaceholder="Search tasks..."
        emptyTitle="No tasks to analyse"
        emptyDescription="There are no WBS tasks with dependencies to run a critical-path calculation."
        toolbar={
          <ExportButton
            rows={exportRows}
            filename="critical-path-cpm"
            entity="milestone"
          />
        }
      />

      {summary.flagMismatch > 0 && (
        <p className="text-muted-foreground text-xs">
          Note: {summary.flagMismatch} task
          {summary.flagMismatch === 1 ? "" : "s"} differ between the computed
          critical path and the stored <code>criticalPath</code> flag — compare
          the Computed and Flagged columns.
        </p>
      )}
    </div>
  );
}
