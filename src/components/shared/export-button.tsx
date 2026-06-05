"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/rbac/role-context";
import type { EntityKey } from "@/lib/rbac/permissions";
import { toast } from "sonner";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  return lines.join("\n");
}

export function ExportButton({
  rows,
  filename,
  entity,
  label = "Export CSV",
}: {
  rows: Record<string, unknown>[];
  filename: string;
  entity: EntityKey;
  label?: string;
}) {
  const { can } = useRole();
  if (!can("export", entity)) return null;

  const handleExport = () => {
    if (!rows.length) {
      toast.info("Nothing to export");
      return;
    }
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} record(s)`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" />
      {label}
    </Button>
  );
}
