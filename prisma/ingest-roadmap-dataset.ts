/**
 * Ingest the cleaned workstream roadmap dataset into the live platform.
 *
 * SAFETY MODEL
 *  - CREATE-only. Never updates or deletes an existing record. Re-running skips
 *    anything whose externalId already exists (idempotent).
 *  - Existing live data (WBS-* tasks, RSK-### risks, DEP-### deps, etc.) is left
 *    untouched — the dataset uses its own 4-digit IDs (PRG/RSK/CON/DEP-xxxx).
 *  - Dry-run by default. Pass `--apply` to write. Pass `--snapshot` to also dump
 *    a pre-apply snapshot + a reversal manifest to docs/rekey-dryrun/.
 *
 * WHAT IT TOUCHES (all "relevant areas")
 *  - Workstreams: resolves the 10 delivery workstreams to existing ones by name,
 *    creates the rest.
 *  - People: resolves owners to canonical Persons; creates Persons for real
 *    names not yet present so ownership is a real link, not just text.
 *  - Tasks: 187 PRG-xxxx delivery tasks with ISO baseline+forecast dates,
 *    durations, owner, workstream, status, priority, validation confidence.
 *  - Risks / Dependencies / ProgrammeConstraints: linked to their parent task.
 *  - TaskDependency edges: resolved from dependency "related deliverable" text so
 *    the CPM / critical-path view recomputes over the new tasks.
 *
 * Run: npx tsx prisma/ingest-roadmap-dataset.ts            (dry-run)
 *      npx tsx prisma/ingest-roadmap-dataset.ts --apply --snapshot
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient, Prisma } from "@prisma/client";
import { resolveCanonical } from "./seed/people-canonical";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SNAPSHOT = process.argv.includes("--snapshot");

const ROOT = path.resolve(__dirname, "..");
const STAGE = path.join(ROOT, "prisma", "ingest-staging");
const OUT = path.join(ROOT, "docs", "rekey-dryrun");

type Row = Record<string, any>;
function readJsonl(f: string): Row[] {
  return fs
    .readFileSync(path.join(STAGE, f), "utf-8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

// ── text matching for TaskDependency edge resolution ─────────────────────────
const STOP = new Set("the a an of for and or to in on at by with from is are be as into this that".split(" "));
function toks(s: string | null | undefined): Set<string> {
  if (!s) return new Set();
  return new Set(
    s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t.length > 2 && !STOP.has(t)),
  );
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let i = 0;
  for (const t of a) if (b.has(t)) i++;
  return i / (a.size + b.size - i);
}
const EDGE_THRESHOLD = 0.5;

const slug = (s: string) =>
  "ws_" + s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);

async function main() {
  const master = readJsonl("master.jsonl");
  const risks = readJsonl("risks.jsonl");
  const cons = readJsonl("constraints.jsonl");
  const deps = readJsonl("dependencies.jsonl");

  const programme = await prisma.programme.findFirst({ select: { id: true } });
  if (!programme) throw new Error("No Programme row found");

  const log: string[] = [];
  const say = (s: string) => {
    log.push(s);
    console.log(s);
  };
  say(`# Roadmap dataset ingestion — ${APPLY ? "APPLY" : "DRY-RUN"} — ${new Date().toISOString()}`);
  say(`programme=${programme.id}`);

  // ── 1. WORKSTREAMS ─────────────────────────────────────────────────────────
  const liveWs = await prisma.workstream.findMany({ select: { id: true, code: true, name: true } });
  const wsByName = new Map(liveWs.map((w) => [w.name.toLowerCase().trim(), w]));
  const dsWsNames = [...new Set(master.map((m) => m.workstream).filter(Boolean) as string[])];
  const wsResolve = new Map<string, { id: string; how: string }>(); // ds name -> live id
  const wsToCreate: { code: string; name: string }[] = [];
  let nextSort = liveWs.length;
  for (const name of dsWsNames) {
    const hit = wsByName.get(name.toLowerCase().trim());
    if (hit) {
      wsResolve.set(name, { id: hit.id, how: `existing(${hit.code})` });
    } else {
      const code = slug(name);
      wsToCreate.push({ code, name });
      wsResolve.set(name, { id: `NEW:${code}`, how: `create(${code})` });
    }
  }
  say(`\n## Workstreams (${dsWsNames.length} in dataset)`);
  for (const n of dsWsNames) say(`  - ${n} -> ${wsResolve.get(n)!.how}`);

  // ── 2. OWNERS -> PEOPLE ────────────────────────────────────────────────────
  const allOwners = [...new Set(
    [...master, ...risks, ...cons, ...deps].map((r) => r.owner).filter(Boolean) as string[],
  )];
  const livePeople = await prisma.person.findMany({ select: { id: true, displayName: true, surname: true } });
  const personByName = new Map(livePeople.map((p) => [p.displayName.toLowerCase().trim(), p]));
  const ownerResolve = new Map<string, { id: string; how: string }>();
  const peopleToCreate: { displayName: string; surname: string | null; kind: "PERSON" | "GROUP" }[] = [];
  for (const owner of allOwners) {
    const canon = resolveCanonical(owner);
    const lookup = (canon?.displayName ?? owner).toLowerCase().trim();
    const existing = personByName.get(lookup);
    if (existing) {
      ownerResolve.set(owner, { id: existing.id, how: `existing(${existing.displayName})` });
    } else {
      const displayName = canon?.displayName ?? owner;
      const kind = /\b(and|&|\/|,|team)\b/i.test(owner) ? "GROUP" : "PERSON";
      if (!peopleToCreate.some((p) => p.displayName.toLowerCase() === displayName.toLowerCase())) {
        peopleToCreate.push({ displayName, surname: canon?.surname ?? null, kind });
      }
      ownerResolve.set(owner, { id: `NEW:${displayName}`, how: `create(${displayName}/${kind})` });
    }
  }
  say(`\n## Owners (${allOwners.length} distinct) — resolved=${allOwners.length - peopleToCreate.length} create=${peopleToCreate.length}`);
  for (const p of peopleToCreate) say(`  + create Person: ${p.displayName} [${p.kind}]`);

  // ── existing externalIds (idempotency) ─────────────────────────────────────
  const [exTasks, exRisks, exDeps, exCons] = await Promise.all([
    prisma.task.findMany({ select: { externalId: true } }),
    prisma.risk.findMany({ select: { externalId: true } }),
    prisma.dependency.findMany({ select: { externalId: true } }),
    prisma.programmeConstraint.findMany({ select: { externalId: true } }).catch(() => [] as { externalId: string }[]),
  ]);
  const exTaskIds = new Set(exTasks.map((t) => t.externalId));
  const exRiskIds = new Set(exRisks.map((r) => r.externalId));
  const exDepIds = new Set(exDeps.map((d) => d.externalId));
  const exConIds = new Set(exCons.map((c) => c.externalId));

  const newMaster = master.filter((m) => !exTaskIds.has(m.externalId));
  const newRisks = risks.filter((r) => !exRiskIds.has(r.externalId));
  const newDeps = deps.filter((d) => !exDepIds.has(d.externalId));
  const newCons = cons.filter((c) => !exConIds.has(c.externalId));
  say(`\n## Create plan (CREATE-only; already-present skipped)`);
  say(`  Tasks (PRG):       ${newMaster.length} / ${master.length}`);
  say(`  Risks (RSK-xxxx):  ${newRisks.length} / ${risks.length}`);
  say(`  Constraints (CON): ${newCons.length} / ${cons.length}`);
  say(`  Dependencies(DEP): ${newDeps.length} / ${deps.length}`);

  const composeDesc = (m: Row) =>
    [m.description, m.scopeItems ? `Scope: ${m.scopeItems}` : null, m.comments ? `Comments: ${m.comments}` : null]
      .filter(Boolean)
      .join("\n\n") || null;

  // ── TaskDependency edge resolution (preview against full task set) ──────────
  // task title tokens for ALL tasks (existing + to-be-created) keyed by externalId
  const allTaskTitles: { externalId: string; title: string; tok: Set<string> }[] = [
    ...(await prisma.task.findMany({ select: { externalId: true, title: true } })).map((t) => ({
      externalId: t.externalId,
      title: t.title,
      tok: toks(t.title),
    })),
    ...newMaster.map((m) => ({ externalId: m.externalId, title: m.title, tok: toks(m.title) })),
  ];
  let edgeResolved = 0;
  const edgePreview: string[] = [];
  const edgePlan: { predExt: string; succExt: string; note: string }[] = [];
  for (const d of deps) {
    if (!d.relatedDeliverable || !d.linkedTask) continue;
    const rt = toks(d.relatedDeliverable);
    let best: { externalId: string; title: string } | null = null;
    let bestScore = 0;
    for (const t of allTaskTitles) {
      if (t.externalId === d.linkedTask) continue;
      const sc = jaccard(rt, t.tok);
      if (sc > bestScore) {
        bestScore = sc;
        best = t;
      }
    }
    if (best && bestScore >= EDGE_THRESHOLD) {
      edgeResolved++;
      edgePlan.push({ predExt: best.externalId, succExt: d.linkedTask, note: `${d.externalId}: ${d.relatedDeliverable}` });
      if (edgePreview.length < 12)
        edgePreview.push(`  ${best.externalId} -> ${d.linkedTask}  (${bestScore.toFixed(2)}) via "${String(d.relatedDeliverable).slice(0, 40)}"`);
    }
  }
  say(`\n## TaskDependency edges (for critical path)`);
  say(`  Resolved ${edgeResolved} of ${deps.length} dependency rows to a predecessor task (>= ${EDGE_THRESHOLD}). Rest kept as register entries only.`);
  edgePreview.forEach((e) => say(e));

  if (!APPLY) {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "ingest-dryrun.md"), log.join("\n"), "utf-8");
    say(`\nDRY-RUN complete. No writes. Report: docs/rekey-dryrun/ingest-dryrun.md`);
    say(`Re-run with --apply --snapshot to ingest.`);
    return;
  }

  // ══════════════════════════ APPLY ══════════════════════════════════════════
  fs.mkdirSync(OUT, { recursive: true });
  if (SNAPSHOT) {
    const snap = {
      at: new Date().toISOString(),
      counts: {
        tasks: exTasks.length, risks: exRisks.length, dependencies: exDeps.length,
        programmeConstraints: exCons.length, workstreams: liveWs.length, people: livePeople.length,
      },
    };
    fs.writeFileSync(path.join(OUT, "pre-apply-snapshot.json"), JSON.stringify(snap, null, 2), "utf-8");
  }

  const manifest: any = { at: new Date().toISOString(), createdWorkstreamCodes: [], createdPersonIds: [], taskExternalIds: [], riskExternalIds: [], constraintExternalIds: [], dependencyExternalIds: [], taskDependencyIds: [] };

  // create workstreams
  for (const w of wsToCreate) {
    const created = await prisma.workstream.create({
      data: { code: w.code, name: w.name, programmeId: programme.id, sortOrder: nextSort++ },
      select: { id: true, code: true },
    });
    wsResolve.set(w.name, { id: created.id, how: `created(${created.code})` });
    manifest.createdWorkstreamCodes.push(created.code);
  }
  const wsId = (name: string | null) => (name ? wsResolve.get(name)?.id ?? null : null);

  // create people
  for (const p of peopleToCreate) {
    const created = await prisma.person.create({
      data: { displayName: p.displayName, surname: p.surname, kind: p.kind as any, confidence: "INFERRED" },
      select: { id: true, displayName: true },
    });
    for (const [owner, r] of ownerResolve) if (r.id === `NEW:${p.displayName}`) ownerResolve.set(owner, { id: created.id, how: r.how });
    manifest.createdPersonIds.push(created.id);
  }
  const ownerId = (owner: string | null) => (owner ? ownerResolve.get(owner)?.id ?? null : null);

  // create tasks (individually — need ids for child links + edges)
  const taskIdByExt = new Map<string, string>();
  for (const t of await prisma.task.findMany({ select: { id: true, externalId: true } })) taskIdByExt.set(t.externalId, t.id);
  for (const m of newMaster) {
    const created = await prisma.task.create({
      data: {
        externalId: m.externalId,
        title: m.title,
        description: composeDesc(m),
        status: m.status,
        priority: m.priority,
        confidence: m.dataConfidence,
        baselineStartDate: m.startDate, baselineEndDate: m.endDate,
        forecastStartDate: m.startDate, forecastEndDate: m.endDate,
        durationDays: m.durationDays ?? undefined,
        ownerText: m.owner ?? undefined,
        ownerPersonId: ownerId(m.owner) ?? undefined,
        workstreamId: wsId(m.workstream) ?? undefined,
        programmeId: programme.id,
        traceRef: m.traceRef,
      },
      select: { id: true, externalId: true },
    });
    taskIdByExt.set(created.externalId, created.id);
    manifest.taskExternalIds.push(created.externalId);
  }

  // risks (createMany — flat)
  if (newRisks.length) {
    await prisma.risk.createMany({
      data: newRisks.map((r) => ({
        externalId: r.externalId,
        description: [r.title, r.description].filter(Boolean).join(" — "),
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        status: r.status,
        ownerText: r.owner ?? undefined,
        ownerPersonId: ownerId(r.owner) ?? undefined,
        mitigationRequired: r.requiredAction ?? undefined,
        taskId: r.linkedTask ? taskIdByExt.get(r.linkedTask) ?? undefined : undefined,
        workstreamId: wsId(r.workstream) ?? undefined,
        traceRef: r.traceRef,
      })) as Prisma.RiskCreateManyInput[],
      skipDuplicates: true,
    });
    manifest.riskExternalIds = newRisks.map((r) => r.externalId);
  }

  // dependencies (register)
  if (newDeps.length) {
    await prisma.dependency.createMany({
      data: newDeps.map((d) => ({
        externalId: d.externalId,
        description: [d.title, d.description].filter(Boolean).join(" — "),
        status: d.status,
        providingTeam: d.relatedDeliverable ?? undefined,
        delayRisk: d.requiredAction ?? undefined,
        ownerText: d.owner ?? undefined,
        taskId: d.linkedTask ? taskIdByExt.get(d.linkedTask) ?? undefined : undefined,
        workstreamId: wsId(d.workstream) ?? undefined,
        traceRef: d.traceRef,
      })) as Prisma.DependencyCreateManyInput[],
      skipDuplicates: true,
    });
    manifest.dependencyExternalIds = newDeps.map((d) => d.externalId);
  }

  // constraints
  if (newCons.length) {
    await prisma.programmeConstraint.createMany({
      data: newCons.map((c) => ({
        externalId: c.externalId,
        title: c.title ?? "(untitled)",
        description: c.description ?? undefined,
        constraintType: c.constraintType ?? undefined,
        severity: c.severity ?? undefined,
        status: typeof c.status === "string" ? c.status : "Not Started",
        priority: c.priority,
        requiredAction: c.requiredAction ?? undefined,
        relatedDeliverable: c.relatedDeliverable ?? undefined,
        ownerText: c.owner ?? undefined,
        ownerPersonId: ownerId(c.owner) ?? undefined,
        programmeId: programme.id,
        taskId: c.linkedTask ? taskIdByExt.get(c.linkedTask) ?? undefined : undefined,
        workstreamId: wsId(c.workstream) ?? undefined,
        sourceEvidence: c.evidence ?? undefined,
        traceRef: c.traceRef,
      })) as Prisma.ProgrammeConstraintCreateManyInput[],
      skipDuplicates: true,
    });
    manifest.constraintExternalIds = newCons.map((c) => c.externalId);
  }

  // TaskDependency edges
  const edgeData: Prisma.TaskDependencyCreateManyInput[] = [];
  for (const e of edgePlan) {
    const pred = taskIdByExt.get(e.predExt);
    const succ = taskIdByExt.get(e.succExt);
    if (pred && succ && pred !== succ) edgeData.push({ predecessorTaskId: pred, successorTaskId: succ, dependencyType: "FS", notes: e.note });
  }
  if (edgeData.length) {
    const before = await prisma.taskDependency.count();
    await prisma.taskDependency.createMany({ data: edgeData, skipDuplicates: true });
    const after = await prisma.taskDependency.count();
    manifest.taskDependencyEdgesAdded = after - before;
  }

  await prisma.auditEvent
    .create({
      data: {
        entityType: "ProgrammeData",
        entityId: "roadmap-dataset-ingest",
        action: "BULK_INGEST",
        actorName: "ingest-roadmap-dataset.ts",
        payload: {
          tasks: manifest.taskExternalIds.length,
          risks: manifest.riskExternalIds.length,
          constraints: manifest.constraintExternalIds.length,
          dependencies: manifest.dependencyExternalIds.length,
          workstreamsCreated: manifest.createdWorkstreamCodes.length,
          peopleCreated: manifest.createdPersonIds.length,
          taskDependencyEdgesAdded: manifest.taskDependencyEdgesAdded ?? 0,
        },
      },
    })
    .catch((e) => console.warn("audit event skipped:", (e as Error).message));

  fs.writeFileSync(path.join(OUT, "ingest-manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  say(`\nAPPLY complete.`);
  say(`  tasks=${manifest.taskExternalIds.length} risks=${manifest.riskExternalIds.length} constraints=${manifest.constraintExternalIds.length} deps=${manifest.dependencyExternalIds.length}`);
  say(`  workstreamsCreated=${manifest.createdWorkstreamCodes.length} peopleCreated=${manifest.createdPersonIds.length} edgesAdded=${manifest.taskDependencyEdgesAdded ?? 0}`);
  say(`  Reversal manifest: docs/rekey-dryrun/ingest-manifest.json`);
  fs.writeFileSync(path.join(OUT, "ingest-apply.md"), log.join("\n"), "utf-8");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
