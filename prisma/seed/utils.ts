import * as fs from "fs";
import * as path from "path";
import {
  ActionStatus,
  Confidence,
  DecisionStatus,
  DependencyStatus,
  Impact,
  IngestStatus,
  IssueStatus,
  Priority,
  Probability,
  PrismaClient,
  QuestionStatus,
  RiskCategory,
  RegisterType,
} from "@prisma/client";

export const ROOT = path.resolve(__dirname, "../..");
export const PACK = path.join(ROOT, "WorkshopPack");

export function readPack(...segments: string[]): string {
  return fs.readFileSync(path.join(PACK, ...segments), "utf-8");
}

export function parseMarkdownTable(content: string): string[][] {
  const lines = content.split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|[\s\-:|]+\|$/.test(line.replace(/\s/g, ""))) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

const personCache = new Map<string, string>();

const TEAM_OWNER_TOKENS = new Set([
  "programme",
  "product",
  "design",
  "execution",
  "publishing",
  "content",
  "seo",
  "omds",
  "regional",
  "cross channels",
  "cross channel",
  "cc",
  "participants",
  "senior team",
  "design team",
  "service team",
  "security team",
  "group marketing",
  "programme leadership",
  "business teams",
  "technical teams",
  "brand",
  "gb",
  "tbc",
  "unassigned",
]);

/** Split compound owner strings on / , ; and " and ". */
export function splitOwnerTokens(raw: string): string[] {
  return raw
    .split(/\s*(?:\/|,|;|\band\b)\s*/i)
    .map((t) => t.trim())
    .filter(Boolean);
}

function looksLikePersonName(token: string): boolean {
  const lower = token.toLowerCase().replace(/\s*\([^)]*\)\s*/g, "").trim();
  if (!lower || lower === "-" || lower === "unassigned") return false;
  if (TEAM_OWNER_TOKENS.has(lower)) return false;
  if (/^(programme|design|execution|publishing|content|seo|omds|regional|cross)/i.test(lower) && !/\s/.test(lower)) {
    return false;
  }
  // Require at least one letter; allow "Gareth Bew", "Nithin", "GB"
  return /[a-zA-Z]/.test(token) && token.length >= 2;
}

function parsePersonName(token: string): { displayName: string; surname: string | null } {
  const cleaned = token.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { displayName: cleaned, surname: null };
  if (parts.length === 1) return { displayName: parts[0], surname: null };
  return { displayName: parts[0], surname: parts.slice(1).join(" ") };
}

export type PersonNameInput = {
  displayName: string;
  surname: string | null;
  roleDescription?: string | null;
};

export function formatPersonName(
  person: PersonNameInput | null | undefined,
  fallback?: string | null
): string {
  if (!person) return fallback?.trim() || "Unassigned";
  const full = [person.displayName, person.surname].filter(Boolean).join(" ").trim();
  return full || person.displayName || fallback?.trim() || "Unassigned";
}

/** Prefer ownerText when it lists multiple owners; else formatted person name. */
export function formatOwnerDisplay(
  ownerText: string | null | undefined,
  person: PersonNameInput | null | undefined
): string {
  const text = ownerText?.trim();
  if (text && (text.includes("/") || text.includes(",") || text.includes(";"))) return text;
  if (text && !person) return text;
  return formatPersonName(person, text);
}

export async function getOrCreatePerson(
  prisma: PrismaClient,
  name: string | null | undefined
): Promise<string | null> {
  if (!name || name === "-" || name === "Unassigned") return null;
  const key = name.trim();
  if (personCache.has(key)) return personCache.get(key)!;

  if (!looksLikePersonName(key)) return null;

  const { displayName, surname } = parsePersonName(key);

  const existing = await prisma.person.findFirst({
    where: { displayName, surname: surname ?? null },
  });
  if (existing) {
    personCache.set(key, existing.id);
    return existing.id;
  }

  const created = await prisma.person.create({
    data: { displayName, surname, roleDescription: key, confidence: Confidence.INFERRED },
  });
  personCache.set(key, created.id);
  return created.id;
}

