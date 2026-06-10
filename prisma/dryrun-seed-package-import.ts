/**
 * Dry-run diff for the Programme Control Production Hardened Seed Package.
 *
 * READ-ONLY. This script NEVER mutates the database. It only uses Prisma
 * `findMany` reads. It parses the package payload (01_LOAD…/jsonl/*.jsonl),
 * compares every row against the live DB, classifies each row, flags likely
 * fabrication, and writes a human report + machine-readable per-row file to
 * docs/seed-package-dryrun/.
 *
 * It exists because the package (a) reuses the platform's own externalId
 * prefixes (RSK-/ACT-/DEC-/DEP-/ISS-) so a naive load would overwrite real
 * workshop records, and (b) is heavily templated, so most rows would fabricate
 * data. See docs/seed-package-dryrun/REPORT.md after running.
 *
 * Run with: npm run db:dryrun:seed-package
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { resolveCanonical } from "./seed/people-canonical";
import { REGISTER_SEQUENCES } from "./seed/utils";

const prisma = new PrismaClient();

const ROOT = path.resolve(__dirname, "..");
const PKG = path.join(ROOT, ".dev", "Programme_Control_Production_Hardened_Seed_Package");
const PAYLOAD_DIR = path.join(PKG, "01_LOAD_TO_PLATFORM_PROGRAMME_DATA", "jsonl");
const MANIFEST = path.join(PKG, "MANIFEST_DO_NOT_UPLOAD_AS_PROGRAMME_DATA.json");
const OUT_DIR = path.join(ROOT, "docs", "seed-package-dryrun");

// ── Classification labels ────────────────────────────────────────────────────
type Label =
  | "CONFLICT_OVERWRITE" // payloadId equals a live record's externalId in the target model
  | "UPDATE_CANDIDATE" // fuzzy title/description match to a live record
  | "CREATE_NEW" // no match in live DB
  | "NO_TARGET_MODEL"; // entity has no platform model

type RowResult = {
  entity: string;
  payloadId: string;
  name: string;
  label: Label;
  matchedLiveExternalId: string | null;
  matchedLiveLabel: string | null; // human title of the matched live record
  matchScore: number; // 0..1
  fabricationFlags: string[];
};

// ── Text helpers ─────────────────────────────────────────────────────────────
function normTokens(s: string | null | undefined): Set<string> {
  if (!s) return new Set();
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

const FUZZY_THRESHOLD = 0.6;

// Signature phrases that betray template generation (case-insensitive substrings).
const BOILERPLATE_PHRASES = [
  "treat this as active when the trigger is reached",
  "the mitigation must be owned by",
  "the contingency should be activated if the trigger occurs",
  "this action requires the owner to complete",
  "should result in an approved design, information architecture, or template artefact",
  "marks a governance or delivery checkpoint",
  "the milestone should not be treated as complete until evidence",
  "reviewed at each workstream checkpoint until the trigger condition is closed",
  "and may compromise",
  "proceed with confirmation through the named governance forum",
];

function boilerplateHit(row: Record<string, unknown>): boolean {
  const blob = JSON.stringify(row).toLowerCase();
  return BOILERPLATE_PHRASES.some((p) => blob.includes(p));
}

const PLACEHOLDERS = new Set(["", "to be confirmed", "unknown", "tbc", "n/a", "-", "none"]);

/** A "supporting/owner" field that holds long narrative text instead of a name. */
function ownerNotAPerson(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (PLACEHOLDERS.has(v.toLowerCase())) return false;
  // If it resolves to a canonical person, it's fine.
  if (resolveCanonical(v)) return false;
  // Multi-clause / long strings in an owner slot are narrative, not a name.
  return v.length > 40 || /[.;]/.test(v);
}

// Live register high-water marks, by prefix (e.g. RSK -> 32).
const LIVE_MAX_BY_PREFIX = new Map<string, number>();
for (const seq of REGISTER_SEQUENCES) {
  const m = seq.highestUsed.match(/(\d+)\s*$/);
  if (m) LIVE_MAX_BY_PREFIX.set(seq.prefix.toUpperCase(), parseInt(m[1], 10));
}

function idNumber(id: string): number | null {
  const m = id.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : null;
}

