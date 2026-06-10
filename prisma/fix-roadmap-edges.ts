/**
 * Rebuild the TaskDependency edges created by the roadmap ingest with stricter
 * matching + cycle prevention, so the CPM critical path is clean.
 *
 *  - Removes only edges this ingest created (notes start with "DEP-").
 *  - Re-resolves each dependency's related-deliverable to a predecessor task using
 *    token-CONTAINMENT or jaccard >= 0.75 (kills sibling false-positives).
 *  - Inserts edges in an acyclic way: skips any edge that would close a cycle.
 *
 * Dry-run by default; --apply to write.
 * Run: npx tsx prisma/fix-roadmap-edges.ts --apply
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const STOP = new Set("the a an of for and or to in on at by with from is are be as into this that".split(" "));
const toks = (s: string | null | undefined) =>
  new Set((s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t.length > 2 && !STOP.has(t)));
const jac = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let i = 0;
  for (const t of a) if (b.has(t)) i++;
  return i / (a.size + b.size - i);
};
const subset = (a: Set<string>, b: Set<string>) => a.size >= 2 && [...a].every((t) => b.has(t));

async function main() {
  const deps = fs
    .readFileSync(path.resolve(__dirname, "ingest-staging", "dependencies.jsonl"), "utf-8")
    .split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));

  const tasks = await prisma.task.findMany({ select: { id: true, externalId: true, title: true } });
  const idByExt = new Map(tasks.map((t) => [t.externalId, t.id]));
  const tok = tasks.map((t) => ({ ...t, tok: toks(t.title) }));

  // candidate edges (pred -> succ) from dependency direction
  type E = { pred: string; succ: string; note: string; score: number };
  const cand: E[] = [];
  const seen = new Set<string>();
  for (const d of deps) {
    if (!d.relatedDeliverable || !d.linkedTask) continue;
    const rt = toks(d.relatedDeliverable);
    let best: { externalId: string } | null = null;
    let bestScore = 0;
    for (const t of tok) {
      if (t.externalId === d.linkedTask) continue;
      const sc = subset(rt, t.tok) ? Math.max(0.9, jac(rt, t.tok)) : jac(rt, t.tok);
      if (sc > bestScore) { bestScore = sc; best = t; }
    }
    if (best && bestScore >= 0.75) {
      const key = `${best.externalId}->${d.linkedTask}`;
      if (best.externalId !== d.linkedTask && !seen.has(key)) {
        seen.add(key);
        cand.push({ pred: best.externalId, succ: d.linkedTask, note: `${d.externalId}: ${d.relatedDeliverable}`, score: bestScore });
      }
    }
  }
  cand.sort((a, b) => b.score - a.score); // strongest first

  // acyclic insertion: keep edge only if succ cannot already reach pred
  const adj = new Map<string, Set<string>>();
  const reach = (from: string, to: string): boolean => {
    const stack = [from];
    const seenN = new Set<string>();
    while (stack.length) {
      const n = stack.pop()!;
      if (n === to) return true;
      if (seenN.has(n)) continue;
      seenN.add(n);
      for (const nx of adj.get(n) ?? []) stack.push(nx);
    }
    return false;
  };
  const kept: E[] = [];
  let skippedCycle = 0;
  for (const e of cand) {
    if (reach(e.succ, e.pred)) { skippedCycle++; continue; }
    (adj.get(e.pred) ?? adj.set(e.pred, new Set()).get(e.pred)!).add(e.succ);
    kept.push(e);
  }

  console.log(`candidates(strict >=0.75)=${cand.length} kept(acyclic)=${kept.length} skippedToAvoidCycle=${skippedCycle}`);
  if (!APPLY) {
    console.log("DRY-RUN. Sample kept edges:");
    kept.slice(0, 12).forEach((e) => console.log(`  ${e.pred} -> ${e.succ} (${e.score.toFixed(2)})`));
    console.log("Re-run with --apply.");
    return;
  }

  const del = await prisma.taskDependency.deleteMany({ where: { notes: { startsWith: "DEP-" } } });
  const data = kept
    .map((e) => ({ predecessorTaskId: idByExt.get(e.pred)!, successorTaskId: idByExt.get(e.succ)!, dependencyType: "FS", notes: e.note }))
    .filter((d) => d.predecessorTaskId && d.successorTaskId && d.predecessorTaskId !== d.successorTaskId);
  const ins = await prisma.taskDependency.createMany({ data, skipDuplicates: true });
  console.log(`deleted ${del.count} old ingest edges; inserted ${ins.count} clean edges.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
