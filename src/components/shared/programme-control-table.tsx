"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { ExportButton } from "@/components/shared/export-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { EntityKey } from "@/lib/rbac/permissions";
import { formatDate, titleCase } from "@/lib/utils";

export type ControlRow = Record<string, string | number | boolean | Date | null | undefined>;

export type ControlColumn = {
  key: string;
  label: string;
  kind?: "status" | "rag" | "confidence" | "date" | "mono" | "number";
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
}: {
  rows: ControlRow[];
  columns: ControlColumn[];
  filename: string;
  entity: EntityKey;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const columnDefs: ColumnDef<ControlRow>[] = columns.map((column) => ({
    id: column.key,
    header: column.label,
    accessorFn: (row) => row[column.key] ?? "",
    cell: ({ row }) => renderValue(row.original[column.key], column.kind),
  }));

  const exportRows = rows.map((row) =>
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
    <DataTable
      columns={columnDefs}
      data={rows}
      searchPlaceholder={searchPlaceholder}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      toolbar={<ExportButton rows={exportRows} filename={filename} entity={entity} />}
    />
  );
}
