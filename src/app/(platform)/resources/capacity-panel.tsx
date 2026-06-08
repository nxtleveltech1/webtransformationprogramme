"use client";

import * as React from "react";
import { CalendarRange, AlertTriangle, Lightbulb, Users2 } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  buildCapacityModel,
  BAND_LABEL,
  type CapacityAllocationInput,
  type CapacityModel,
  type UtilisationBand,
} from "@/lib/services/capacity";

/** Visual treatment per utilisation band. Text labels accompany colour everywhere. */
const BAND_STYLE: Record<UtilisationBand, { cell: string; dot: string; short: string }> = {
  EMPTY: {
    cell: "bg-muted/40 text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
    short: "None",
  },
  UNDER: {
    cell: "bg-rag-amber/10 text-rag-amber border-rag-amber/30",
    dot: "bg-rag-amber",
    short: "Under",
  },
  HEALTHY: {
    cell: "bg-rag-green/10 text-rag-green border-rag-green/30",
    dot: "bg-rag-green",
    short: "Healthy",
  },
  FULL: {
    cell: "bg-rag-green/25 text-rag-green border-rag-green/40",
    dot: "bg-rag-green",
    short: "Full",
  },
  OVER: {
    cell: "bg-rag-red/15 text-rag-red border-rag-red/40 font-semibold",
    dot: "bg-rag-red",
    short: "Over",
  },
};

const KIND_LABEL: Record<string, string> = {
  SHIFT: "Shift",
  REASSIGN: "Reassign",
  REDUCE: "Reduce",
};

export function CapacityPanel({
  allocations,
}: {
  allocations: CapacityAllocationInput[];
}) {
  const model: CapacityModel = React.useMemo(
    () => buildCapacityModel(allocations),
    [allocations],
  );

  const { stats } = model;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Resources on timeline"
          value={stats.resourceCount}
          icon={Users2}
          hint="With dated allocations"
        />
        <MetricCard
          label="Planning periods"
          value={stats.periodCount}
          icon={CalendarRange}
          hint="Months covered"
        />
        <MetricCard
          label="Over-allocations"
          value={stats.conflictCount}
          icon={AlertTriangle}
          tone={stats.conflictCount > 0 ? "danger" : "default"}
          hint=">100% in a period"
        />
        <MetricCard
          label="Leveling suggestions"
          value={model.suggestions.length}
          icon={Lightbulb}
          tone={model.suggestions.length > 0 ? "warning" : "default"}
          hint="Non-destructive"
        />
      </div>

      <HeatmapCard model={model} />
      <ConflictsCard model={model} />
      <SuggestionsCard model={model} />
    </div>
  );
}

function HeatmapCard({ model }: { model: CapacityModel }) {
  const { periods, rows, stats } = model;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="text-muted-foreground size-4" />
          Capacity heatmap
        </CardTitle>
        <CardDescription>
          Utilisation per person per month. Allocation % summed across overlapping
          assignments.
          {stats.undatedCount > 0 &&
            ` ${stats.undatedCount} allocation(s) excluded — no dates captured.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.isEmpty ? (
          <EmptyState
            icon={CalendarRange}
            title="No dated allocations to plot"
            description="Capacity over time appears here once allocations with start/end dates are recorded. None are captured yet."
          />
        ) : (
          <>
            <ScrollArea className="w-full">
              <div className="min-w-fit">
                <div
                  className="grid gap-1 text-center text-xs"
                  style={{
                    gridTemplateColumns: `minmax(140px,1.4fr) repeat(${periods.length}, minmax(56px,1fr))`,
                  }}
                >
                  {/* Header row */}
                  <div className="text-muted-foreground sticky left-0 z-10 bg-card pb-1 text-left font-medium">
                    Resource
                  </div>
                  {periods.map((p) => (
                    <div
                      key={p.key}
                      className="text-muted-foreground pb-1 font-medium whitespace-nowrap"
                    >
                      {p.label}
                    </div>
                  ))}

                  {/* Data rows */}
                  {rows.map((row) => (
                    <React.Fragment key={row.resourceId}>
                      <div className="sticky left-0 z-10 flex items-center bg-card pr-2 text-left font-medium">
                        <span className="truncate" title={row.resourceName}>
                          {row.resourceName}
                        </span>
                      </div>
                      {row.cells.map((cell) => {
                        const style = BAND_STYLE[cell.band];
                        return (
                          <div
                            key={cell.periodKey}
                            className={cn(
                              "flex aspect-square min-h-[44px] flex-col items-center justify-center rounded-md border tabular-nums",
                              style.cell,
                            )}
                            title={`${row.resourceName} — ${cell.periodKey}: ${cell.utilisationPct}% (${BAND_LABEL[cell.band]})`}
                          >
                            <span className="text-sm font-semibold">
                              {cell.utilisationPct > 0 ? `${cell.utilisationPct}%` : "—"}
                            </span>
                            <span className="text-[10px] opacity-80">{style.short}</span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <HeatmapLegend />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HeatmapLegend() {
  const order: UtilisationBand[] = ["EMPTY", "UNDER", "HEALTHY", "FULL", "OVER"];
  return (
    <div
      className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
      role="list"
      aria-label="Utilisation legend"
    >
      {order.map((band) => (
        <div key={band} className="flex items-center gap-1.5" role="listitem">
          <span
            className={cn("inline-block size-3 rounded-sm", BAND_STYLE[band].dot)}
            aria-hidden
          />
          <span>{BAND_LABEL[band]}</span>
        </div>
      ))}
    </div>
  );
}

function ConflictsCard({ model }: { model: CapacityModel }) {
  const { conflicts } = model;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="text-muted-foreground size-4" />
          Over-allocation conflicts
        </CardTitle>
        <CardDescription>
          Periods where a person is committed beyond 100%, with the contributing
          allocations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No over-allocation conflicts"
            description="No person exceeds 100% in any planning period. Conflicts surface here once overlapping allocations are recorded."
          />
        ) : (
          <ul className="space-y-3">
            {conflicts.map((c) => (
              <li
                key={`${c.resourceId}:${c.periodKey}`}
                className="border-rag-red/30 rounded-lg border px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.resourceName}</p>
                    <p className="text-muted-foreground text-xs">{c.periodLabel}</p>
                  </div>
                  <Badge className="bg-rag-red/10 text-rag-red border-rag-red/30 shrink-0">
                    {c.utilisationPct}% &middot; +{c.overByPct}% over
                  </Badge>
                </div>
                <ul className="mt-2 space-y-1">
                  {c.contributing.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {a.label}
                        {a.roleOnWork && (
                          <span className="text-muted-foreground"> &middot; {a.roleOnWork}</span>
                        )}
                      </span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {a.allocationPct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestionsCard({ model }: { model: CapacityModel }) {
  const { suggestions } = model;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="text-muted-foreground size-4" />
          Leveling suggestions
        </CardTitle>
        <CardDescription>
          Proposed, non-destructive ways to resolve each over-allocation. These are
          recommendations only — no data is changed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Nothing to level"
            description="Leveling suggestions appear here when over-allocations exist. The workload is currently within capacity (or no allocations are recorded)."
          />
        ) : (
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-lg border px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {KIND_LABEL[s.kind] ?? s.kind}
                    </Badge>
                    <span className="text-sm font-medium">{s.resourceName}</span>
                    <span className="text-muted-foreground text-xs">{s.periodLabel}</span>
                  </div>
                  <Badge className="bg-rag-amber/10 text-rag-amber border-rag-amber/30 shrink-0">
                    {s.utilisationPct}% &middot; +{s.overByPct}% over
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{s.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
