/**
 * Branded "Steering Pack" PDF.
 *
 * NOTE ON IMPLEMENTATION: neither `@react-pdf/renderer` nor `pdfkit` could be
 * installed in this environment (npm install is blocked). Per the agent brief's
 * documented fallback, the PDF is produced as a **print-optimised HTML route**:
 * a self-contained, Old-Mutual-branded HTML document (Heritage green #009677,
 * Montserrat) with `@media print`/`@page` rules. The route auto-triggers the
 * browser's print dialog, so the user picks "Save as PDF" — yielding a true,
 * vector, multi-page branded PDF without a server-side PDF binary.
 *
 * The whole document is built from data the existing services already return.
 */

import {
  cellText,
  columnLabel,
  sheetColumns,
  toExportRows,
  type ExportSheet,
} from "./types";
import {
  execSummaryText,
  type SteeringPackData,
} from "./steering-pack";

const BRAND_HERITAGE = "#009677";
const BRAND_FRESH = "#50B848";
const BRAND_FUTURE = "#8DC63F";

function esc(value: unknown): string {
  return cellText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ragColour(rag: string | null | undefined): string {
  switch ((rag ?? "").toUpperCase()) {
    case "RED":
      return "#d4351c";
    case "AMBER":
      return "#e6a700";
    case "GREEN":
      return BRAND_FRESH;
    default:
      return "#6b7280";
  }
}

function metricCard(label: string, value: string | number, tone?: string): string {
  const accent = tone ?? BRAND_HERITAGE;
  return `
    <div class="metric">
      <span class="metric-label">${esc(label)}</span>
      <span class="metric-value" style="color:${accent}">${esc(value)}</span>
    </div>`;
}

function table(sheet: ExportSheet, opts?: { limit?: number }): string {
  const columns = sheetColumns(sheet);
  if (!columns.length || !sheet.rows.length) {
    return `<p class="empty">No data.</p>`;
  }
  const rows = opts?.limit ? sheet.rows.slice(0, opts.limit) : sheet.rows;
  const head = columns.map((c) => `<th>${esc(columnLabel(sheet, c))}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td>${esc(r[c])}</td>`).join("")}</tr>`,
    )
    .join("");
  const more =
    opts?.limit && sheet.rows.length > opts.limit
      ? `<p class="more">+ ${sheet.rows.length - opts.limit} more — see the full Excel export.</p>`
      : "";
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${more}`;
}