/** Link first resolvable person token from a compound owner string. */
export async function resolveOwnerPersonId(
  prisma: PrismaClient,
  ownerText: string | null | undefined
): Promise<string | null> {
  if (!ownerText?.trim()) return null;
  for (const token of splitOwnerTokens(ownerText)) {
    const id = await getOrCreatePerson(prisma, token);
    if (id) return id;
  }
  return null;
}

export function mapDecisionStatus(s: string): DecisionStatus {
  const u = s.toLowerCase();
  if (u.includes("confirmed")) return DecisionStatus.CONFIRMED;
  if (u.includes("deferred")) return DecisionStatus.DEFERRED;
  if (u.includes("rejected")) return DecisionStatus.REJECTED;
  if (u.includes("unclear")) return DecisionStatus.UNCLEAR;
  return DecisionStatus.PROPOSED;
}

export function mapActionStatus(s: string): ActionStatus {
  const u = s.toLowerCase();
  if (u.includes("in progress")) return ActionStatus.IN_PROGRESS;
  if (u.includes("blocked")) return ActionStatus.BLOCKED;
  if (u.includes("done")) return ActionStatus.DONE;
  if (u.includes("suggested")) return ActionStatus.SUGGESTED;
  if (u.includes("unconfirmed")) return ActionStatus.UNCONFIRMED;
  if (u.includes("new")) return ActionStatus.NEW;
  return ActionStatus.OPEN;
}

export function mapPriority(s: string): Priority {
  const u = s.toLowerCase();
  if (u.includes("critical")) return Priority.CRITICAL;
  if (u.includes("high")) return Priority.HIGH;
  if (u.includes("low")) return Priority.LOW;
  return Priority.MEDIUM;
}

export function mapRiskCategory(s: string): RiskCategory {
  const key = s.toUpperCase().replace(/\s+/g, "_") as keyof typeof RiskCategory;
  return RiskCategory[key] ?? RiskCategory.BUSINESS;
}

export function mapProbability(s: string): Probability {
  const u = s.toLowerCase();
  if (u === "high") return Probability.HIGH;
  if (u === "medium") return Probability.MEDIUM;
  if (u === "low") return Probability.LOW;
  return Probability.UNKNOWN;
}

export function mapImpact(s: string): Impact {
  const u = s.toLowerCase();
  if (u === "high") return Impact.HIGH;
  if (u === "medium") return Impact.MEDIUM;
  if (u === "low") return Impact.LOW;
  return Impact.UNKNOWN;
}

export function mapDependencyStatus(s: string): DependencyStatus {
  const u = s.toLowerCase();
  if (u.includes("met")) return DependencyStatus.MET;
  if (u.includes("blocked")) return DependencyStatus.BLOCKED;
  if (u.includes("risk") || u.includes("at")) return DependencyStatus.AT_RISK;
  if (u.includes("progress")) return DependencyStatus.IN_PROGRESS;
  return DependencyStatus.OPEN;
}

export function mapIssueStatus(s: string): IssueStatus {
  const u = s.toLowerCase();
  if (u.includes("resolved")) return IssueStatus.RESOLVED;
  if (u.includes("closed")) return IssueStatus.CLOSED;
  if (u.includes("progress")) return IssueStatus.IN_PROGRESS;
  return IssueStatus.OPEN;
}

export function mapQuestionStatus(s: string): QuestionStatus {
  const u = s.toLowerCase();
  if (u.includes("answered")) return QuestionStatus.ANSWERED;
  if (u.includes("deferred")) return QuestionStatus.DEFERRED;
  return QuestionStatus.OPEN;
}

