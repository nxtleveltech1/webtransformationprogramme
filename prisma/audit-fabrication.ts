/**
 * Fabrication audit.
 *
 * Asserts that every row in the PM extension layer is either real workshop /
 * programme data or a declared faithful derivation of it. Demo-only tables
 * (change requests, approvals, documents, notifications, demo users) must be empty.
 *
 * Run with: npm run db:audit:fabrication
 */
import { PrismaClient } from "@prisma/client";
import { CRITICAL_PATH } from "./seed/workshop-data.generated";

const prisma = new PrismaClient();

const GATE_TARGET_DATE: Record<string, string> = {
  "End June": "2026-06-30",
  "End July": "2026-07-31",
  "End July+": "2026-07-31",
};

const PROGRAMME_CONTROL_MINIMUMS = {
  deliverables: 30,
  tasks: 80,
  evidenceLinks: 40,
};

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];
function assert(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
}

async function main() {
  console.log("\n=== Fabrication audit (real workshop data only) ===\n");

  const [workstreamCount, personCount, deliverableCount, taskCount, evidenceCount] = await Promise.all([
    prisma.workstream.count(),
    prisma.person.count(),
    prisma.deliverable.count(),
    prisma.task.count(),
    prisma.evidenceLink.count(),
  ]);

  // --- Tables that must be EMPTY (previously fabricated demo content) ---
  const mustBeEmpty: Array<[string, () => Promise<number>]> = [
    ["ChangeRequest", () => prisma.changeRequest.count()],
    ["Approval", () => prisma.approval.count()],
    ["Document", () => prisma.document.count()],
    ["Notification", () => prisma.notification.count()],
    ["User", () => prisma.user.count()],
    ["UserRole", () => prisma.userRole.count()],
    ["ResourceAllocation", () => prisma.resourceAllocation.count()],
  ];
  for (const [label, counter] of mustBeEmpty) {
    const n = await counter();
    assert(`${label} is empty (no fabricated rows)`, n === 0, `${n} rows`);
  }

  // --- Programme controls must be populated from workshop seed ---
  assert(
    "Deliverables seeded from workshop (not empty)",
    deliverableCount >= PROGRAMME_CONTROL_MINIMUMS.deliverables,
    `${deliverableCount} rows (min ${PROGRAMME_CONTROL_MINIMUMS.deliverables})`,
  );
  assert(
    "WBS tasks seeded from workshop (not empty)",
    taskCount >= PROGRAMME_CONTROL_MINIMUMS.tasks,
    `${taskCount} rows (min ${PROGRAMME_CONTROL_MINIMUMS.tasks})`,
  );
  assert(
    "Evidence links seeded",
    evidenceCount >= PROGRAMME_CONTROL_MINIMUMS.evidenceLinks,
    `${evidenceCount} rows (min ${PROGRAMME_CONTROL_MINIMUMS.evidenceLinks})`,
  );

  const deliverablesNoTrace = await prisma.deliverable.count({ where: { OR: [{ traceRef: null }, { traceRef: "" }] } });
  assert("Deliverables have traceRef", deliverablesNoTrace === 0, `${deliverablesNoTrace} missing traceRef`);

  const tasksNoTrace = await prisma.task.count({ where: { OR: [{ traceRef: null }, { traceRef: "" }] } });
  assert("WBS tasks have traceRef", tasksNoTrace === 0, `${tasksNoTrace} missing traceRef`);

  // --- Projects: one per real workstream, all ACTIVE, no invented attributes ---
  const projects = await prisma.project.findMany({
    include: { workstream: true },
  });
  assert(
    "Projects == workstream count",
    projects.length === workstreamCount,
    `${projects.length} projects vs ${workstreamCount} workstreams`,
  );
  const badProjects = projects.filter(
    (p) =>
      p.status !== "ACTIVE" ||
      p.workstreamId === null ||
      (p.workstream && p.code !== `PRJ-${p.workstream.code}`),
  );
  assert(
    "Projects use real workstream code + ACTIVE status only",
    badProjects.length === 0,
    badProjects.map((p) => p.code).join(", ") || "all clean",
  );
  const inventedProjectAttrs = projects.filter(
    (p) =>
      p.rag !== null ||
      p.sponsor !== null ||
      p.budgetNote !== null ||
      p.startDate !== null ||
      p.endDate !== null,
  );
  assert(
    "Projects carry no invented rag/sponsor/budget/dates",
    inventedProjectAttrs.length === 0,
    inventedProjectAttrs.map((p) => p.code).join(", ") || "none",
  );

  // --- Resources: derived 1:1 from real people, no invented capacity ---
  const resources = await prisma.resource.findMany();
  assert(
    "Resources == person count",
    resources.length === personCount,
    `${resources.length} resources vs ${personCount} people`,
  );
  const linkedToReal = resources.every((r) => r.personId !== null);
  assert("Every resource links to a real person", linkedToReal, "");
  const inventedCapacity = resources.filter((r) => r.capacityHours !== null);
  assert(
    "Resources carry no invented capacity numbers",
    inventedCapacity.length === 0,
    `${inventedCapacity.length} with capacity`,
  );

  // --- Milestones: derived ONLY from real critical-path PI gates ---
  const expectedMilestones = CRITICAL_PATH.filter(
    (r) => GATE_TARGET_DATE[r[5] as string],
  ).length;

  const milestones = await prisma.milestone.findMany();
  assert(
    "Milestone count matches real PI-gate derivation",
    milestones.length === expectedMilestones,
    `${milestones.length} vs expected ${expectedMilestones}`,
  );
  const allowedDates = new Set<string>(Object.values(GATE_TARGET_DATE));
  const allMilestonesHaveGate = milestones.every((m) => m.piGate !== null);
  assert(
    "Every milestone is a critical-path PI gate (no roadmap copies)",
    allMilestonesHaveGate,
    milestones.filter((m) => m.piGate === null).map((m) => m.title).join("; ") || "all gates",
  );
  const badMilestoneDates = milestones.filter(
    (m) => !m.targetDate || !allowedDates.has(m.targetDate),
  );
  assert(
    "Milestone target dates are real workshop gate/go-live dates",
    badMilestoneDates.length === 0,
    badMilestoneDates.map((m) => m.title).join("; ") || "all real",
  );

  const passed = checks.filter((c) => c.ok).length;
  console.log(`Checks: ${passed}/${checks.length} passed\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  }
  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error(`\n${failed.length} fabrication check(s) FAILED.\n`);
    process.exit(1);
  }
  console.log("\nAll fabrication checks passed — programme controls are traceable workshop data.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
