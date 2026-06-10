"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { ExportButton } from "@/components/shared/export-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EntityKey } from "@/lib/rbac/permissions";
import { cn, formatDate, titleCase } from "@/lib/utils";

export type ControlRow = Record<string, string | number | boolean | Date | null | undefined>;

export type ControlColumn = {
  key: string;
  label: string;
  kind?: "status" | "rag" | "confidence" | "date" | "mono" | "number";
};

export type ControlQuickFilter = {
  key: string;
  label: string;
  predicate: (row: ControlRow) => boolean;
};

function renderValue(value: ControlRow[string], kind?: ControlColumn["kind"]) {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "status" || kind === "confidence") return <StatusBadge status={String(value)} />;
  if (kind === "rag") {
    const tone = value === "RED" ? "danger" : value === "GREEN" ? "success" : "warning";
    return <StatusBadge status={String(value)} tone={tone} />;
  }
  if (kind === "date") return value instanceof Date || typeof value === "string" ? formatDate(value) : String(value);
  if (kind === "mono") {
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {String(value)}
      </Badge>
    );
  }
  return String(value);
}

export function ProgrammeControlTable({
  rows,
  columns,
  filename,
  entity,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  quickFilters,
  tableKey,
}: {
  rows: ControlRow[];
  columns: ControlColumn[];
  filename: string;
  entity: EntityKey;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  quickFilters?: ControlQuickFilter[];
  /** Stable per-screen key enabling per-user persistence of column visibility. */
  tableKey?: string;
}) {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const active = quickFilters?.find((f) => f.key === activeFilter) ?? null;
  const visibleRows = active ? rows.filter(active.predicate) : rows;

  const columnDefs: ColumnDef<ControlRow>[] = columns.map((column) => ({
    id: column.key,
    header: column.label,
    accessorFn: (row) => row[column.key] ?? "",
    cell: ({ row }) => renderValue(row.original[column.key], column.kind),
  }));

  const exportRows = visibleRows.map((row) =>
    Object.fromEntries(
      columns.map((column) => {
        const value = row[column.key];
        return [
          column.label,
          value instanceof Date
            ? formatDate(value)
            : typeof value === "string"
              ? titleCase(value)
              : value ?? "",
        ];
      }),
    ),
  );

  return (
    <div className="flex flex-col gap-3">
      {quickFilters && quickFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Quick filter:</span>
          <Button
            type="button"
            variant={active ? "outline" : "default"}
            size="sm"
            onClick={() => setActiveFilter(null)}
            aria-pressed={!active}
          >
            All ({rows.length})
          </Button>
          {quickFilters.map((f) => {
            const count = rows.filter(f.predicate).length;
            const isActive = activeFilter === f.key;
            return (
              <Button
                key={f.key}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(isActive ? null : f.key)}
                aria-pressed={isActive}
                className={cn(count === 0 && "opacity-60")}
              >
                {f.label} ({count})
              </Button>
            );
          })}
        </div>
      )}
      <DataTable
        columns={columnDefs}
        data={visibleRows}
        searchPlaceholder={searchPlaceholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        tableKey={tableKey}
        mappingColumns
        toolbar={<ExportButton rows={exportRows} filename={filename} entity={entity} />}
      />
    </div>
  );
}
