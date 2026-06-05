import { prisma } from "@/lib/db";
import type { RaciRow } from "@prisma/client";

/** Role columns rendered in the RACI matrix, in display order. */
export const RACI_COLUMNS = [
  { key: "programme", label: "Programme" },
  { key: "product", label: "Product" },
  { key: "design", label: "Design" },
  { key: "execution", label: "Execution" },
  { key: "publishing", label: "Publishing" },
  { key: "crossChannels", label: "Cross Channels" },
  { key: "seo", label: "SEO" },
  { key: "regional", label: "Regional" },
] as const satisfies ReadonlyArray<{ key: keyof RaciRow; label: string }>;

export type RaciColumn = (typeof RACI_COLUMNS)[number];

/**
 * Returns true when any role cell carries an Accountable ("A") assignment.
 * Matches a standalone "A" as well as combined values like "R/A".
 */
export function hasAccountable(row: RaciRow): boolean {
  return RACI_COLUMNS.some(({ key }) => {
    const value = row[key];
    return typeof value === "string" && /a/i.test(value);
  });
}

export type RaciMatrix = {
  rows: RaciRow[];
  summary: { total: number; withGap: number };
};

export async function getRaciRows(): Promise<RaciMatrix> {
  const rows = await prisma.raciRow.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const withGap = rows.filter((row) => !hasAccountable(row)).length;

  return {
    rows,
    summary: { total: rows.length, withGap },
  };
}
