/**
 * Backfill the cross-platform mapping taxonomy (channel/domain/areaJourney/
 * cluster/market) onto the ingested roadmap records, from the staging jsonl.
 *
 * Idempotent: matches by externalId and only sets the five fields. Dry-run by
 * default; pass --apply to write.
 *
 * Run: npx tsx prisma/backfill-mapping-fields.ts --apply
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const STAGE = path.resolve(__dirname, "ingest-staging");

type Row = Record<string, any>;
const read = (f: string): Row[] =>
  fs.readFileSync(path.join(STAGE, f), "utf-8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));

// master.jsonl uses key "area" for Area_Journey; the others use "areaJourney".
const tax = (r: Row, areaKey: "area" | "areaJourney") => ({
  channel: r.channel ?? undefined,
  domain: r.domain ?? undefined,
  areaJourney: r[areaKey] ?? undefined,
  cluster: r.cluster ?? undefined,
  market: r.market ?? undefined,
});
const hasAny = (d: Record<string, unknown>) => Object.values(d).some((v) => v != null);

async function run<T>(
  label: string,
  rows: Row[],
  areaKey: "area" | "areaJourney",
  update: (externalId: string, data: any) => Promise<T>,
) {
  let updated = 0,
    skipped = 0;
  for (const r of rows) {
    const data = tax(r, areaKey);
    if (!r.externalId || !hasAny(data)) {
      skipped++;
      continue;
    }
    if (APPLY) {
      try {
        await update(r.externalId, data);
        updated++;
      } catch {
        skipped++; // record not present (e.g. not yet ingested)
      }
    } else {
      updated++;
    }
  }
  console.log(`  ${label}: ${APPLY ? "updated" : "would update"}=${updated} skipped=${skipped}`);
}

async function main() {
  console.log(`Backfill mapping fields — ${APPLY ? "APPLY" : "DRY-RUN"}`);
  await run("Tasks(PRG)", read("master.jsonl"), "area", (externalId, data) =>
    prisma.task.update({ where: { externalId }, data }),
  );
  await run("Risks", read("risks.jsonl"), "areaJourney", (externalId, data) =>
    prisma.risk.update({ where: { externalId }, data }),
  );
  await run("Constraints", read("constraints.jsonl"), "areaJourney", (externalId, data) =>
    prisma.programmeConstraint.update({ where: { externalId }, data }),
  );
  await run("Dependencies", read("dependencies.jsonl"), "areaJourney", (externalId, data) =>
    prisma.dependency.update({ where: { externalId }, data }),
  );
  if (!APPLY) console.log("Re-run with --apply to write.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
