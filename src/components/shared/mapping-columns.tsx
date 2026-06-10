"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { VisibilityState } from "@tanstack/react-table";

import type { ControlColumn } from "@/components/shared/programme-control-table";

/**
 * Cross-platform "mapping" taxonomy shared across roadmap entities (tasks,
 * risks, dependencies, constraints …). Exposed as selectable columns in the
 * Column Management dropdown on every table screen. Hidden by default so
 * existing layouts are unchanged until a user opts in (and their choice is
 * persisted — see DataTable `tableKey`).
 */
export const MAPPING_COLUMN_KEYS = ["channel", "domain", "areaJourney", "cluster", "market"] as const;
export type MappingColumnKey = (typeof MAPPING_COLUMN_KEYS)[number];

const LABELS: Record<MappingColumnKey, string> = {
  channel: "Channel",
  domain: "Domain",
  areaJourney: "Area / Journey",
  cluster: "Cluster",
  market: "Market",
};

/** Column defs for screens that render the shared `DataTable` with `ColumnDef[]`.
 *  Uses a loose accessor so it is type-safe across heterogeneous row types — a
 *  row without the field simply renders an em dash. */
export function mappingColumnDefs<T>(): ColumnDef<T>[] {
  return MAPPING_COLUMN_KEYS.map((key) => ({
    id: key,
    header: LABELS[key],
    accessorFn: (row) => (row as Record<string, unknown>)[key] ?? "",
    cell: ({ getValue }) => {
      const v = getValue();
      return v ? String(v) : "—";
    },
    enableHiding: true,
  }));
}

/** Equivalent config rows for the `ProgrammeControlTable` (config-driven) screens. */
export const MAPPING_CONTROL_COLUMNS: ControlColumn[] = MAPPING_COLUMN_KEYS.map((key) => ({
  key,
  label: LABELS[key],
}));

/** Initial visibility applied when a user has no saved preference: all mapping
 *  columns hidden. */
export const MAPPING_DEFAULT_HIDDEN: VisibilityState = Object.fromEntries(
  MAPPING_COLUMN_KEYS.map((k) => [k, false]),
);
