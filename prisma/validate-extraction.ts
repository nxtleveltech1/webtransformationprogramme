/**
 * Extraction validation — ensures programme control items have traceability.
 * Run: npm run db:validate:extraction
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MINIMUMS = {
  tasks: 80,
  deliverables: 30,
  evidenceLinks: 40,
  readinessGates: 11,
};

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function assert(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
}

async function main() {
  console.log("\n=== Extraction validation ===\n");

  const [tasks, deliverables, gates, evidenceLinks] = await Promise.all([
    prisma.task.findMany({ select: { externalId: true, traceRef: true, confidence: true, title: true } }),
    prisma.deliverable.findMany({ select: { externalId: true, traceRef: true, confidence: true } }),
    prisma.readinessGate.findMany({ select: { externalId: true, traceRef: true, confidence: true } }),
    prisma.evidenceLink.count(),
  ]);

  assert("WBS task count meets minimum", tasks.length >= MINIMUMS.tasks, `${tasks.length} (min ${MINIMUMS.tasks})`);
  assert(
    "Deliverable count meets minimum",
    deliverables.length >= MINIMUMS.deliverables,
    `${deliverables.length} (min ${MINIMUMS.deliverables})`,
  );
  assert(
    "Evidence link count meets minimum",
    evidenceLinks >= MINIMUMS.evidenceLinks,
    `${evidenceLinks} (min ${MINIMUMS.evidenceLinks})`,
  );
  assert(
    "Readiness gate count meets minimum",
    gates.length >= MINIMUMS.readinessGates,
    `${gates.length} (min ${MINIMUMS.readinessGates})`,
  );

  const tasksNoTrace = tasks.filter((t) => !t.traceRef?.trim());
  assert("All WBS tasks have traceRef", tasksNoTrace.length === 0, tasksNoTrace.map((t) => t.externalId).join(", ") || "none");

  const deliverablesNoTrace = deliverables.filter((d) => !d.traceRef?.trim());
  assert(
    "All deliverables have traceRef",
    deliverablesNoTrace.length === 0,
    deliverablesNoTrace.map((d) => d.externalId).join(", ") || "none",
  );

  const gatesNoTrace = gates.filter((g) => !g.traceRef?.trim());
  assert(
    "All readiness gates have traceRef",
    gatesNoTrace.length === 0,
    gatesNoTrace.map((g) => g.externalId).join(", ") || "none",
  );

  const gapTasks = tasks.filter(
    (t) =>
      t.traceRef?.toLowerCase().includes("gap") ||
      t.confidence === "REQUIRES_VALIDATION" ||
      t.title.toLowerCase().includes("gap"),
  );
  assert(
    "Board photo gap explicitly recorded",
    gapTasks.some((t) => t.externalId === "WBS-024" || t.title.toLowerCase().includes("board")),
    gapTasks.map((t) => t.externalId).join(", ") || "WBS-024 expected",
  );

  const gapEvidence = await prisma.evidenceLink.count({ where: { kind: "GAP" } });
  assert(
    "Gap evidence links exist for unresolved sources",
    gapEvidence >= 1,
    `${gapEvidence} GAP evidence links`,
  );

  const thinWorkstreams = ["internal_comms", "external_comms", "contact_support", "training_adoption", "hypercare"];
  for (const code of thinWorkstreams) {
    const ws = await prisma.workstream.findUnique({ where: { code }, include: { tasks: true, deliverables: true } });
    if (!ws) {
      assert(`Workstream ${code} exists`, false, "missing");
      continue;
    }
    assert(
      `${code} has >= 5 WBS tasks`,
      ws.tasks.length >= 5,
      `${ws.tasks.length} tasks`,
    );
  }

  const passed = checks.filter((c) => c.ok).length;
  console.log(`Checks: ${passed}/${checks.length} passed\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error(`\n${failed.length} extraction check(s) FAILED.\n`);
    process.exit(1);
  }
  console.log("\nAll extraction checks passed.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
