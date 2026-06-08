/**
 * Shared types for the EXPORTS suite (Advanced feature A).
 *
 * The exports here render only data returned by EXISTING services
 * (`@/lib/services/reports`, `@/lib/services/dashboard`). No values are
 * fabricated — missing values are rendered as an explicit em dash.
 */

export const EXPORT_DASH = "—";

export type ExportFormat = "csv" | "excel" | "pdf";

/** A single tabular sheet: a title, ordered column keys, and flat rows. */
export interface ExportSheet {
  /** Sheet/section name (sanitised for Excel tab names where needed). */
  name: string;
  /** Column order. If omitted, derived from the first row's keys. */
  columns?: string[];
  /** Optional human-friendly header labels keyed by column key. */
  headers?: Record<string, string>;
  rows: Record<string, unknown>[];
}

/** A whole workbook (Excel) or document (PDF) made of multiple sheets. */
export interface ExportWorkbook {
  /** Workbook title, used in PDF heading and file metadata. */
  title: string;
  /** Optional subtitle / generated-at line. */
  subtitle?: string;
  sheets: ExportSheet[];
}

/**
 * Widen typed, flat report rows (interfaces without an index signature) to the
 * generic export row shape. These rows are already CSV-/cell-safe; this mirrors
 * the `exportRows` cast used by the reports UI.
 */
export function toExportRows<T extends object>(rows: readonly T[]): Record<string, unknown>[] {
  return rows as unknown as Record<string, unknown>[];
}

/** Render a cell value for export, never fabricating missing data. */
export function cellText(value: unknown): string {
  if (value === null || value === undefined || value === "") return EXPORT_DASH;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Resolve the ordered column keys for a sheet. */
export function sheetColumns(sheet: ExportSheet): string[] {
  if (sheet.columns && sheet.columns.length) return sheet.columns;
  return sheet.rows.length ? Object.keys(sheet.rows[0]) : [];
}

/** Resolve a display label for a column key. */
export function columnLabel(sheet: ExportSheet, key: string): string {
  return sheet.headers?.[key] ?? key;
}
