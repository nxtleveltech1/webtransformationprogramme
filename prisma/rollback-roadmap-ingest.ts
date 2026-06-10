/**
 * Reverses an ingest performed by ingest-roadmap-dataset.ts, using the reversal
 * manifest at docs/rekey-dryrun/ingest-manifest.json. Deletes ONLY the records
 * that ingest created (by externalId / id) — existing live data is never touched.
 *
 * Dry-run by default; pass --apply to delete.
 * Run: npx tsx prisma/rollback-roadmap-ingest.ts --apply
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const m = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "docs", "rekey-dryrun", "ingest-manifest.json"), "utf-8"),
  );
  const plan = {
    taskDependencyEdges: "edges with notes referencing dataset DEP- ids",
    programmeConstraints: m.constraintExternalIds?.length ?? 0,
    risks: m.riskExternalIds?.length ?? 0,
    dependencies: m.dependencyExternalIds?.length ?? 0,
    tasks: m.taskExternalIds?.length ?? 0,
    people: m.createdPersonIds?.length ?? 0,
    workstreams: m.createdWorkstreamCodes?.length ?? 0,
  };
  console.log(`Rollback ${APPLY ? "APPLY" : "DRY-RUN"} plan:`, plan);
  if (!APPLY) {
    console.log("Re-run with --apply to delete the above.");
    return;
  }
  // Order matters: edges & children first, then tasks, then ws/people.
  const taskIds = (
    await prisma.task.findMany({ where: { externalId: { in: m.taskExternalIds ?? [] } }, select: { id: true } })
  ).map((t) => t.id);
  if (taskIds.length)
    await prisma.taskDependency.deleteMany({
      where: { OR: [{ predecessorTaskId: { in: taskIds } }, { successorTaskId: { in: taskIds } }] },
    });
  await prisma.programmeConstraint.deleteMany({ where: { externalId: { in: m.constraintExternalIds ?? [] } } });
  await prisma.risk.deleteMany({ where: { externalId: { in: m.riskExternalIds ?? [] } } });
  await prisma.dependency.deleteMany({ where: { externalId: { in: m.dependencyExternalIds ?? [] } } });
  await prisma.task.deleteMany({ where: { externalId: { in: m.taskExternalIds ?? [] } } });
  await prisma.person.deleteMany({ where: { id: { in: m.createdPersonIds ?? [] } } });
  await prisma.workstream.deleteMany({ where: { code: { in: m.createdWorkstreamCodes ?? [] } } });
  console.log("Rollback complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
