"use client";

import * as React from "react";
import { Flag, AlertTriangle } from "lucide-react";

import { cn, parseDateMs } from "@/lib/utils";
import type { TimelineItem } from "./timeline-client";

const LABEL_W = 240; // px
const MIN_MONTH_W = 72; // px
const MIN_MONTHS = 4; // keep the grid wide enough to read even for clustered data

const DAY_MS = 1000 * 60 * 60 * 24;

function parseDate(value: string | null): number | null {
  return parseDateMs(value);
}

function isSlipping(item: TimelineItem): boolean {
  if (item.varianceDays != null && item.varianceDays > 0) return true;
  const s = (item.status ?? "").toLowerCase();
  return /(slip|delay|late|at[\s-]?risk|behind|blocked|red|overdue)/.test(s);
}

/** A timeline item with at least one resolvable date. */
function itemTimes(item: TimelineItem): { start: number | null; end: number | null } {
  return { start: parseDate(item.start), end: parseDate(item.end) };
}

/** Baseline plan times (where a baseline exists). */
function baselineTimes(item: TimelineItem): { start: number | null; end: number | null } {
  return { start: parseDate(item.baselineStart), end: parseDate(item.baselineEnd) };
}

/**
 * Forecast position for a milestone: the agreed baseline (targetDate) shifted by
 * the recorded variance in days. Returns null when the baseline is unparseable.
 */
function milestoneForecastMs(item: TimelineItem): number | null {
  const base = parseDate(item.baselineEnd ?? item.end);
  if (base === null) return null;
  return base + (item.varianceDays ?? 0) * DAY_MS;
}

function hasDate(item: TimelineItem): boolean {
  const { start, end } = itemTimes(item);
  return start !== null || end !== null;
}

interface Month {
  key: string;
  label: string;
  start: number;
  isYearStart: boolean;
}