export function parseTraceDaySession(trace: string | null | undefined): {
  day: number | null;
  session: string | null;
  sourceId: string | null;
} {
  if (!trace) return { day: null, session: null, sourceId: null };
  const dayMatch = trace.match(/D(\d+)/i);
  const srcMatch = trace.match(/(SRC-\d+)/i);
  const sessMatch = trace.match(/S(\d+|[\d\-]+)/i);
  return {
    day: dayMatch ? parseInt(dayMatch[1], 10) : null,
    session: sessMatch ? `S${sessMatch[1]}` : null,
    sourceId: srcMatch ? srcMatch[1].toUpperCase() : null,
  };
}

export async function resolveSourceId(
  prisma: PrismaClient,
  externalId: string | null
): Promise<string | null> {
  if (!externalId) return null;
  const src = await prisma.sourceDocument.findUnique({ where: { externalId } });
  return src?.id ?? null;
}

export const REGISTER_SEQUENCES = [
  { registerType: RegisterType.DECISION, prefix: "DEC", highestUsed: "DEC-028", nextFree: "DEC-029" },
  { registerType: RegisterType.ACTION, prefix: "ACT", highestUsed: "ACT-084", nextFree: "ACT-085" },
  { registerType: RegisterType.RISK, prefix: "RSK", highestUsed: "RSK-032", nextFree: "RSK-033" },
  { registerType: RegisterType.ISSUE, prefix: "ISS", highestUsed: "ISS-011", nextFree: "ISS-012" },
  { registerType: RegisterType.ASSUMPTION, prefix: "ASM", highestUsed: "ASM-016", nextFree: "ASM-017" },
  { registerType: RegisterType.DEPENDENCY, prefix: "DEP", highestUsed: "DEP-022", nextFree: "DEP-023" },
  { registerType: RegisterType.OPEN_QUESTION, prefix: "QST", highestUsed: "QST-027", nextFree: "QST-028" },
  { registerType: RegisterType.PARKING_LOT, prefix: "PRK", highestUsed: "PRK-015", nextFree: "PRK-016" },
];

export const SOURCES = [
  ["SRC-001", "Documents/Transcirpts/Day 1 Session 1 teams summary.docx", "Teams auto-summary + structured notes", 1, "Day 1 decisions, open questions, meeting notes", IngestStatus.INGESTED, null],
  ["SRC-002", "Documents/Transcirpts/Web_Migration_Workshop_Summary_v5_final_integrated.docx", "Whiteboard synthesis (6 workstreams)", 1, "Day 1 workstream notes, risks, actions, consolidated risk view", IngestStatus.INGESTED, null],
  ["SRC-003", "Documents/Transcirpts/Day 1 Session 1 teams transcript.docx", "Partial Teams transcript", 1, "Speaker attribution (partial)", IngestStatus.PARTIAL, null],
  ["SRC-004", "Documents/Transcirpts/Web Transformation - 2 Day Planning Workshop (Day 1 ).vtt", "Raw VTT transcript", 1, null, IngestStatus.EXCLUDED, "Duplicate of SRC-003"],
  ["SRC-005", "Documents/Transcirpts/Day 1 - Session 2 - Teams notes.docx", "Teams notes S2", 1, "Day 1 follow-up task list, Cross Channels detail", IngestStatus.INGESTED, null],
  ["SRC-006", "Documents/Transcirpts/Day 1 - Session 3 - Teams Notes.docx", "Teams notes S3", 1, "Day 1 closing reflections, scope-options debate", IngestStatus.INGESTED, null],
  ["SRC-007", "Documents/Transcirpts/Day 1 Session 1.md", "Parallel Otter/Teams AI export", 1, "Reconciled; IDs not adopted", IngestStatus.RECONCILED, null],
  ["SRC-008", "Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 SESSION 1.docx", "Day 2 Session 1 notes", 2, "Day 2 delivery model, red/green-zone templates, phasing, governance, automation, foundations", IngestStatus.INGESTED, null],
  ["SRC-009", "Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 - SESSION 2.docx", "Day 2 Session 2 notes", 2, "Day 2 resourcing/roll-offs, secure-web portfolio view, country model, ownership, close", IngestStatus.INGESTED, null],
] as const;