// ── Payload loading ──────────────────────────────────────────────────────────
function readJsonl(file: string): Record<string, unknown>[] {
  const full = path.join(PAYLOAD_DIR, file);
  const text = fs.readFileSync(full, "utf-8");
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map((l, i) => {
      try {
        return JSON.parse(l) as Record<string, unknown>;
      } catch (e) {
        throw new Error(`Failed to parse ${file} line ${i + 1}: ${(e as Error).message}`);
      }
    });
}

function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return v == null ? "" : String(v);
}

// A live record reduced to the fields the diff needs.
type LiveRec = { externalId: string | null; label: string; tokens: Set<string> };

// ── Entity configuration ─────────────────────────────────────────────────────
type EntityConfig = {
  entity: string;
  file: string;
  idField: string;
  nameField: string; // payload field used for the human label + fuzzy match
  /** load live records for the target model, or null if no target model */
  loadLive: (() => Promise<LiveRec[]>) | null;
  /** prefix to compare against LIVE_MAX_BY_PREFIX for the id-beyond-range flag */
  rangePrefix: string | null;
  /** owner-ish fields to scan for narrative-in-owner-slot */
  ownerFields: string[];
  targetModelNote: string;
};

const CONFIGS: EntityConfig[] = [
  {
    entity: "programme_activities",
    file: "programme_activities.jsonl",
    idField: "activity_id",
    nameField: "activity_name",
    rangePrefix: "ACT",
    ownerFields: ["owner", "accountable_lead", "supporting_teams"],
    targetModelNote: "Task (WBS)",
    loadLive: async () =>
      (await prisma.task.findMany({ select: { externalId: true, title: true } })).map((t) => ({
        externalId: t.externalId,
        label: t.title,
        tokens: normTokens(t.title),
      })),
  },
  {
    entity: "deliverables",
    file: "deliverables.jsonl",
    idField: "deliverable_id",
    nameField: "deliverable_name",
    rangePrefix: null,
    ownerFields: ["deliverable_owner", "accountable_lead"],
    targetModelNote: "Deliverable",
    loadLive: async () =>
      (await prisma.deliverable.findMany({ select: { externalId: true, name: true } })).map((d) => ({
        externalId: d.externalId,
        label: d.name,
        tokens: normTokens(d.name),
      })),
  },
  {
    entity: "milestones",
    file: "milestones.jsonl",
    idField: "milestone_id",
    nameField: "milestone_name",
    rangePrefix: null,
    ownerFields: [],
    targetModelNote: "Milestone (no externalId on model — title match only)",
    loadLive: async () =>
      (await prisma.milestone.findMany({ select: { title: true } })).map((m) => ({
        externalId: null,
        label: m.title,
        tokens: normTokens(m.title),
      })),
  },
  {
    entity: "actions",
    file: "actions.jsonl",
    idField: "action_id",
    nameField: "action_description",
    rangePrefix: null, // payload uses A-### (live uses ACT-###) — no clean range compare
    ownerFields: ["owner", "supporting_owner"],
    targetModelNote: "Action (payload A-### vs live ACT-###)",
    loadLive: async () =>
      (await prisma.action.findMany({ select: { externalId: true, description: true } })).map(
        (a) => ({
          externalId: a.externalId,
          label: a.description.slice(0, 80),
          tokens: normTokens(a.description),
        }),
      ),
  },
  {
    entity: "dependencies",
    file: "dependencies.jsonl",
    idField: "dependency_id",
    nameField: "dependency_description",
    rangePrefix: "DEP",
    ownerFields: ["upstream_owner", "downstream_owner"],
    targetModelNote: "Dependency",
    loadLive: async () =>
      (await prisma.dependency.findMany({ select: { externalId: true, description: true } })).map(
        (d) => ({
          externalId: d.externalId,
          label: d.description.slice(0, 80),
          tokens: normTokens(d.description),
        }),
      ),
  },
  {
    entity: "risks",
    file: "risks.jsonl",
    idField: "risk_id",
    nameField: "risk_title",
    rangePrefix: "RSK",
    ownerFields: ["risk_owner"],
    targetModelNote: "Risk",
    loadLive: async () =>
      (await prisma.risk.findMany({ select: { externalId: true, description: true } })).map((r) => ({
        externalId: r.externalId,
        label: r.description.slice(0, 80),
        tokens: normTokens(r.description),
      })),
  },
  {
    entity: "issues",
    file: "issues.jsonl",
    idField: "issue_id",
    nameField: "issue_title",
    rangePrefix: "ISS",
    ownerFields: ["owner"],
    targetModelNote: "Issue",
    loadLive: async () =>
      (await prisma.issue.findMany({ select: { externalId: true, description: true } })).map((i) => ({
        externalId: i.externalId,
        label: i.description.slice(0, 80),
        tokens: normTokens(i.description),
      })),
  },
  {
    entity: "constraints",
    file: "constraints.jsonl",
    idField: "constraint_id",
    nameField: "constraint_description",
    rangePrefix: null,
    ownerFields: ["owner"],
    targetModelNote: "NONE — no programme-constraint register model exists",
    loadLive: null,
  },
  {
    entity: "decisions",
    file: "decisions.jsonl",
    idField: "decision_id",
    nameField: "decision_required",
    rangePrefix: "DEC",
    ownerFields: ["decision_owner"],
    targetModelNote: "Decision",
    loadLive: async () =>
      (await prisma.decision.findMany({ select: { externalId: true, title: true, description: true } })).map(
        (d) => ({
          externalId: d.externalId,
          label: d.title ?? d.description.slice(0, 80),
          tokens: normTokens(`${d.title ?? ""} ${d.description}`),
        }),
      ),
  },
  {
    entity: "timeline",
    file: "timeline.jsonl",
    idField: "activity_id",
    nameField: "activity",
    rangePrefix: "ACT",
    ownerFields: ["owner"],
    targetModelNote: "Task schedule (merges into programme_activities by activity_id)",
    loadLive: async () =>
      (await prisma.task.findMany({ select: { externalId: true, title: true } })).map((t) => ({
        externalId: t.externalId,
        label: t.title,
        tokens: normTokens(t.title),
      })),
  },
  {
    entity: "governance_summary",
    file: "governance_summary.jsonl",
    idField: "workstream",
    nameField: "workstream",
    rangePrefix: null,
    ownerFields: [],
    targetModelNote: "Workstream (rag / oneLineStatus)",
    loadLive: async () =>
      (await prisma.workstream.findMany({ select: { code: true, name: true } })).map((w) => ({
        externalId: w.code,
        label: w.name,
        tokens: normTokens(w.name),
      })),
  },
  {
    entity: "workstream_status",
    file: "workstream_status.jsonl",
    idField: "workstream",
    nameField: "workstream",
    rangePrefix: null,
    ownerFields: [],
    targetModelNote: "NONE — derived stats, report-only",
    loadLive: null,
  },
];

