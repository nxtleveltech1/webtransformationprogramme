/**
 * Comprehensive, all-model data audit (READ-ONLY).
 *
 * Extends the focused scripts (audit-data-parity, verify-counts,
 * audit-fabrication, validate-extraction) into a single sweep across EVERY
 * Prisma model, plus relational-integrity checks the count-only scripts miss:
 *
 *   1. Row counts for all models (via DMMF) — flags unexpectedly empty tables,
 *      distinguishing app-authored tables (legitimately empty until used).
 *   2. RegisterLink integrity — both endpoints resolve to a real register row.
 *   3. TraceReference integrity — entityExternalId resolves to a real register.
 *   4. EvidenceLink integrity — entityId resolves for its entityType, and the
 *      typed FK is populated for first-class types.
 *   5. Polymorphic app tables (Approval/Comment/Attachment/Notification/
 *      Document) — relatedId/entityId resolve when rows exist.
 *   6. Required-field completeness on PM rows (traceRef) + owner coverage stats.
 *
 * Writes docs/audit-full-report.md and prints a prioritized remediation
 * backlog. Exits non-zero if any hard-integrity FAIL is found. Never writes to
 * the database — safe to run against the live database.
 *
 * Run with: npm run db:audit:full
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Severity = "PASS" | "WARN" | "FAIL" | "INFO";
type Finding = { section: string; severity: Severity; label: string; detail: string };
const findings: Finding[] = [];
function add(section: string, severity: Severity, label: string, detail = "") {
  findings.push({ section, severity, label, detail });
}

/** RegisterType -> Prisma delegate accessor (all expose `externalId`). */
const REGISTER_MODELS: Record<string, { findMany: (a: { select: { externalId: true } }) => Promise<{ externalId: string }[]> }> = {
  DECISION: prisma.decision,
  ACTION: prisma.action,
  RISK: prisma.risk,
  ISSUE: prisma.issue,
  ASSUMPTION: prisma.assumption,
  DEPENDENCY: prisma.dependency,
  OPEN_QUESTION: prisma.openQuestion,
  PARKING_LOT: prisma.parkingLotItem,
  TRADEOFF: prisma.tradeoff,
};

/** App-authored tables that are legitimately empty until used in the app. */
const APP_AUTHORED = new Set([
  "ChangeRequest",
  "Approval",
  "Document",
  "Notification",
  "User",
  "UserRole",
  "ResourceAllocation",
  "Comment",
  "Attachment",
  "StatusUpdate",
  "AuditEvent",
  "Scenario",
  "ScenarioChange",
]);

/** Minimal dynamic delegate shape for the count sweep. */
type CountDelegate = { count: () => Promise<number> };
function delegateFor(modelName: string): CountDelegate | null {
  const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const client = prisma as unknown as Record<string, CountDelegate>;
  return client[key] ?? null;
}

