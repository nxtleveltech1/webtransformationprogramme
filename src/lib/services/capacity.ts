/**
 * Capacity planning / resource leveling engine.
 *
 * Pure, side-effect-free functions that turn ResourceAllocation records into a
 * time-bucketed utilisation model: a person x period heatmap matrix,
 * over-allocation conflict detection, and non-destructive leveling
 * suggestions.
 *
 * Design notes / honesty contract:
 *  - `ResourceAllocation` is currently EMPTY in the live DB and many allocations
 *    have null start/end dates. Every function here is defensive against empty
 *    input and against missing dates, and the callers render explicit empty /
 *    "not captured" states rather than inventing numbers.
 *  - Dates are stored as `String?` (often ISO `YYYY-MM-DD`, sometimes free
 *    text). We parse leniently and skip allocations we cannot place on a
 *    timeline, surfacing the count of undated allocations so they are never
 *    silently dropped.
 */

/** Minimal shape required from a ResourceAllocation row. */
export interface CapacityAllocationInput {
  id: string;
  resourceId: string;
  /** Display name resolved for the owning resource/person. */
  resourceName: string;
  personId?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  workstreamCode?: string | null;
  roleOnWork?: string | null;
  /** 0-100 (may exceed 100 for a single mis-entered allocation). */
  allocationPct: number;
  /** ISO-ish date string or null. */
  startDate?: string | null;
  /** ISO-ish date string or null. */
  endDate?: string | null;
}

/** A single month bucket on the planning timeline. */
export interface CapacityPeriod {
  /** Sort/lookup key, e.g. "2026-06". */
  key: string;
  /** Human label, e.g. "Jun 2026". */
  label: string;
  /** First day of the month (UTC). */
  start: Date;
}

export type UtilisationBand =
  | "EMPTY"
  | "UNDER"
  | "HEALTHY"
  | "FULL"
  | "OVER";

/** One cell of the heatmap: a person's utilisation in a single period. */
export interface CapacityCell {
  resourceId: string;
  resourceName: string;
  periodKey: string;
  /** Summed allocation % across all of this person's allocations in this period. */
  utilisationPct: number;
  band: UtilisationBand;
  /** Allocation ids contributing to this cell. */
  allocationIds: string[];
}

export interface CapacityRow {
  resourceId: string;
  resourceName: string;
  cells: CapacityCell[];
  /** Peak utilisation across all periods (the worst month). */
  peakPct: number;
  /** Mean utilisation across periods that have any allocation. */
  meanPct: number;
}

/** A detected over-allocation conflict for one person in one period. */
export interface CapacityConflict {
  resourceId: string;
  resourceName: string;
  periodKey: string;
  periodLabel: string;
  utilisationPct: number;
  /** How far over 100% the person is committed. */
  overByPct: number;
  contributing: ConflictAllocation[];
}

export interface ConflictAllocation {
  id: string;
  label: string;
  allocationPct: number;
  projectName?: string | null;
  workstreamCode?: string | null;
  roleOnWork?: string | null;
}

/** A non-destructive leveling suggestion. Display only. */
export interface LevelingSuggestion {
  id: string;
  resourceId: string;
  resourceName: string;
  periodKey: string;
  periodLabel: string;
  utilisationPct: number;
  overByPct: number;
  kind: "SHIFT" | "REASSIGN" | "REDUCE";
  /** Human-readable, actionable recommendation. */
  summary: string;
  /** The allocation the suggestion targets (the smallest contributor). */
  targetAllocationId: string;
}

export interface CapacityModel {
  periods: CapacityPeriod[];
  rows: CapacityRow[];
  conflicts: CapacityConflict[];
  suggestions: LevelingSuggestion[];
  stats: {
    allocationCount: number;
    /** Allocations skipped because they had no usable start/end date. */
    undatedCount: number;
    datedCount: number;
    resourceCount: number;
    periodCount: number;
    conflictCount: number;
    /** True when there is nothing to plot on a timeline. */
    isEmpty: boolean;
  };
}

/** Bands chosen to mirror the existing workload flags + a "full" middle. */
export function utilisationBand(pct: number): UtilisationBand {
  if (pct <= 0) return "EMPTY";
  if (pct > 100) return "OVER";
  if (pct >= 90) return "FULL";
  if (pct < 50) return "UNDER";
  return "HEALTHY";
}

