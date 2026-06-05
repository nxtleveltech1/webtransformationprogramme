import { PrismaClient } from "@prisma/client";



const EXPECTED = {

  decisions: 28,

  actions: 84,

  risks: 32,

  issues: 11,

  assumptions: 16,

  dependencies: 22,

  questions: 27,

  parking: 15,

  tradeoffs: 9,

  criticalPath: 15,

  roadmap: 17,

  governance: 7,

  journeys: 7,

  streamInputs: 10,

  sources: 9,

  sessions: 5,

  phases: 7,

  deliverables: 34,

  tasks: 112,

  taskDependencies: 42,

  readinessGates: 11,

  governanceMeetings: 9,

  evidenceLinks: 60,

};



const prisma = new PrismaClient();



async function main() {

  const counts = {

    decisions: await prisma.decision.count(),

    actions: await prisma.action.count(),

    risks: await prisma.risk.count(),

    issues: await prisma.issue.count(),

    assumptions: await prisma.assumption.count(),

    dependencies: await prisma.dependency.count(),

    questions: await prisma.openQuestion.count(),

    parking: await prisma.parkingLotItem.count(),

    tradeoffs: await prisma.tradeoff.count(),

    criticalPath: await prisma.criticalPathStep.count(),

    roadmap: await prisma.roadmapActivity.count(),

    governance: await prisma.governanceForum.count(),

    journeys: await prisma.customerJourney.count(),

    streamInputs: await prisma.streamInput.count(),

    sources: await prisma.sourceDocument.count(),

    sourcesIngested: await prisma.sourceDocument.count({ where: { ingestStatus: { not: "EXCLUDED" } } }),

    sessions: await prisma.workshopSession.count(),

    phases: await prisma.phase.count(),

    deliverables: await prisma.deliverable.count(),

    tasks: await prisma.task.count(),

    taskDependencies: await prisma.taskDependency.count(),

    readinessGates: await prisma.readinessGate.count(),

    governanceMeetings: await prisma.governanceMeeting.count(),

    evidenceLinks: await prisma.evidenceLink.count(),

    registerLinks: await prisma.registerLink.count(),

    traceRefs: await prisma.traceReference.count(),

    people: await prisma.person.count(),

    glossary: await prisma.glossaryTerm.count(),

    workstreams: await prisma.workstream.count(),

  };



  let failed = false;

  console.log("\n=== Workshop DB verification ===\n");

  for (const [key, expected] of Object.entries(EXPECTED)) {

    const actual = counts[key as keyof typeof counts];

    const ok = actual === expected;

    console.log(`${ok ? "✓" : "✗"} ${key}: ${actual} (expected ${expected})`);

    if (!ok) failed = true;

  }

  console.log(`  sourcesIngested (excl SRC-004): ${counts.sourcesIngested} (expected 8)`);

  console.log(`  workstreams: ${counts.workstreams} (expected 11)`);

  if (counts.sourcesIngested !== 8 || counts.workstreams !== 11) failed = true;

  console.log(`\nExtra: registerLinks=${counts.registerLinks}, traceRefs=${counts.traceRefs}, people=${counts.people}, glossary=${counts.glossary}`);



  const sequences = await prisma.registerSequence.findMany();

  console.log("\nRegister sequences:");

  for (const s of sequences) {

    console.log(`  ${s.prefix}: highest=${s.highestUsed}, next=${s.nextFree}`);

  }



  if (failed) {

    console.error("\nVerification FAILED");

    process.exit(1);

  }

  console.log("\nVerification PASSED");

}



main().finally(() => prisma.$disconnect());