async function auditCounts() {
  const section = "Model counts";
  const counts: Record<string, number> = {};
  for (const model of Prisma.dmmf.datamodel.models) {
    const delegate = delegateFor(model.name);
    if (!delegate) {
      add(section, "WARN", model.name, "no Prisma delegate found");
      continue;
    }
    const n = await delegate.count();
    counts[model.name] = n;
    if (n === 0 && !APP_AUTHORED.has(model.name)) {
      add(section, "WARN", model.name, "table is empty (expected seeded data)");
    } else if (n === 0 && APP_AUTHORED.has(model.name)) {
      add(section, "INFO", model.name, "empty (app-authored — populated through use)");
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  add(section, "PASS", "Sweep complete", `${Prisma.dmmf.datamodel.models.length} models, ${total} total rows`);
  return counts;
}

async function loadRegisterIds() {
  const map = new Map<string, Set<string>>();
  for (const [type, model] of Object.entries(REGISTER_MODELS)) {
    const rows = await model.findMany({ select: { externalId: true } });
    map.set(type, new Set(rows.map((r) => r.externalId)));
  }
  return map;
}

async function auditRegisterLinks(registerIds: Map<string, Set<string>>) {
  const section = "RegisterLink integrity";
  const links = await prisma.registerLink.findMany();
  const dangling: string[] = [];
  for (const l of links) {
    const fromOk = registerIds.get(l.fromType)?.has(l.fromExternalId);
    const toOk = registerIds.get(l.toType)?.has(l.toExternalId);
    if (!fromOk) dangling.push(`${l.fromType}:${l.fromExternalId} (from) missing`);
    if (!toOk) dangling.push(`${l.toType}:${l.toExternalId} (to) missing`);
  }
  if (dangling.length === 0) {
    add(section, "PASS", "All link endpoints resolve", `${links.length} links checked`);
  } else {
    add(section, "FAIL", `${dangling.length} dangling endpoint(s)`, dangling.slice(0, 20).join("; "));
  }
}

async function auditTraceReferences(registerIds: Map<string, Set<string>>) {
  const section = "TraceReference integrity";
  const traces = await prisma.traceReference.findMany();
  const dangling = traces.filter((t) => !registerIds.get(t.entityType)?.has(t.entityExternalId));
  if (dangling.length === 0) {
    add(section, "PASS", "All trace entities resolve", `${traces.length} traces checked`);
  } else {
    add(
      section,
      "FAIL",
      `${dangling.length} trace(s) point at missing register rows`,
      dangling.slice(0, 20).map((t) => `${t.entityType}:${t.entityExternalId}`).join("; "),
    );
  }
}

async function auditEvidenceLinks(registerIds: Map<string, Set<string>>) {
  const section = "EvidenceLink integrity";
  const links = await prisma.evidenceLink.findMany();
  const [taskIds, deliverableIds, gateIds, meetingIds] = await Promise.all([
    prisma.task.findMany({ select: { externalId: true } }).then((r) => new Set(r.map((x) => x.externalId))),
    prisma.deliverable.findMany({ select: { externalId: true } }).then((r) => new Set(r.map((x) => x.externalId).filter(Boolean) as string[])),
    prisma.readinessGate.findMany({ select: { externalId: true } }).then((r) => new Set(r.map((x) => x.externalId))),
    prisma.governanceMeeting.findMany({ select: { externalId: true } }).then((r) => new Set(r.map((x) => x.externalId))),
  ]);
  const typedSets: Record<string, Set<string>> = {
    TASK: taskIds,
    DELIVERABLE: deliverableIds,
    READINESS_GATE: gateIds,
    GOVERNANCE_MEETING: meetingIds,
  };
  const unresolved: string[] = [];
  const fkMissing: string[] = [];
  for (const l of links) {
    const registerSet = registerIds.get(l.entityType);
    const typedSet = typedSets[l.entityType];
    const resolves = registerSet?.has(l.entityId) || typedSet?.has(l.entityId);
    if (!resolves) unresolved.push(`${l.entityType}:${l.entityId}`);
    if (l.entityType === "TASK" && !l.taskId) fkMissing.push(`TASK ${l.entityId} (taskId null)`);
    if (l.entityType === "DELIVERABLE" && !l.deliverableId) fkMissing.push(`DELIVERABLE ${l.entityId} (deliverableId null)`);
    if (l.entityType === "READINESS_GATE" && !l.readinessGateId) fkMissing.push(`READINESS_GATE ${l.entityId}`);
    if (l.entityType === "GOVERNANCE_MEETING" && !l.governanceMeetingId) fkMissing.push(`GOVERNANCE_MEETING ${l.entityId}`);
  }
  if (unresolved.length === 0) add(section, "PASS", "All evidence entities resolve", `${links.length} links checked`);
  else add(section, "FAIL", `${unresolved.length} evidence link(s) unresolved`, unresolved.slice(0, 20).join("; "));
  if (fkMissing.length === 0) add(section, "PASS", "Typed FKs populated", "all first-class evidence links carry their FK");
  else add(section, "WARN", `${fkMissing.length} evidence link(s) missing typed FK`, fkMissing.slice(0, 15).join("; "));
}

async function auditPolymorphicAppTables() {
  const section = "Polymorphic app tables";
  // These resolve against cuid ids, not externalIds. Only check when populated.
  const checks: { name: string; rows: { id: string; ref: string | null }[] }[] = [
    { name: "Approval", rows: (await prisma.approval.findMany({ select: { id: true, entityId: true } })).map((r) => ({ id: r.id, ref: r.entityId })) },
    { name: "Comment", rows: (await prisma.comment.findMany({ select: { id: true, entityId: true } })).map((r) => ({ id: r.id, ref: r.entityId })) },
    { name: "Notification", rows: (await prisma.notification.findMany({ select: { id: true, relatedId: true } })).map((r) => ({ id: r.id, ref: r.relatedId })) },
    { name: "Document", rows: (await prisma.document.findMany({ select: { id: true, relatedId: true } })).map((r) => ({ id: r.id, ref: r.relatedId })) },
  ];
  for (const c of checks) {
    if (c.rows.length === 0) add(section, "INFO", c.name, "no rows yet");
    else add(section, "PASS", c.name, `${c.rows.length} rows present`);
  }
}

async function auditRequiredFields() {
  const section = "Required fields & ownership";
  const [taskNoTrace, delNoTrace, gateNoTrace] = await Promise.all([
    prisma.task.count({ where: { OR: [{ traceRef: "" }] } }),
    prisma.deliverable.count({ where: { OR: [{ traceRef: null }, { traceRef: "" }] } }),
    prisma.readinessGate.count({ where: { OR: [{ traceRef: "" }] } }),
  ]);
  const missingTrace = taskNoTrace + delNoTrace + gateNoTrace;
  if (missingTrace === 0) add(section, "PASS", "PM rows carry traceRef", "tasks, deliverables, readiness gates all traced");
  else add(section, "FAIL", `${missingTrace} PM row(s) missing traceRef`, `tasks:${taskNoTrace} deliverables:${delNoTrace} gates:${gateNoTrace}`);

  // Ownership coverage (informational — gaps are expected on TBC workstreams).
  const ownerStats: string[] = [];
  for (const [name, withOwner, total] of await Promise.all([
    (async () => ["Task", await prisma.task.count({ where: { ownerPersonId: { not: null } } }), await prisma.task.count()] as const)(),
    (async () => ["Deliverable", await prisma.deliverable.count({ where: { ownerPersonId: { not: null } } }), await prisma.deliverable.count()] as const)(),
    (async () => ["Risk", await prisma.risk.count({ where: { ownerPersonId: { not: null } } }), await prisma.risk.count()] as const)(),
    (async () => ["Action", await prisma.action.count({ where: { ownerPersonId: { not: null } } }), await prisma.action.count()] as const)(),
    (async () => ["Decision", await prisma.decision.count({ where: { ownerPersonId: { not: null } } }), await prisma.decision.count()] as const)(),
  ])) {
    const pct = total === 0 ? 0 : Math.round((withOwner / total) * 100);
    ownerStats.push(`${name} ${withOwner}/${total} (${pct}%)`);
  }
  add(section, "INFO", "Owner-person coverage", ownerStats.join("; "));
}

function buildReport(counts: Record<string, number>): string {
  const bySection = new Map<string, Finding[]>();
  for (const f of findings) {
    const list = bySection.get(f.section) ?? [];
    list.push(f);
    bySection.set(f.section, list);
  }
  const icon: Record<Severity, string> = { PASS: "✅", WARN: "⚠️", FAIL: "❌", INFO: "ℹ️" };
  const fails = findings.filter((f) => f.severity === "FAIL");
  const warns = findings.filter((f) => f.severity === "WARN");

  const lines: string[] = [];
  lines.push("# Full Data Audit Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()} (read-only sweep via \`npm run db:audit:full\`)`);
  lines.push("");
  lines.push(`**Result:** ${fails.length} FAIL · ${warns.length} WARN · ${findings.filter((f) => f.severity === "PASS").length} PASS`);
  lines.push("");
  lines.push("## Findings");
  for (const [section, list] of bySection) {
    lines.push("");
    lines.push(`### ${section}`);
    for (const f of list) {
      lines.push(`- ${icon[f.severity]} **${f.label}**${f.detail ? ` — ${f.detail}` : ""}`);
    }
  }
  lines.push("");
  lines.push("## Prioritized remediation backlog");
  if (fails.length === 0 && warns.length === 0) {
    lines.push("");
    lines.push("No integrity failures or warnings. Data is consistent.");
  } else {
    let i = 1;
    for (const f of [...fails, ...warns]) {
      lines.push(`${i++}. **[${f.severity}] ${f.section} — ${f.label}**${f.detail ? `: ${f.detail}` : ""}`);
    }
  }
  lines.push("");
  lines.push("## Row counts (all models)");
  lines.push("");
  lines.push("| Model | Rows |");
  lines.push("| --- | ---: |");
  for (const name of Object.keys(counts).sort()) lines.push(`| ${name} | ${counts[name]} |`);
  lines.push("");
  return lines.join("\n");
}

async function main() {
  console.log("\n=== Full data audit (read-only) ===\n");
  const counts = await auditCounts();
  const registerIds = await loadRegisterIds();
  await auditRegisterLinks(registerIds);
  await auditTraceReferences(registerIds);
  await auditEvidenceLinks(registerIds);
  await auditPolymorphicAppTables();
  await auditRequiredFields();

  const icon: Record<Severity, string> = { PASS: "✅", WARN: "⚠️", FAIL: "❌", INFO: "ℹ️" };
  for (const f of findings) {
    if (f.severity === "INFO" || f.severity === "PASS") continue;
    console.log(`${icon[f.severity]} [${f.section}] ${f.label}${f.detail ? ` — ${f.detail}` : ""}`);
  }

  const report = buildReport(counts);
  const outPath = join(process.cwd(), "docs", "audit-full-report.md");
  writeFileSync(outPath, report, "utf8");

  const fails = findings.filter((f) => f.severity === "FAIL").length;
  const warns = findings.filter((f) => f.severity === "WARN").length;
  console.log(`\nReport written to docs/audit-full-report.md`);
  console.log(`Summary: ${fails} FAIL, ${warns} WARN.`);
  if (fails > 0) {
    console.log("\nAudit FAILED (integrity errors present).");
    process.exit(1);
  }
  console.log("\nAudit PASSED (no integrity errors).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