// ── Core classification ──────────────────────────────────────────────────────
async function classifyEntity(
  cfg: EntityConfig,
  rows: Record<string, unknown>[],
): Promise<RowResult[]> {
  const live = cfg.loadLive ? await cfg.loadLive() : [];
  const liveByExt = new Map<string, LiveRec>();
  for (const r of live) if (r.externalId) liveByExt.set(r.externalId.toUpperCase(), r);

  const results: RowResult[] = [];
  for (const row of rows) {
    const payloadId = str(row, cfg.idField).trim();
    const name = str(row, cfg.nameField).trim();
    const flags: string[] = [];

    // Fabrication flags (independent of label)
    if (boilerplateHit(row)) flags.push("boilerplate-phrase");
    if (cfg.ownerFields.some((f) => ownerNotAPerson(row[f]))) flags.push("owner-not-a-person");
    if (cfg.rangePrefix) {
      const max = LIVE_MAX_BY_PREFIX.get(cfg.rangePrefix);
      const n = idNumber(payloadId);
      if (max != null && n != null && n > max) flags.push("id-beyond-live-range");
    }

    let label: Label;
    let matchedExt: string | null = null;
    let matchedLabel: string | null = null;
    let score = 0;

    if (!cfg.loadLive) {
      label = "NO_TARGET_MODEL";
    } else {
      const collision = liveByExt.get(payloadId.toUpperCase());
      if (collision) {
        label = "CONFLICT_OVERWRITE";
        matchedExt = collision.externalId;
        matchedLabel = collision.label;
        score = 1;
      } else {
        // best fuzzy match on name/description tokens
        const ptokens = normTokens(name);
        let best: LiveRec | null = null;
        let bestScore = 0;
        for (const r of live) {
          const s = jaccard(ptokens, r.tokens);
          if (s > bestScore) {
            bestScore = s;
            best = r;
          }
        }
        if (best && bestScore >= FUZZY_THRESHOLD) {
          label = "UPDATE_CANDIDATE";
          matchedExt = best.externalId;
          matchedLabel = best.label;
          score = Number(bestScore.toFixed(3));
        } else {
          label = "CREATE_NEW";
          score = Number(bestScore.toFixed(3));
        }
      }
    }

    results.push({
      entity: cfg.entity,
      payloadId,
      name: name.slice(0, 120),
      label,
      matchedLiveExternalId: matchedExt,
      matchedLiveLabel: matchedLabel,
      matchScore: score,
      fabricationFlags: flags,
    });
  }
  return results;
}

