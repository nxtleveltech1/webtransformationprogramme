"use client";

import { ChevronDown, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/lib/rbac/role-context";
import type { EntityKey } from "@/lib/rbac/permissions";
import { buildWorkbookXml, excelFileName, EXCEL_CONTENT_TYPE } from "@/lib/export/excel";
import { cellText } from "@/lib/export/types";
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

function triggerDownload(content: string, mime: string, name: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const HTML_ESCAPE = (v: unknown) =>
  cellText(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Open a branded, print-optimised window for the current rows (Save as PDF). */
function printRows(rows: Record<string, unknown>[], title: string) {
  const headers = Object.keys(rows[0]);
  const head = headers.map((h) => `<th>${HTML_ESCAPE(h)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${headers.map((h) => `<td>${HTML_ESCAPE(r[h])}</td>`).join("")}</tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${HTML_ESCAPE(title)}</title>
<style>
  body{font-family:Montserrat,"Century Gothic",system-ui,sans-serif;color:#1a1a1a;margin:24px;font-size:11px}
  h1{color:#009677;font-size:18px;border-bottom:2px solid #8DC63F;padding-bottom:6px}
  .meta{color:#5b6770;font-size:11px;margin-bottom:12px}
  table{width:100%;border-collapse:collapse}
  th{background:#009677;color:#fff;text-align:left;padding:6px 8px;font-size:10px}
  td{border-bottom:1px solid #e2e6e9;padding:5px 8px;font-size:10px;vertical-align:top}
  tbody tr:nth-child(even){background:#f7faf9}
  @page{size:A4 landscape;margin:12mm}
  @media print{th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
<h1>Old Mutual — ${HTML_ESCAPE(title)}</h1>
<p class="meta">${rows.length} record(s) · Generated ${new Date().toLocaleString("en-GB")}</p>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},300);});</script>
</body></html>`;
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error("Pop-up blocked — allow pop-ups to export PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export function ExportButton({
  rows,
  filename,
  entity,
  label = "Export",
  title,
}: {
  rows: Record<string, unknown>[];
  filename: string;
  entity: EntityKey;
  label?: string;
  /** Human-friendly title used in the PDF/Excel header. Defaults to filename. */
  title?: string;
}) {
  const { can } = useRole();
  if (!can("export", entity)) return null;

  const docTitle = title ?? filename.replace(/-/g, " ");

  const guard = (): boolean => {
    if (!rows.length) {
      toast.info("Nothing to export");
      return false;
    }
    return true;
  };

  const exportCsv = () => {
    if (!guard()) return;
    const base = filename.replace(/\.csv$/i, "");
    triggerDownload(toCsv(rows), "text/csv", `${base}.csv`);
    toast.success(`Exported ${rows.length} record(s) to CSV`);
  };

  const exportExcel = () => {
    if (!guard()) return;
    const xml = buildWorkbookXml({
      title: docTitle,
      sheets: [{ name: docTitle, rows }],
    });
    triggerDownload(xml, EXCEL_CONTENT_TYPE, excelFileName(filename));
    toast.success(`Exported ${rows.length} record(s) to Excel`);
  };

  const exportPdf = () => {
    if (!guard()) return;
    printRows(rows, docTitle);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          {label}
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Export format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportCsv}>
          <FileText className="size-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel}>
          <FileSpreadsheet className="size-4" />
          Excel (.xls)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPdf}>
          <Printer className="size-4" />
          PDF (print)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