export const BAND_LABEL: Record<UtilisationBand, string> = {
  EMPTY: "No allocation",
  UNDER: "Under-utilised (<50%)",
  HEALTHY: "Healthy (50-89%)",
  FULL: "Near full (90-100%)",
  OVER: "Over-allocated (>100%)",
};

/**
 * Parse a stored date string leniently. Accepts ISO dates and a few common
 * forms; returns null for anything we cannot confidently place on a timeline.
 */
function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Fast path: ISO-ish YYYY-MM or YYYY-MM-DD.
  const iso = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(trimmed);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    const day = iso[3] ? Number(iso[3]) : 1;
    const d = new Date(Date.UTC(year, month, day));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function firstOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

/**
 * Build the contiguous list of month buckets spanning the earliest start to the
 * latest end across all dated allocations. Capped to avoid runaway timelines
 * from bad data.
 */
function buildPeriods(
  ranges: { start: Date; end: Date }[],
  maxMonths = 36,
): CapacityPeriod[] {
  if (!ranges.length) return [];
  let min = ranges[0].start;
  let max = ranges[0].end;
  for (const r of ranges) {
    if (r.start < min) min = r.start;
    if (r.end > max) max = r.end;
  }
  const periods: CapacityPeriod[] = [];
  let cursor = firstOfMonth(min);
  const last = firstOfMonth(max);
  let guard = 0;
  while (cursor <= last && guard < maxMonths) {
    periods.push({ key: monthKey(cursor), label: monthLabel(cursor), start: cursor });
    cursor = addMonths(cursor, 1);
    guard += 1;
  }
  return periods;
}

interface DatedAllocation extends CapacityAllocationInput {
  start: Date;
  end: Date;
}

/** Inclusive: does the allocation overlap the given month bucket? */
function coversMonth(alloc: DatedAllocation, period: CapacityPeriod): boolean {
  const periodEnd = addMonths(period.start, 1); // exclusive next-month start
  return alloc.start < periodEnd && alloc.end >= period.start;
}

function allocationLabel(a: CapacityAllocationInput): string {
  return (
    a.projectName ??
    a.projectId ??
    a.workstreamCode ??
    a.roleOnWork ??
    "Unassigned work"
  );
}

/**
 * Core engine. Pure: same input -> same output, no I/O.
 *
 * Buckets each dated allocation into every month it overlaps and sums
 * allocation % per person per month, producing a heatmap matrix, conflicts and
 * leveling suggestions. Allocations without usable dates are counted but not
 * placed (reported via `stats.undatedCount`).
 */