/** Build the complete print-optimised HTML document for the Steering Pack. */
export function buildSteeringPackHtml(
  data: SteeringPackData,
  options: { autoPrint?: boolean } = {},
): string {
  const { dashboard, reports } = data;
  const m = dashboard.metrics;
  const generated = new Date(data.generatedAt).toLocaleString("en-GB");
  const programme = dashboard.programme;
  const exec = execSummaryText(reports);
  const autoPrint = options.autoPrint ?? false;

  const summarySheet = reports.controlSummary;

  const topRisksTable = table(
    {
      name: "Top Risks",
      columns: ["externalId", "description", "category", "score", "status", "owner"],
      headers: {
        externalId: "Ref", description: "Risk", category: "Category",
        score: "Score", status: "Status", owner: "Owner",
      },
      rows: toExportRows(dashboard.topRisks),
    },
    { limit: 8 },
  );

  const raidRows = [
    ...reports.risks.map((r) => ({ type: "Risk", ref: r.externalId, summary: r.description, status: r.status, owner: r.owner })),
    ...reports.issues.map((i) => ({ type: "Issue", ref: i.externalId, summary: i.description, status: i.status, owner: i.owner })),
    ...reports.dependencies.map((d) => ({ type: "Dependency", ref: d.externalId, summary: d.description, status: d.status, owner: d.receivingTeam })),
    ...reports.decisions.map((d) => ({ type: "Decision", ref: d.externalId, summary: d.title, status: d.status, owner: d.owner })),
    ...reports.assumptions.map((a) => ({ type: "Assumption", ref: a.externalId, summary: a.description, status: "—", owner: a.validator })),
  ];
  const raidCounts: Record<string, number> = {};
  for (const r of raidRows) raidCounts[r.type] = (raidCounts[r.type] ?? 0) + 1;

  const milestoneTable = table(
    {
      name: "Milestones",
      columns: ["title", "targetDate", "status", "varianceDays", "workstream"],
      headers: {
        title: "Milestone", targetDate: "Target", status: "Status",
        varianceDays: "Variance (days)", workstream: "Workstream",
      },
      rows: toExportRows(reports.milestones),
    },
    { limit: 15 },
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Old Mutual — Steering Pack</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --heritage: ${BRAND_HERITAGE};
    --fresh: ${BRAND_FRESH};
    --future: ${BRAND_FUTURE};
    --ink: #1a1a1a;
    --muted: #5b6770;
    --line: #e2e6e9;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "Montserrat", "Century Gothic", system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: #f4f6f7;
    font-size: 12px;
    line-height: 1.45;
  }
  .page {
    max-width: 920px;
    margin: 0 auto;
    background: #fff;
    padding: 32px 40px 48px;
  }
  .toolbar {
    max-width: 920px;
    margin: 16px auto 0;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .toolbar button {
    font-family: inherit;
    font-weight: 600;
    font-size: 13px;
    border: 0;
    border-radius: 8px;
    padding: 9px 16px;
    cursor: pointer;
    color: #fff;
    background: var(--heritage);
  }
  .toolbar button.secondary { background: #fff; color: var(--heritage); border: 1px solid var(--heritage); }
  header.brand {
    background: linear-gradient(135deg, var(--heritage), var(--future));
    color: #fff;
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 24px;
  }
  header.brand .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 11px; font-weight: 600; opacity: .9; }
  header.brand h1 { margin: 6px 0 4px; font-size: 26px; font-weight: 700; }
  header.brand .meta { font-size: 12px; opacity: .92; }
  .rag-pill {
    display: inline-block; margin-left: 10px; padding: 2px 10px; border-radius: 999px;
    background: rgba(255,255,255,.18); font-weight: 600; font-size: 11px; vertical-align: middle;
  }
  h2.section {
    font-size: 15px; font-weight: 700; color: var(--heritage);
    border-bottom: 2px solid var(--future); padding-bottom: 4px; margin: 26px 0 12px;
  }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .metric { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; }
  .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); font-weight: 600; }
  .metric-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: var(--heritage); color: #fff; text-align: left; font-weight: 600; font-size: 10.5px; padding: 6px 8px; }
  td { border-bottom: 1px solid var(--line); padding: 5px 8px; font-size: 10.5px; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f7faf9; }
  .empty, .more { color: var(--muted); font-style: italic; font-size: 11px; margin: 6px 0 0; }
  .summary-text { white-space: pre-wrap; font-size: 11.5px; color: #2b3338; max-height: 260px; overflow: hidden; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 600; }
  .chip span { color: var(--heritage); }
  footer.pack-footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; display: flex; justify-content: space-between; }
  @page { size: A4; margin: 14mm 12mm; }
  @media print {
    body { background: #fff; font-size: 10.5px; }
    .toolbar { display: none !important; }
    .page { max-width: none; margin: 0; padding: 0; }
    header.brand { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h2.section { break-after: avoid; }
    table { break-inside: auto; }
    tr { break-inside: avoid; }
    .metrics { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Download / Print PDF</button>
    <button class="secondary" onclick="window.close()">Close</button>
  </div>
  <div class="page">
    <header class="brand">
      <div class="eyebrow">Old Mutual · Programme Control</div>
      <h1>Steering Committee Pack</h1>
      <div class="meta">
        ${esc(programme?.name ?? "Programme")}
        ${programme?.rag ? `<span class="rag-pill" style="background:${ragColour(programme.rag)}">${esc(programme.rag)} RAG</span>` : ""}
        &middot; Generated ${esc(generated)}
      </div>
    </header>

    <h2 class="section">Executive summary</h2>
    ${
      exec
        ? `<p class="meta" style="color:var(--muted);margin:0 0 6px">${esc(exec.day)}${exec.version ? ` · v${esc(exec.version)}` : ""}</p>
           <div class="summary-text">${esc(exec.body)}</div>`
        : `<p class="empty">No executive summary has been published.</p>`
    }

    <h2 class="section">Programme health</h2>
    <div class="metrics">
      ${metricCard("Active projects", m.activeProjects)}
      ${metricCard("Workstreams", m.workstreams)}
      ${metricCard("Open risks", m.openRisks, "#d4351c")}
      ${metricCard("Open issues", m.openIssues, "#e6a700")}
      ${metricCard("Pending approvals", m.pendingApprovals)}
      ${metricCard("Upcoming milestones", m.upcomingMilestones)}
      ${metricCard("Blocked dependencies", m.blockedDependencies, "#d4351c")}
      ${metricCard("Readiness", `${m.readinessScore}%`)}
      ${metricCard("Deliverables", summarySheet.deliverables)}
      ${metricCard("Critical path", summarySheet.criticalPathTasks)}
      ${metricCard("Governance events", summarySheet.governanceMeetings)}
      ${metricCard("Milestones complete", `${dashboard.milestonePercentComplete}%`, BRAND_FRESH)}
    </div>

    <h2 class="section">Top risks</h2>
    ${topRisksTable}

    <h2 class="section">RAID summary</h2>
    <div class="chips">
      ${
        Object.keys(raidCounts).length
          ? Object.entries(raidCounts)
              .map(([k, v]) => `<div class="chip">${esc(k)}: <span>${esc(v)}</span></div>`)
              .join("")
          : `<p class="empty">No RAID items.</p>`
      }
    </div>

    <h2 class="section">Milestone delivery</h2>
    ${milestoneTable}

    <footer class="pack-footer">
      <span>Old Mutual — Programme Control Platform</span>
      <span>Confidential · Steering Committee</span>
    </footer>
  </div>
  ${
    autoPrint
      ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},350);});</script>`
      : ""
  }
</body>
</html>`;
}