function startOfMonth(ts: number): Date {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildMonths(startMs: number, endExclusiveMs: number): Month[] {
  const months: Month[] = [];
  const d = startOfMonth(startMs);
  while (d.getTime() < endExclusiveMs) {
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString(undefined, { month: "short" }),
      start: d.getTime(),
      isYearStart: d.getMonth() === 0,
    });
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function groupByWorkstream(items: TimelineItem[]) {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = item.workstream?.trim() || "Unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  const groups = Array.from(map.entries()).map(([name, groupItems]) => ({ name, items: groupItems }));
  groups.sort((a, b) => {
    if (a.name === "Unassigned") return 1;
    if (b.name === "Unassigned") return -1;
    return a.name.localeCompare(b.name);
  });
  return groups;
}

export function RoadmapGantt({
  items,
  showBaseline = false,
}: {
  items: TimelineItem[];
  showBaseline?: boolean;
}) {
  const dated = React.useMemo(() => items.filter(hasDate), [items]);
  const undatedCount = items.length - dated.length;

  const range = React.useMemo(() => {
    const times: number[] = [];
    for (const it of dated) {
      const { start, end } = itemTimes(it);
      if (start !== null) times.push(start);
      if (end !== null) times.push(end);
      const { start: bs, end: be } = baselineTimes(it);
      if (bs !== null) times.push(bs);
      if (be !== null) times.push(be);
      if (it.kind === "milestone") {
        const f = milestoneForecastMs(it);
        if (f !== null) times.push(f);
      }
    }
    if (times.length === 0) return null;
    const sorted = [...times].sort((a, b) => a - b);
    // Reject dates far from the median cluster so a stray/typo date (e.g. "2001")
    // doesn't stretch the grid across decades.
    const median = sorted[Math.floor(sorted.length / 2)];
    const WINDOW = 1000 * 60 * 60 * 24 * 365 * 2; // +/- 2 years
    const core = sorted.filter((t) => Math.abs(t - median) <= WINDOW);
    const use = core.length ? core : sorted;
    return { min: use[0], max: use[use.length - 1] };
  }, [dated]);

  if (!range) {
    return (
      <p className="text-muted-foreground text-sm">
        None of the current items have a scheduled date, so there is nothing to plot on the Gantt.
        Switch to the list view to see them.
      </p>
    );
  }

  // Build a month window with one month of padding either side, and a minimum
  // width so a tight cluster of dates still reads as a proper grid.
  const firstMonth = startOfMonth(range.min);
  firstMonth.setMonth(firstMonth.getMonth() - 1); // pad start
  const lastMonth = startOfMonth(range.max);
  lastMonth.setMonth(lastMonth.getMonth() + 2); // pad end (exclusive boundary)
  const months = buildMonths(firstMonth.getTime(), lastMonth.getTime());
  while (months.length < MIN_MONTHS) {
    const next = startOfMonth(months[months.length - 1].start);
    next.setMonth(next.getMonth() + 1);
    months.push({
      key: `${next.getFullYear()}-${next.getMonth()}`,
      label: next.toLocaleDateString(undefined, { month: "short" }),
      start: next.getTime(),
      isYearStart: next.getMonth() === 0,
    });
  }

  const rangeStart = months[0].start;
  const lastM = new Date(months[months.length - 1].start);
  lastM.setMonth(lastM.getMonth() + 1);
  const span = lastM.getTime() - rangeStart || 1;
  const groups = groupByWorkstream(dated);
  const trackMinWidth = months.length * MIN_MONTH_W;
  const pct = (t: number) => Math.min(100, Math.max(0, ((t - rangeStart) / span) * 100));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div style={{ minWidth: LABEL_W + trackMinWidth }}>
          {/* Header */}
          <div className="border-border flex items-stretch border-b">
            <div
              className="text-muted-foreground shrink-0 px-2 py-2 text-xs font-medium"
              style={{ width: LABEL_W }}
            >
              Activity
            </div>
            <div className="relative flex flex-1">
              {months.map((m) => (
                <div
                  key={m.key}
                  className="border-border/40 text-muted-foreground flex-1 border-l px-1 py-2 text-center text-[11px] font-medium"
                >
                  {m.label}
                  {m.isYearStart || months.indexOf(m) === 0 ? (
                    <span className="text-muted-foreground/70 block text-[9px]">
                      {new Date(m.start).getFullYear()}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {groups.map((group) => (
            <div key={group.name}>
              <div className="bg-muted/40 text-foreground border-border/60 border-b px-2 py-1.5 text-xs font-semibold">
                {group.name}
              </div>
              {group.items.map((item) => {
                const { start: s, end: e } = itemTimes(item);
                const slipping = isSlipping(item);
                const left = pct(s ?? e!);
                const right = pct(e ?? s!);
                const widthPct = Math.max(right - left, 0);

                // Baseline overlay geometry (bars). Only drawn when a baseline
                // exists and diverges from the current forecast.
                const { start: bs, end: be } = baselineTimes(item);
                const baseLeft = bs !== null || be !== null ? pct((bs ?? be)!) : null;
                const baseRight = bs !== null || be !== null ? pct((be ?? bs)!) : null;
                const baseWidthPct =
                  baseLeft !== null && baseRight !== null ? Math.max(baseRight - baseLeft, 0) : 0;
                const baselineBarDiverges =
                  showBaseline &&
                  item.kind !== "milestone" &&
                  baseLeft !== null &&
                  (Math.abs(baseLeft - left) > 0.1 || Math.abs(baseWidthPct - widthPct) > 0.1);

                // Milestone baseline-vs-forecast geometry.
                const msBaselineMs = parseDate(item.baselineEnd ?? item.end);
                const msForecastMs = milestoneForecastMs(item);
                const msBaselinePct = msBaselineMs !== null ? pct(msBaselineMs) : null;
                const msForecastPct = msForecastMs !== null ? pct(msForecastMs) : null;
                const milestoneSlips =
                  showBaseline &&
                  item.kind === "milestone" &&
                  msBaselinePct !== null &&
                  msForecastPct !== null &&
                  Math.abs(msForecastPct - msBaselinePct) > 0.1;

                return (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="border-border/40 hover:bg-accent/30 flex items-center border-b transition-colors"
                  >
                    <div
                      className="flex shrink-0 items-center gap-1.5 px-2 py-2"
                      style={{ width: LABEL_W }}
                    >
                      {item.isCritical && (
                        <span className="bg-rag-red size-1.5 shrink-0 rounded-full" aria-hidden />
                      )}
                      <span className="truncate text-xs" title={item.title}>
                        {item.title}
                      </span>
                    </div>
                    <div className="relative h-9 flex-1">
                      {/* gridlines */}
                      <div className="absolute inset-0 flex" aria-hidden>
                        {months.map((m) => (
                          <div key={m.key} className="border-border/30 flex-1 border-l" />
                        ))}
                      </div>
                      {item.kind === "milestone" ? (
                        <>
                          {/* slip connector between baseline and forecast */}
                          {milestoneSlips && (
                            <span
                              className="bg-rag-red/40 absolute top-1/2 h-0.5 -translate-y-1/2"
                              style={{
                                left: `${Math.min(msBaselinePct!, msForecastPct!)}%`,
                                width: `${Math.abs(msForecastPct! - msBaselinePct!)}%`,
                              }}
                              aria-hidden
                            />
                          )}
                          {/* baseline (planned) flag — hollow */}
                          {milestoneSlips && (
                            <span
                              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                              style={{ left: `${msBaselinePct}%` }}
                              title={`${item.title} — baseline (planned)`}
                            >
                              <Flag className="text-muted-foreground/60 size-4" strokeWidth={1.5} />
                            </span>
                          )}
                          {/* forecast (current) flag */}
                          <span
                            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${(msForecastPct ?? pct(e ?? s!))}%` }}
                            title={`${item.title} — ${milestoneSlips ? "forecast" : "milestone"}`}
                          >
                            <Flag
                              className={cn(
                                "size-4 fill-current",
                                slipping ? "text-rag-red" : "text-chart-3",
                              )}
                            />
                          </span>
                        </>
                      ) : (
                        <>
                          {/* baseline plan bar — drawn behind when it diverges */}
                          {baselineBarDiverges && (
                            <div
                              className="border-muted-foreground/50 absolute top-1/2 h-4 -translate-y-1/2 rounded-sm border border-dashed"
                              style={{
                                left: `${baseLeft}%`,
                                width: `max(${baseWidthPct}%, 12px)`,
                              }}
                              title={`${item.title} — baseline plan`}
                              aria-hidden
                            />
                          )}
                          <div
                            className={cn(
                              "absolute top-1/2 flex h-4 -translate-y-1/2 items-center gap-1 rounded-sm px-1",
                              item.kind === "wbs"
                                ? "bg-primary/80"
                                : item.kind === "critical"
                                ? "bg-rag-amber/80"
                                : slipping
                                  ? "bg-rag-red/80"
                                  : "bg-secondary/80",
                            )}
                            style={{ left: `${left}%`, width: `max(${widthPct}%, 12px)` }}
                            title={`${item.title}${slipping ? " — slipping" : ""}`}
                          >
                            {slipping && (
                              <AlertTriangle className="size-3 shrink-0 text-white" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend + undated note */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-primary/80 h-2.5 w-5 rounded-sm" /> WBS task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-secondary/80 h-2.5 w-5 rounded-sm" /> Roadmap activity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-rag-amber/80 h-2.5 w-5 rounded-sm" /> Critical path
        </span>
        <span className="flex items-center gap-1.5">
          <Flag className="text-chart-3 size-3.5 fill-current" /> Milestone
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="text-rag-red size-3.5" /> Slipping
        </span>
        {showBaseline && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="border-muted-foreground/50 h-2.5 w-5 rounded-sm border border-dashed" />{" "}
              Baseline plan
            </span>
            <span className="flex items-center gap-1.5">
              <Flag className="text-muted-foreground/60 size-3.5" strokeWidth={1.5} /> Baseline
              milestone
            </span>
          </>
        )}
        {undatedCount > 0 && (
          <span className="ml-auto">
            {undatedCount} undated item{undatedCount === 1 ? "" : "s"} hidden — see the list view.
          </span>
        )}
      </div>
    </div>
  );
}
