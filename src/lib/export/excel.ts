/**
 * Multi-sheet Excel export.
 *
 * NOTE ON IMPLEMENTATION: `exceljs` could not be installed in this environment
 * (npm install is blocked), so — per the agent brief's documented fallback —
 * the workbook is produced as a SpreadsheetML 2003 XML workbook. This is a
 * native, dependency-free Excel format: a single XML string with one
 * <Worksheet> per dataset that Excel (and LibreOffice / Google Sheets) opens
 * directly as a multi-tab workbook. The file is served with an .xls extension
 * and the Excel MIME type.
 *
 * If `exceljs` becomes installable, swap `buildWorkbookXml` for an exceljs
 * implementation behind the same `ExportWorkbook` contract — callers do not
 * change.
 */

import {
  cellText,
  columnLabel,
  sheetColumns,
  type ExportSheet,
  type ExportWorkbook,
} from "./types";

export const EXCEL_CONTENT_TYPE = "application/vnd.ms-excel";

// Control characters illegal in SpreadsheetML (U+0000–U+001F) except
// tab (U+0009), newline (U+000A) and carriage return (U+000D). Built via
// RegExp so the source file contains only printable ASCII.
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]",
  "g",
);

/** Escape a value for XML text/attribute content. */
function xmlEscape(value: string): string {
  return value
    .replace(CONTROL_CHARS, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Excel worksheet names: max 31 chars, no : \ / ? * [ ] and must be unique. */
function sanitiseSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = base;
  let i = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` ${i++}`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/** Is the value a finite number we should write as a numeric cell? */
function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function buildCell(value: unknown, styleId?: string): string {
  const num = asNumber(value);
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  if (num !== null) {
    return `<Cell${style}><Data ss:Type="Number">${num}</Data></Cell>`;
  }
  return `<Cell${style}><Data ss:Type="String">${xmlEscape(cellText(value))}</Data></Cell>`;
}

function buildWorksheet(sheet: ExportSheet, name: string): string {
  const columns = sheetColumns(sheet);

  if (!columns.length) {
    return [
      `<Worksheet ss:Name="${xmlEscape(name)}">`,
      "<Table>",
      `<Row><Cell ss:StyleID="muted"><Data ss:Type="String">No data</Data></Cell></Row>`,
      "</Table>",
      "</Worksheet>",
    ].join("");
  }

  const headerRow = `<Row>${columns
    .map(
      (c) =>
        `<Cell ss:StyleID="header"><Data ss:Type="String">${xmlEscape(
          columnLabel(sheet, c),
        )}</Data></Cell>`,
    )
    .join("")}</Row>`;

  const bodyRows = sheet.rows
    .map((row) => `<Row>${columns.map((c) => buildCell(row[c])).join("")}</Row>`)
    .join("");

  return [
    `<Worksheet ss:Name="${xmlEscape(name)}">`,
    `<Table>`,
    headerRow,
    bodyRows,
    "</Table>",
    "</Worksheet>",
  ].join("");
}

/** Build the full SpreadsheetML 2003 XML for a multi-sheet workbook. */
export function buildWorkbookXml(workbook: ExportWorkbook): string {
  const usedNames = new Set<string>();
  const worksheets = workbook.sheets
    .map((sheet) => buildWorksheet(sheet, sanitiseSheetName(sheet.name, usedNames)))
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    `<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">`,
    `<Title>${xmlEscape(workbook.title)}</Title>`,
    `<Company>Old Mutual</Company>`,
    `</DocumentProperties>`,
    "<Styles>",
    // Old Mutual Heritage green header band.
    '<Style ss:ID="header">',
    '<Font ss:Bold="1" ss:Color="#FFFFFF" ss:FontName="Montserrat" ss:Size="11"/>',
    '<Interior ss:Color="#009677" ss:Pattern="Solid"/>',
    '<Alignment ss:Vertical="Center"/>',
    "</Style>",
    '<Style ss:ID="muted">',
    '<Font ss:Color="#6B7280" ss:Italic="1"/>',
    "</Style>",
    "</Styles>",
    worksheets,
    "</Workbook>",
  ].join("");
}

/** Suggest a safe Excel filename. */
export function excelFileName(base: string): string {
  const cleaned = base.replace(/\.(xls|xlsx)$/i, "").replace(/[^\w.-]+/g, "-");
  return `${cleaned}.xls`;
}
