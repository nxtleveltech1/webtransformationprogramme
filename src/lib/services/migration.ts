import { prisma } from "@/lib/db";
import { PageTreatment } from "@prisma/client";

export type MigrationItem = Awaited<
  ReturnType<typeof prisma.pageMigrationItem.findMany>
>[number];

export interface TreatmentBreakdown {
  treatment: PageTreatment;
  items: number;
  pages: number;
}

export interface MigrationData {
  items: MigrationItem[];
  totalPages: number;
  moved: number;
  inScopeRemaining: number;
  outOfScope: number;
  movedPct: number;
  inScopeRemainingPct: number;
  outOfScopePct: number;
  byTreatment: TreatmentBreakdown[];
}

/** Parses the leading integer page count from an effort estimate string. */
export function pageCount(item: Pick<MigrationItem, "effortEstimate">): number {
  return parseInt(item.effortEstimate ?? "0", 10) || 0;
}

const MOVED_RE = /moved|complete|done|live/i;
const OUT_OF_SCOPE_RE = /out.?of.?scope/i;

function isMoved(item: MigrationItem): boolean {
  return !!item.status && MOVED_RE.test(item.status);
}

function isOutOfScope(item: MigrationItem): boolean {
  if (item.status && OUT_OF_SCOPE_RE.test(item.status)) return true;
  return (
    item.treatment === PageTreatment.CONSOLIDATE ||
    item.treatment === PageTreatment.RETIRE
  );
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export async function getMigrationData(): Promise<MigrationData> {
  const items = await prisma.pageMigrationItem.findMany({
    orderBy: { createdAt: "asc" },
  });

  let totalPages = 0;
  let moved = 0;
  let outOfScope = 0;
  let inScopeRemaining = 0;

  const treatmentMap = new Map<PageTreatment, { items: number; pages: number }>();

  for (const item of items) {
    const pages = pageCount(item);
    totalPages += pages;

    if (isMoved(item)) {
      moved += pages;
    } else if (isOutOfScope(item)) {
      outOfScope += pages;
    } else {
      inScopeRemaining += pages;
    }

    if (item.treatment) {
      const entry = treatmentMap.get(item.treatment) ?? { items: 0, pages: 0 };
      entry.items += 1;
      entry.pages += pages;
      treatmentMap.set(item.treatment, entry);
    }
  }

  const byTreatment: TreatmentBreakdown[] = Array.from(treatmentMap.entries())
    .map(([treatment, v]) => ({ treatment, items: v.items, pages: v.pages }))
    .sort((a, b) => b.pages - a.pages);

  return {
    items,
    totalPages,
    moved,
    inScopeRemaining,
    outOfScope,
    movedPct: pct(moved, totalPages),
    inScopeRemainingPct: pct(inScopeRemaining, totalPages),
    outOfScopePct: pct(outOfScope, totalPages),
    byTreatment,
  };
}