// ── Report rendering ─────────────────────────────────────────────────────────
function pct(n: number, total: number): string {
  return total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf-8")) as {
    package_name: string;
    payload_counts: Record<string, number>;
    files: { path: string; sha256: string }[];
  };
  const payloadSha =
    manifest.files.find((f) =>
      f.path.endsWith("Programme_Control_Production_Seed_Data_ONLY.xlsx"),
    )?.sha256 ?? "(unknown)";

  const countChecks: string[] = [];
  let countsOk = true;

  const allResults: RowResult[] = [];
  const perEntity: { cfg: EntityConfig; rows: RowResult[]; total: number }[] = [];

  for (const cfg of CONFIGS) {
    const rows = readJsonl(cfg.file);
    const expected = manifest.payload_counts[cfg.entity];
    const ok = expected == null || expected === rows.length;
    if (!ok) countsOk = false;
    countChecks.push(
      `${ok ? "✓" : "✗"} ${cfg.entity}: parsed ${rows.length}` +
        (expected == null ? " (no manifest count)" : ` / manifest ${expected}`),
    );

    const results = await classifyEntity(cfg, rows);
    allResults.push(...results);
    perEntity.push({ cfg, rows: results, total: rows.length });
  }

  // rows.jsonl
  const rowsOut = allResults
    .map((r) =>
      JSON.stringify({
        entity: r.entity,
        payloadId: r.payloadId,
        label: r.label,
        matchedLiveExternalId: r.matchedLiveExternalId,
        matchScore: r.matchScore,
        fabricationFlags: r.fabricationFlags,
      }),
    )
    .join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "rows.jsonl"), rowsOut + "\n", "utf-8");

  // REPORT.md
  const L: string[] = [];
  L.push(`# Seed Package Dry-Run Report (READ-ONLY)`);
  L.push("");
  L.push(`**Package:** ${manifest.package_name}`);
  L.push(`**Payload xlsx sha256:** \`${payloadSha}\``);
  L.push(`**Run:** ${new Date().toISOString()}`);
  L.push(`**Total payload rows analysed:** ${allResults.length}`);
  L.push("");
  L.push(
    `> **NO DATABASE WRITES WERE PERFORMED.** This script only reads the live DB and the package payload. It does not create, update, or delete any record.`,
  );
  L.push("");

  L.push(`## 1. Manifest count verification — ${countsOk ? "PASS ✓" : "FAILED ✗"}`);
  L.push("");
  for (const c of countChecks) L.push(`- ${c}`);
  L.push("");

  // Per-entity table
  L.push(`## 2. Per-entity classification`);
  L.push("");
  L.push(
    `| Entity | Target model | Rows | OVERWRITE | UPDATE? | CREATE | NO_TARGET | fabrication-flagged |`,
  );
  L.push(`|---|---|--:|--:|--:|--:|--:|--:|`);
  for (const pe of perEntity) {
    const c = (lbl: Label) => pe.rows.filter((r) => r.label === lbl).length;
    const fab = pe.rows.filter((r) => r.fabricationFlags.length > 0).length;
    L.push(
      `| ${pe.cfg.entity} | ${pe.cfg.targetModelNote} | ${pe.total} | ` +
        `${c("CONFLICT_OVERWRITE")} | ${c("UPDATE_CANDIDATE")} | ${c("CREATE_NEW")} | ` +
        `${c("NO_TARGET_MODEL")} | ${fab} (${pct(fab, pe.total)}) |`,
    );
  }
  L.push("");

  // Danger section
  const overwrites = allResults.filter((r) => r.label === "CONFLICT_OVERWRITE");
  L.push(`## 3. ⛔ DANGER — would overwrite ${overwrites.length} live records`);
  L.push("");
  if (overwrites.length === 0) {
    L.push(`No payload id collides with an existing live externalId in its target model.`);
  } else {
    L.push(
      `These payload rows share an externalId with a **real, existing** live record in the target model. A load that upserts by externalId would replace live content with the package's templated content.`,
    );
    L.push("");
    L.push(`| Entity | Payload id | → Live externalId | Live record |`);
    L.push(`|---|---|---|---|`);
    for (const r of overwrites) {
      L.push(
        `| ${r.entity} | ${r.payloadId} | ${r.matchedLiveExternalId} | ${(r.matchedLiveLabel ?? "").replace(/\|/g, "/").slice(0, 90)} |`,
      );
    }
  }
  L.push("");

  // Fabrication summary
  const fabFlagCounts = new Map<string, number>();
  for (const r of allResults)
    for (const f of r.fabricationFlags) fabFlagCounts.set(f, (fabFlagCounts.get(f) ?? 0) + 1);
  const fabRows = allResults.filter((r) => r.fabricationFlags.length > 0).length;
  L.push(`## 4. Fabrication signals`);
  L.push("");
  L.push(`**${fabRows} of ${allResults.length} rows (${pct(fabRows, allResults.length)}) carry at least one fabrication flag.**`);
  L.push("");
  for (const [flag, n] of [...fabFlagCounts.entries()].sort((a, b) => b[1] - a[1])) {
    L.push(`- \`${flag}\`: ${n} rows`);
  }
  L.push("");
  L.push(`### Examples`);
  L.push("");
  const examples = allResults.filter((r) => r.fabricationFlags.length > 0).slice(0, 12);
  for (const r of examples) {
    L.push(`- **${r.entity} ${r.payloadId}** [${r.fabricationFlags.join(", ")}] — ${r.name}`);
  }
  L.push("");

  // Recommendation
  L.push(`## 5. Read-out`);
  L.push("");
  L.push(
    `- **${overwrites.length}** rows would overwrite real live records (see §3) — not safe to load by externalId.`,
  );
  L.push(
    `- **${allResults.filter((r) => r.label === "CREATE_NEW").length}** rows have no live match (would be new records); cross-check against the fabrication flags before treating any as real.`,
  );
  L.push(
    `- **${allResults.filter((r) => r.label === "NO_TARGET_MODEL").length}** rows have no platform model to land in (constraints, workstream_status).`,
  );
  L.push(
    `- Decide the real strategy from \`rows.jsonl\` (e.g. a vetted CREATE-only, non-fabricated subset) — or reject the package.`,
  );
  L.push("");

  fs.writeFileSync(path.join(OUT_DIR, "REPORT.md"), L.join("\n"), "utf-8");

  // Console summary
  console.log(`\nDry-run complete (READ-ONLY — no DB writes).`);
  console.log(`  Manifest counts: ${countsOk ? "PASS" : "FAILED"}`);
  console.log(`  Rows analysed:   ${allResults.length}`);
  console.log(`  OVERWRITE:       ${overwrites.length}`);
  console.log(`  UPDATE_CANDIDATE:${allResults.filter((r) => r.label === "UPDATE_CANDIDATE").length}`);
  console.log(`  CREATE_NEW:      ${allResults.filter((r) => r.label === "CREATE_NEW").length}`);
  console.log(`  NO_TARGET_MODEL: ${allResults.filter((r) => r.label === "NO_TARGET_MODEL").length}`);
  console.log(`  fabrication-flagged rows: ${fabRows}`);
  console.log(`  Report: ${path.relative(ROOT, path.join(OUT_DIR, "REPORT.md"))}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
