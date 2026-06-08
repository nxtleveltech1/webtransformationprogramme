"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Flag, GitBranch, CalendarRange, AlertTriangle, X, List, GanttChartSquare, Workflow, GitCompareArrows } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { ExportButton } from "@/components/shared/export-button";
import { formatDate, parseDateMs } from "@/lib/utils";
import { RoadmapGantt } from "./roadmap-gantt";
import { ItemEditDialog } from "./edit-dialogs";
import type { ScheduleEditData, ScheduleEditOptions } from "./types";

export interface TimelineItem {
  id: string;
  kind: "wbs" | "activity" | "critical" | "milestone";
  /** Short reference shown in its own column (e.g. WBS-014); null for items without one. */
  code: string | null;
  title: string;
  workstream: string | null;
  owner: string | null;
  start: string | null;
  end: string | null;
  /** Baseline plan dates, when a baseline exists (WBS tasks, milestones). */
  baselineStart: string | null;
  baselineEnd: string | null;
  status: string | null;
  dependency: string | null;
  varianceDays: number | null;
  isCritical: boolean;
}

const KIND_META: Record<
  TimelineItem["kind"],
  { label: string; icon: typeof Flag; className: string }
> = {
  wbs: { label: "WBS task", icon: Workflow, className: "bg-primary/10 text-primary border-primary/30" },
  milestone: { label: "Milestone", icon: Flag, className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  activity: { label: "Roadmap", icon: CalendarRange, className: "bg-secondary text-secondary-foreground border-transparent" },
  critical: { label: "Critical path", icon: GitBranch, className: "bg-rag-amber/10 text-rag-amber border-rag-amber/30" },
};

function primaryTime(item: TimelineItem): number | null {
  return parseDateMs(item.end) ?? parseDateMs(item.start);
}

const KIND_ORDER: TimelineItem["kind"][] = ["wbs", "activity", "critical", "milestone"];

function isSlipping(item: TimelineItem): boolean {
  if (item.varianceDays != null && item.varianceDays > 0) return true;
  const s = (item.status ?? "").toLowerCase();
  return /(slip|delay|late|at[\s-]?risk|behind|blocked|red|overdue)/.test(s);
}

export function TimelineClient({
  items,
  editData,
  editOptions,
}: {
  items: TimelineItem[];
  editData: ScheduleEditData;
  editOptions: ScheduleEditOptions;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<{
    id: string;
    kind: TimelineItem["kind"];
  } | null>(null);
  const availableKinds = React.useMemo(
    () => KIND_ORDER.filter((k) => items.some((i) => i.kind === k)),
    [items],
  );
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [kinds, setKinds] = React.useState<Set<TimelineItem["kind"]>>(
    () => new Set(availableKinds),
  );
  const [slipOnly, setSlipOnly] = React.useState(false);
  const [view, setView] = React.useState<"list" | "gantt">("list");
  const [showBaseline, setShowBaseline] = React.useState(true);

  const hasBaselineData = React.useMemo(
    () =>
      items.some(
        (i) =>
          (i.baselineEnd && i.baselineEnd !== i.end) ||
          (i.baselineStart && i.baselineStart !== i.start) ||
          (i.kind === "milestone" && i.varianceDays != null && i.varianceDays !== 0),
      ),
    [items],
  );

  const fromTime = from ? Date.parse(from) : null;
  const toTime = to ? Date.parse(to) : null;

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      if (!kinds.has(item.kind)) return false;
      if (slipOnly && !isSlipping(item)) return false;
      const t = primaryTime(item);
      // Items without a parseable date are always shown (range cannot apply).
      if (t !== null) {
        if (fromTime !== null && t < fromTime) return false;
        if (toTime !== null && t > toTime) return false;
      }
      return true;
    });
  }, [items, kinds, slipOnly, fromTime, toTime]);

  const groups = React.useMemo(() => groupByWorkstream(filtered), [filtered]);

  const slipCount = filtered.filter(isSlipping).length;

  const exportRows = filtered.map((i) => ({
    kind: KIND_META[i.kind].label,
    title: i.title,
    workstream: i.workstream ?? "",
    owner: i.owner ?? "",
    start: i.start ?? "",
    end: i.end ?? "",
    status: i.status ?? "",
    slipping: isSlipping(i) ? "yes" : "no",
  }));

  function toggleKind(kind: TimelineItem["kind"]) {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const hasFilters = from || to || slipOnly || kinds.size < availableKinds.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tl-from">From</Label>
              <Input id="tl-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tl-to">To</Label>
              <Input id="tl-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Show</span>
              <div className="flex flex-wrap gap-1.5">
                {availableKinds.map((k) => {
                  const active = kinds.has(k);
                  const Icon = KIND_META[k].icon;
                  return (
                    <Button
                      key={k}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleKind(k)}
                      aria-pressed={active}
                    >
                      <Icon className="size-4" />
                      {KIND_META[k].label}
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant={slipOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlipOnly((s) => !s)}
                  aria-pressed={slipOnly}
                >
                  <AlertTriangle className="size-4" />
                  Slipping only
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-muted/60 flex items-center rounded-md p-0.5">
              <Button
                type="button"
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
              >
                <List className="size-4" />
                List
              </Button>
              <Button
                type="button"
                variant={view === "gantt" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("gantt")}
                aria-pressed={view === "gantt"}
              >
                <GanttChartSquare className="size-4" />
                Gantt
              </Button>
            </div>
            {view === "gantt" && hasBaselineData && (
              <Button
                type="button"
                variant={showBaseline ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBaseline((s) => !s)}
                aria-pressed={showBaseline}
                title="Overlay the original baseline plan behind the current forecast"
              >
                <GitCompareArrows className="size-4" />
                Baseline overlay
              </Button>
            )}
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setSlipOnly(false);
                  setKinds(new Set(availableKinds));
                }}
              >
                <X className="size-4" />
                Reset
              </Button>
            )}
            <ExportButton rows={exportRows} filename="timeline" entity="milestone" />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
        <span>{filtered.length} item(s)</span>
        {slipCount > 0 && (
          <span className="text-rag-red flex items-center gap-1">
            <AlertTriangle className="size-3.5" />
            {slipCount} slipping
          </span>
        )}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No timeline items"
          description="No WBS tasks, roadmap activities, critical-path steps or milestones match the current filters."
        />
      ) : view === "gantt" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WBS Gantt — month grid</CardTitle>
          </CardHeader>
          <CardContent>
            <RoadmapGantt
              items={filtered}
              showBaseline={showBaseline}
              onSelectItem={(it) => setSelected({ id: it.id, kind: it.kind })}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{group.name}</span>
                  <Badge variant="outline">{group.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="border-border/60 relative space-y-4 border-l pl-6">
                  {group.items.map((item) => (
                    <TimelineRow
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      onSelect={() => setSelected({ id: item.id, kind: item.kind })}
                    />
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ItemEditDialog
        selected={selected}
        data={editData}
        options={editOptions}
        onOpenChange={(open) => !open && setSelected(null)}
        onSaved={() => {
          setSelected(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function TimelineRow({ item, onSelect }: { item: TimelineItem; onSelect: () => void }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  const slipping = isSlipping(item);

  return (
    <li className="relative">
      <span
        className={
          "absolute top-1 -left-[31px] flex size-4 items-center justify-center rounded-full border " +
          (slipping ? "bg-rag-red/10 border-rag-red/40" : "bg-background border-border")
        }
        aria-hidden
      >
        <span className={"size-1.5 rounded-full " + (slipping ? "bg-rag-red" : "bg-muted-foreground/50")} />
      </span>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        title="Click to edit"
        className="hover:bg-accent/40 -mx-2 flex cursor-pointer flex-col gap-1.5 rounded-md px-2 py-1 transition-colors sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={"inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium " + meta.className}>
              <Icon className="size-3" />
              {meta.label}
            </span>
            {item.code && (
              <Badge variant="outline" className="font-mono text-xs">
                {item.code}
              </Badge>
            )}
            {item.isCritical && (
              <Badge className="bg-rag-red/10 text-rag-red border-rag-red/30">Critical</Badge>
            )}
            {slipping && (
              <span className="text-rag-red inline-flex items-center gap-1 text-xs font-medium">
                <AlertTriangle className="size-3" />
                Slipping
                {item.varianceDays != null && item.varianceDays > 0 ? ` (+${item.varianceDays}d)` : ""}
              </span>
            )}
          </div>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-muted-foreground text-xs">
            {item.owner ? `${item.owner} · ` : ""}
            {dateRangeLabel(item)}
            {item.dependency ? ` · depends on ${item.dependency}` : ""}
          </p>
          {baselineLabel(item) && (
            <p className="text-muted-foreground/80 text-xs">
              <span className="font-medium">Baseline:</span> {baselineLabel(item)}
            </p>
          )}
        </div>
        {item.status && (
          <div className="shrink-0">
            <StatusBadge status={item.status} />
          </div>
        )}
      </div>
    </li>
  );
}

function dateRangeLabel(item: TimelineItem): string {
  if (item.start && item.end && item.start !== item.end) {
    return `${formatDate(item.start)} → ${formatDate(item.end)}`;
  }
  const single = item.end ?? item.start;
  return single ? formatDate(single) : "Date TBC";
}

/**
 * Baseline plan summary, shown only when it diverges from the current forecast
 * (i.e. there is real slippage to surface).
 */
function baselineLabel(item: TimelineItem): string | null {
  const baseStart = item.baselineStart;
  const baseEnd = item.baselineEnd;
  if (!baseStart && !baseEnd) return null;
  const divergesEnd = baseEnd && baseEnd !== item.end;
  const divergesStart = baseStart && baseStart !== item.start;
  if (!divergesEnd && !divergesStart) return null;
  if (baseStart && baseEnd && baseStart !== baseEnd) {
    return `${formatDate(baseStart)} → ${formatDate(baseEnd)}`;
  }
  const single = baseEnd ?? baseStart;
  return single ? formatDate(single) : null;
}

function groupByWorkstream(items: TimelineItem[]) {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = item.workstream?.trim() || "Unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  const groups = Array.from(map.entries()).map(([name, groupItems]) => ({
    name,
    items: [...groupItems].sort((a, b) => {
      const ta = primaryTime(a);
      const tb = primaryTime(b);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return ta - tb;
    }),
  }));
  groups.sort((a, b) => {
    if (a.name === "Unassigned") return 1;
    if (b.name === "Unassigned") return -1;
    return a.name.localeCompare(b.name);
  });
  return groups;
}
