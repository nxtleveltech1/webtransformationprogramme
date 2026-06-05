/**
 * Read-only parity check: deck workstreams vs DB vs workshop_data.py counts.
 * Run: npx tsx prisma/audit-data-parity.ts
 */
import { PrismaClient } from "@prisma/client";

const EXPECTED = {
  decisions: 28,
  actions: 84,
  risks: 32,
  issues: 11,
  dependencies: 22,
};

const DECK_WORKSTREAMS: Record<string, { leadText: string; primary: string | null }> = {
  governance_pmo: { primary: "Gareth Bew", leadText: "Gareth Bew; Programme Leadership" },
  technical_migration: { primary: "Nithin Ramsaroop", leadText: "Nithin Ramsaroop; Zethembiso Msomi; Daniel" },
  design_systems: { primary: "Sebabatso Mtimkulu", leadText: "Sebabatso Mtimkulu; Brent Van Ziller; Justin Evans" },
  content_ia: { primary: "Natalie Patel", leadText: "Natalie Patel; Bernice Bryce; Justin Evans" },
  publishing: { primary: "Bernice Bryce", leadText: "Bernice Bryce" },
  internal_comms: { primary: null, leadText: "Programme / Comms owner TBC" },
  external_comms: { primary: null, leadText: "Programme / Marketing owner TBC" },
  contact_support: { primary: null, leadText: "Programme / Support owner TBC" },
  training_adoption: { primary: null, leadText: "Programme / Training owner TBC" },
  testing_go_live: { primary: "Luvuyo Mkumatela", leadText: "Luvuyo Mkumatela; Keshvi Singh" },
  hypercare: { primary: null, leadText: "Programme / Support owner TBC" },
};

const prisma = new PrismaClient();

async function main() {
  const counts = {
    decisions: await prisma.decision.count(),
    actions: await prisma.action.count(),
    risks: await prisma.risk.count(),
    issues: await prisma.issue.count(),
    dependencies: await prisma.dependency.count(),
    sources: await prisma.sourceDocument.count(),
    sessions: await prisma.workshopSession.count(),
    phases: await prisma.phase.count(),
    deliverables: await prisma.deliverable.count(),
    tasks: await prisma.task.count(),
    readinessGates: await prisma.readinessGate.count(),
    governanceMeetings: await prisma.governanceMeeting.count(),
    evidenceLinks: await prisma.evidenceLink.count(),
  };

  console.log("\n=== Register counts ===\n");
  let failed = false;
  for (const [k, exp] of Object.entries(EXPECTED)) {
    const act = counts[k as keyof typeof counts];
    const ok = act === exp;
    console.log(`${ok ? "OK" : "FAIL"} ${k}: ${act} (expected ${exp})`);
    if (!ok) failed = true;
  }

  const controlExpectations = {
    sources: 9,
    sessions: 5,
    phases: 7,
    deliverables: 34,
    tasks: 112,
    readinessGates: 11,
    governanceMeetings: 9,
    evidenceLinks: 60,
  };

  console.log("\n=== Programme control coverage ===\n");
  for (const [k, exp] of Object.entries(controlExpectations)) {
    const act = counts[k as keyof typeof counts];
    const ok = act === exp;
    console.log(`${ok ? "OK" : "FAIL"} ${k}: ${act} (expected ${exp})`);
    if (!ok) failed = true;
  }

  const workstreams = await prisma.workstream.findMany({
    orderBy: { sortOrder: "asc" },
    include: { leadPerson: { select: { displayName: true, surname: true } } },
  });

  console.log("\n=== Workstream leads (deck vs DB) ===\n");
  if (workstreams.length !== Object.keys(DECK_WORKSTREAMS).length) {
    console.log(`FAIL workstream count: ${workstreams.length} (expected ${Object.keys(DECK_WORKSTREAMS).length})`);
    failed = true;
  }
  for (const ws of workstreams) {
    const deck = DECK_WORKSTREAMS[ws.code];
    if (!deck) {
      console.log(`WARN unknown code ${ws.code}`);
      continue;
    }
    const dbLead =
      ws.leadText ??
      ([ws.leadPerson?.displayName, ws.leadPerson?.surname].filter(Boolean).join(" ") || "Unassigned");
    const leadOk = ws.leadText === deck.leadText;
    const primaryName = ws.leadPerson
      ? `${ws.leadPerson.displayName} ${ws.leadPerson.surname ?? ""}`.trim()
      : null;
    const primaryOk = deck.primary === null ? primaryName === null : primaryName === deck.primary;
    const status = leadOk && primaryOk ? "OK" : "MISMATCH";
    if (status === "MISMATCH") failed = true;
    console.log(`${status} ${ws.code}`);
    console.log(`  deck leadText: ${deck.leadText}`);
    console.log(`  db   leadText: ${ws.leadText ?? "(null)"}`);
    console.log(`  db   primary:  ${primaryName ?? "(null)"}`);
  }

  if (failed) {
    console.error("\nAudit FAILED\n");
    process.exit(1);
  }
  console.log("\nAudit PASSED\n");
}

main().finally(() => prisma.$disconnect());