export function buildCapacityModel(
  allocations: CapacityAllocationInput[],
): CapacityModel {
  const safe = Array.isArray(allocations) ? allocations : [];

  // Partition into dated (placeable) vs undated.
  const dated: DatedAllocation[] = [];
  let undatedCount = 0;
  for (const a of safe) {
    const start = parseDate(a.startDate);
    const endRaw = parseDate(a.endDate);
    if (!start) {
      undatedCount += 1;
      continue;
    }
    // Open-ended allocations default to a single month at their start.
    const end = endRaw && endRaw >= start ? endRaw : start;
    dated.push({ ...a, start, end });
  }

  const periods = buildPeriods(dated.map((d) => ({ start: d.start, end: d.end })));

  // Group dated allocations by resource.
  const byResource = new Map<string, DatedAllocation[]>();
  for (const a of dated) {
    const list = byResource.get(a.resourceId);
    if (list) list.push(a);
    else byResource.set(a.resourceId, [a]);
  }

  const rows: CapacityRow[] = [];
  const conflicts: CapacityConflict[] = [];

  for (const [resourceId, allocs] of byResource) {
    const resourceName = allocs[0]?.resourceName ?? resourceId;
    const cells: CapacityCell[] = [];
    let peakPct = 0;
    let sumOfActive = 0;
    let activePeriods = 0;

    for (const period of periods) {
      const inPeriod = allocs.filter((a) => coversMonth(a, period));
      const utilisationPct = inPeriod.reduce(
        (sum, a) => sum + (Number.isFinite(a.allocationPct) ? a.allocationPct : 0),
        0,
      );
      const band = utilisationBand(utilisationPct);
      cells.push({
        resourceId,
        resourceName,
        periodKey: period.key,
        utilisationPct,
        band,
        allocationIds: inPeriod.map((a) => a.id),
      });
      if (utilisationPct > peakPct) peakPct = utilisationPct;
      if (utilisationPct > 0) {
        sumOfActive += utilisationPct;
        activePeriods += 1;
      }

      if (utilisationPct > 100 && inPeriod.length > 0) {
        conflicts.push({
          resourceId,
          resourceName,
          periodKey: period.key,
          periodLabel: period.label,
          utilisationPct,
          overByPct: utilisationPct - 100,
          contributing: inPeriod
            .slice()
            .sort((a, b) => b.allocationPct - a.allocationPct)
            .map((a) => ({
              id: a.id,
              label: allocationLabel(a),
              allocationPct: a.allocationPct,
              projectName: a.projectName ?? null,
              workstreamCode: a.workstreamCode ?? null,
              roleOnWork: a.roleOnWork ?? null,
            })),
        });
      }
    }

    rows.push({
      resourceId,
      resourceName,
      cells,
      peakPct,
      meanPct: activePeriods ? Math.round(sumOfActive / activePeriods) : 0,
    });
  }

  // Stable ordering: worst (highest peak) resources first.
  rows.sort((a, b) => b.peakPct - a.peakPct || a.resourceName.localeCompare(b.resourceName));
  conflicts.sort(
    (a, b) =>
      b.overByPct - a.overByPct ||
      a.resourceName.localeCompare(b.resourceName) ||
      a.periodKey.localeCompare(b.periodKey),
  );

  const suggestions = buildSuggestions(conflicts, periods);

  return {
    periods,
    rows,
    conflicts,
    suggestions,
    stats: {
      allocationCount: safe.length,
      undatedCount,
      datedCount: dated.length,
      resourceCount: byResource.size,
      periodCount: periods.length,
      conflictCount: conflicts.length,
      isEmpty: periods.length === 0 || rows.length === 0,
    },
  };
}

/**
 * Derive non-destructive leveling suggestions from detected conflicts.
 * Strategy (display-only, never mutates):
 *  - Target the SMALLEST contributing allocation (least disruptive to move).
 *  - If a later, non-overloaded period exists, suggest SHIFTing the overflow
 *    there. Otherwise suggest REASSIGNing or REDUCING the smallest contributor.
 */
export function buildSuggestions(
  conflicts: CapacityConflict[],
  periods: CapacityPeriod[],
): LevelingSuggestion[] {
  const periodIndex = new Map(periods.map((p, i) => [p.key, i]));

  return conflicts.map((c) => {
    // Smallest contributor is the cheapest to move.
    const smallest = c.contributing.reduce((min, a) =>
      a.allocationPct < min.allocationPct ? a : min,
    );
    const idx = periodIndex.get(c.periodKey) ?? -1;
    const nextLabel =
      idx >= 0 && idx + 1 < periods.length ? periods[idx + 1].label : null;

    let kind: LevelingSuggestion["kind"];
    let summary: string;

    if (c.contributing.length > 1 && nextLabel) {
      kind = "SHIFT";
      summary = `Shift "${smallest.label}" (${smallest.allocationPct}%) from ${c.periodLabel} to ${nextLabel} to clear the ${c.overByPct}% overflow.`;
    } else if (c.contributing.length > 1) {
      kind = "REASSIGN";
      summary = `Reassign "${smallest.label}" (${smallest.allocationPct}%) to another resource — ${c.resourceName} is ${c.overByPct}% over in ${c.periodLabel}.`;
    } else {
      kind = "REDUCE";
      summary = `Reduce "${smallest.label}" by ${c.overByPct}% in ${c.periodLabel} (currently ${smallest.allocationPct}%, total ${c.utilisationPct}%).`;
    }

    return {
      id: `${c.resourceId}:${c.periodKey}`,
      resourceId: c.resourceId,
      resourceName: c.resourceName,
      periodKey: c.periodKey,
      periodLabel: c.periodLabel,
      utilisationPct: c.utilisationPct,
      overByPct: c.overByPct,
      kind,
      summary,
      targetAllocationId: smallest.id,
    };
  });
}
