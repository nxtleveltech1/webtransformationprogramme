/**
 * READ-ONLY post-ingest verification: counts, owner/date/link alignment, and a
 * live CPM recompute over the new TaskDependency graph.
 * Run: npx tsx prisma/verify-roadmap-ingest.ts
 */
import { PrismaClient } from "@prisma/client";
import { getCpm } from "../src/lib/services/cpm";
const prisma = new PrismaClient();

async function main() {
  const [tasks, risks, deps, cons, ws, people, edges] = await Promise.all([
    prisma.task.count(),
    prisma.risk.count(),
    prisma.dependency.count(),
    prisma.programmeConstraint.count(),
    prisma.workstream.count(),
    prisma.person.count(),
    prisma.taskDependency.count(),
  ]);
  console.log("=== TOTAL COUNTS (live + ingested) ===");
  console.log({ tasks, risks, dependencies: deps, programmeConstraints: cons, workstreams: ws, people, taskDependencyEdges: edges });

  // alignment on the ingested (PRG) tasks
  const prg = await prisma.task.findMany({
    where: { externalId: { startsWith: "PRG-" } },
    select: { externalId: true, ownerPersonId: true, ownerText: true, baselineStartDate: true, baselineEndDate: true, workstreamId: true, durationDays: true },
  });
  const withPerson = prg.filter((t) => t.ownerPersonId).length;
  const withOwnerText = prg.filter((t) => t.ownerText).length;
  const withDates = prg.filter((t) => t.baselineStartDate && t.baselineEndDate).length;
  const withWs = prg.filter((t) => t.workstreamId).length;
  const withDur = prg.filter((t) => t.durationDays != null).length;
  console.log("\n=== INGESTED TASK ALIGNMENT (of", prg.length, "PRG tasks) ===");
  console.log({ ownerPersonLinked: withPerson, ownerTextSet: withOwnerText, baselineDatesSet: withDates, workstreamLinked: withWs, durationSet: withDur });

  // risk/constraint/dep linkage to tasks
  const rLinked = await prisma.risk.count({ where: { externalId: { startsWith: "RSK-0" }, taskId: { not: null } } });
  const cLinked = await prisma.programmeConstraint.count({ where: { taskId: { not: null } } });
  const dLinked = await prisma.dependency.count({ where: { externalId: { startsWith: "DEP-0" }, taskId: { not: null } } });
  console.log("\n=== CHILD LINKAGE TO PARENT TASK ===");
  console.log({ risksLinkedToTask: rLinked, constraintsLinkedToTask: cLinked, depsLinkedToTask: dLinked });

  // CPM recompute
  console.log("\n=== CPM RECOMPUTE (critical path over full graph) ===");
  const cpm = await getCpm();
  console.log(cpm.summary);
  console.log("projectDurationDays:", cpm.projectDurationDays);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
