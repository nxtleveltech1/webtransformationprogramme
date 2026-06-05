import {
  Confidence,
  DeliverableStatus,
  EvidenceLinkKind,
  GovernanceMeetingType,
  PhaseStatus,
  PrismaClient,
  Priority,
  Rag,
  ReadinessGateStatus,
  TaskStatus,
} from "@prisma/client";

import {
  DELIVERABLES,
  EVIDENCE_LINKS,
  GOVERNANCE_MEETINGS,
  PHASES,
  READINESS_GATES,
  TASK_DEPENDENCIES,
  WBS_TASKS,
} from "./seed/workshop-data.generated";

const prisma = new PrismaClient();

const WORKSTREAM_UPDATES = [
  ["programme", "governance_pmo", "Governance and PMO", "Gareth Bew; Programme Leadership", 0],
  ["execution", "technical_migration", "Technical Migration", "Nithin Ramsaroop; Zethembiso Msomi; Daniel", 1],
  ["design", "design_systems", "Design and Design Systems", "Sebabatso Mtimkulu; Brent Van Ziller; Justin Evans", 2],
  ["product", "content_ia", "Content and IA", "Natalie Patel; Bernice Bryce; Justin Evans", 3],
  ["publishing", "publishing", "Publishing", "Bernice Bryce", 4],
  ["cross_channels", "internal_comms", "Internal Communications", "Programme / Comms owner TBC", 5],
  ["seo", "external_comms", "External Communications", "Programme / Marketing owner TBC", 6],
  ["regional", "contact_support", "Contact Centre and Support Readiness", "Programme / Support owner TBC", 7],
  ["omds", "training_adoption", "Training and Adoption", "Programme / Training owner TBC", 8],
  ["go_live", "testing_go_live", "Testing, Readiness and Go-Live", "Luvuyo Mkumatela; Keshvi Singh", 9],
] as const;

const REQUIRED_WORKSTREAMS = [
  ["governance_pmo", "Governance and PMO", "Gareth Bew; Programme Leadership", 0],
  ["technical_migration", "Technical Migration", "Nithin Ramsaroop; Zethembiso Msomi; Daniel", 1],
  ["design_systems", "Design and Design Systems", "Sebabatso Mtimkulu; Brent Van Ziller; Justin Evans", 2],
  ["content_ia", "Content and IA", "Natalie Patel; Bernice Bryce; Justin Evans", 3],
  ["publishing", "Publishing", "Bernice Bryce", 4],
  ["internal_comms", "Internal Communications", "Programme / Comms owner TBC", 5],
  ["external_comms", "External Communications", "Programme / Marketing owner TBC", 6],
  ["contact_support", "Contact Centre and Support Readiness", "Programme / Support owner TBC", 7],
  ["training_adoption", "Training and Adoption", "Programme / Training owner TBC", 8],
  ["testing_go_live", "Testing, Readiness and Go-Live", "Luvuyo Mkumatela; Keshvi Singh", 9],
  ["hypercare", "Hypercare and Stabilisation", "Programme / Support owner TBC", 10],
] as const;

const DAY_2_SOURCES = [
  [
    "SRC-008",
    "Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 SESSION 1.docx",
    "Day 2 Session 1 notes",
    "Day 2 delivery model, red/green-zone templates, phasing, governance, automation, foundations",
  ],
  [
    "SRC-009",
    "Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 - SESSION 2.docx",
    "Day 2 Session 2 notes",
    "Day 2 resourcing/roll-offs, secure-web portfolio view, country model, ownership, close",
  ],
] as const;

const PRIMARY_LEADS = [
  ["governance_pmo", "Gareth", "Bew"],
  ["technical_migration", "Nithin", "Ramsaroop"],
  ["design_systems", "Sebabatso", "Mtimkulu"],
  ["content_ia", "Natalie", "Patel"],
  ["publishing", "Bernice", "Bryce"],
  ["testing_go_live", "Luvuyo", "Mkumatela"],
] as const;

function enumValue<T extends Record<string, string>>(source: T, value: string, fallback: T[keyof T]): T[keyof T] {
  return Object.values(source).includes(value) ? (value as T[keyof T]) : fallback;
}

function sourceFromTrace(traceRef: string): string | null {
  return traceRef.match(/SRC-\d+/)?.[0] ?? null;
}

function confidenceFromTrace(traceRef: string): Confidence {
  return traceRef.startsWith("Requirement|") ? Confidence.INFERRED : Confidence.CONFIRMED;
}

async function main() {
  const programme = await prisma.programme.findFirst({ orderBy: { createdAt: "asc" } });
  if (!programme) throw new Error("No Programme row exists. Run the core seed before WBS population.");

  const workshop = await prisma.workshopEvent.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workshop) throw new Error("No WorkshopEvent row exists. Run the core seed before WBS population.");

  for (const table of [
    prisma.evidenceLink,
    prisma.readinessCriterion,
    prisma.readinessGate,
    prisma.governanceMeeting,
    prisma.taskDependency,
    prisma.task,
    prisma.deliverable,
    prisma.phase,
  ]) {
    await table.deleteMany();
  }

  await prisma.workshopEvent.update({
    where: { id: workshop.id },
    data: { startDate: new Date("2026-06-02"), endDate: new Date("2026-06-03") },
  });

  const day2 = await prisma.workshopDay.upsert({
    where: { workshopId_dayNumber: { workshopId: workshop.id, dayNumber: 2 } },
    update: { date: new Date("2026-06-03"), theme: "Day 2 - delivery re-baseline, resourcing, readiness" },
    create: {
      workshopId: workshop.id,
      dayNumber: 2,
      date: new Date("2026-06-03"),
      theme: "Day 2 - delivery re-baseline, resourcing, readiness",
    },
  });

  for (const [oldCode, code, name, leadText, sortOrder] of WORKSTREAM_UPDATES) {
    await prisma.workstream.updateMany({
      where: { code: oldCode },
      data: { code, name, leadText, leadPersonId: null, sortOrder },
    });
  }

  for (const [code, name, leadText, sortOrder] of REQUIRED_WORKSTREAMS) {
    await prisma.workstream.upsert({
      where: { code },
      update: { name, leadText, leadPersonId: null, sortOrder },
      create: {
        id: `WS-${code}`,
        programmeId: programme.id,
        code,
        name,
        leadText,
        sortOrder,
      },
    });
  }

  for (const [code, displayName, surname] of PRIMARY_LEADS) {
    const person = await prisma.person.findFirst({
      where: { displayName, surname },
      select: { id: true },
    });
    if (person) {
      await prisma.workstream.update({ where: { code }, data: { leadPersonId: person.id } });
    }
  }

  for (const [externalId, filePath, mimeType, authoritativeFor] of DAY_2_SOURCES) {
    await prisma.sourceDocument.upsert({
      where: { externalId },
      update: { filePath, mimeType, workshopDay: 2, authoritativeFor, ingestStatus: "INGESTED" },
      create: {
        id: externalId,
        workshopId: workshop.id,
        externalId,
        filePath,
        mimeType,
        workshopDay: 2,
        authoritativeFor,
        ingestStatus: "INGESTED",
      },
    });
  }

  for (const [sessionNumber, name] of [
    [1, "Day 2 Session 1 - Delivery model and governance re-baseline"],
    [2, "Day 2 Session 2 - Resourcing, roll-offs and close"],
  ] as const) {
    await prisma.workshopSession.upsert({
      where: { workshopId_dayId_sessionNumber: { workshopId: workshop.id, dayId: day2.id, sessionNumber } },
      update: { name, purpose: "Web Transformation Planning Workshop - Day 2" },
      create: {
        workshopId: workshop.id,
        dayId: day2.id,
        sessionNumber,
        name,
        facilitator: "Gareth Bew",
        scribe: "Bertus Goosen",
        purpose: "Web Transformation Planning Workshop - Day 2",
        location: "Cape Town",
        bodyMarkdown: "",
      },
    });
  }

  const workstreamByCode = new Map(
    (await prisma.workstream.findMany({ select: { id: true, code: true } })).map((w) => [w.code, w.id]),
  );
  const sourceByExternalId = new Map(
    (await prisma.sourceDocument.findMany({ select: { id: true, externalId: true } })).map((s) => [s.externalId, s.id]),
  );

  await prisma.phase.createMany({
    data: PHASES.map(([code, name, purpose, startDate, endDate, status, confidence, traceRef], sortOrder) => ({
      id: code,
      programmeId: programme.id,
      code,
      name,
      purpose,
      status: enumValue(PhaseStatus, status, PhaseStatus.NOT_STARTED),
      startDate,
      endDate,
      sortOrder,
      confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
      traceRef,
    })),
    skipDuplicates: true,
  });

  await prisma.deliverable.createMany({
    data: DELIVERABLES.map(
      ([externalId, phaseCode, workstreamCode, name, description, ownerText, startDate, dueDate, status, rag, acceptanceCriteria, approvalRequirement, evidenceRequired, traceRef]) => ({
        id: externalId,
        externalId,
        programmeId: programme.id,
        phaseId: null,
        workstreamId: workstreamByCode.get(workstreamCode) ?? null,
        name,
        description,
        ownerText,
        startDate,
        dueDate,
        status: enumValue(DeliverableStatus, status, DeliverableStatus.NOT_STARTED),
        rag: enumValue(Rag, rag, Rag.AMBER),
        acceptanceCriteria,
        approvalRequirement,
        evidenceRequired,
        confidence: confidenceFromTrace(traceRef),
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
      }),
    ),
    skipDuplicates: true,
  });

  await prisma.task.createMany({
    data: WBS_TASKS.map(
      ([externalId, phaseCode, workstreamCode, deliverableExternalId, parentExternalId, title, ownerText, baselineStartDate, baselineEndDate, status, rag, percentComplete, critical, priority, acceptanceCriteria, traceRef, confidence], sortOrder) => ({
        id: externalId,
        externalId,
        programmeId: programme.id,
        phaseId: null,
        workstreamId: workstreamByCode.get(workstreamCode) ?? null,
        deliverableId: null,
        parentTaskId: parentExternalId,
        title,
        status: enumValue(TaskStatus, status, TaskStatus.NOT_STARTED),
        priority: enumValue(Priority, priority, Priority.MEDIUM),
        rag: enumValue(Rag, rag, Rag.AMBER),
        percentComplete,
        baselineStartDate,
        baselineEndDate,
        forecastStartDate: baselineStartDate,
        forecastEndDate: baselineEndDate,
        ownerText,
        acceptanceCriteria,
        confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
        criticalPath: critical === "Y",
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
        sortOrder,
      }),
    ),
    skipDuplicates: true,
  });

  const taskIdByExternalId = new Map(
    (await prisma.task.findMany({ select: { id: true, externalId: true } }))
      .filter((task) => task.externalId)
      .map((task) => [task.externalId!, task.id]),
  );

  for (const [predecessorTaskId, successorTaskId, dependencyType, lagDays, notes] of TASK_DEPENDENCIES) {
    const predecessorId = taskIdByExternalId.get(predecessorTaskId);
    const successorId = taskIdByExternalId.get(successorTaskId);
    if (!predecessorId || !successorId) continue;

    await prisma.taskDependency.upsert({
      where: { predecessorTaskId_successorTaskId: { predecessorTaskId: predecessorId, successorTaskId: successorId } },
      update: { dependencyType, lagDays, notes },
      create: {
        id: `${predecessorTaskId}-${successorTaskId}`,
        predecessorTaskId: predecessorId,
        successorTaskId: successorId,
        dependencyType,
        lagDays,
        notes,
      },
    });
  }

  for (const [
    externalId,
    name,
    workstreamCode,
    deliverableId,
    taskId,
    criteria,
    evidenceRequired,
    ownerText,
    status,
    rag,
    decisionRequired,
    blockingIssues,
    dueDate,
    traceRef,
    confidence,
  ] of READINESS_GATES) {
    await prisma.readinessGate.upsert({
      where: { externalId },
      update: {
        programmeId: programme.id,
        workstreamId: workstreamByCode.get(workstreamCode) ?? null,
        deliverableId: null,
        taskId: null,
        name,
        category: name,
        criteria,
        evidenceRequired,
        ownerText,
        status: enumValue(ReadinessGateStatus, status, ReadinessGateStatus.NOT_STARTED),
        rag: enumValue(Rag, rag, Rag.AMBER),
        decisionRequired,
        blockingIssues,
        dueDate,
        confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
      },
      create: {
        id: externalId,
        externalId,
        programmeId: programme.id,
        workstreamId: workstreamByCode.get(workstreamCode) ?? null,
        deliverableId: null,
        taskId: null,
        name,
        category: name,
        criteria,
        evidenceRequired,
        ownerText,
        status: enumValue(ReadinessGateStatus, status, ReadinessGateStatus.NOT_STARTED),
        rag: enumValue(Rag, rag, Rag.AMBER),
        decisionRequired,
        blockingIssues,
        dueDate,
        confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
      },
    });

    await prisma.readinessCriterion.upsert({
      where: { id: `${externalId}-CRIT-001` },
      update: {
        description: criteria,
        evidenceRequired,
        status: enumValue(ReadinessGateStatus, status, ReadinessGateStatus.NOT_STARTED),
        ownerText,
        confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
      },
      create: {
        id: `${externalId}-CRIT-001`,
        readinessGateId: externalId,
        description: criteria,
        evidenceRequired,
        status: enumValue(ReadinessGateStatus, status, ReadinessGateStatus.NOT_STARTED),
        ownerText,
        confidence: enumValue(Confidence, confidence, Confidence.INFERRED),
      },
    });
  }

  for (const [
    externalId,
    type,
    name,
    purpose,
    cadence,
    scheduledDate,
    ownerText,
    requiredInputs,
    expectedOutputs,
    escalationPath,
    traceRef,
  ] of GOVERNANCE_MEETINGS) {
    await prisma.governanceMeeting.upsert({
      where: { externalId },
      update: {
        programmeId: programme.id,
        type: enumValue(GovernanceMeetingType, type, GovernanceMeetingType.WORKSTREAM_CHECKPOINT),
        name,
        purpose,
        cadence,
        scheduledDate,
        ownerText,
        requiredInputs,
        expectedOutputs,
        escalationPath,
        confidence: confidenceFromTrace(traceRef),
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
      },
      create: {
        id: externalId,
        externalId,
        programmeId: programme.id,
        type: enumValue(GovernanceMeetingType, type, GovernanceMeetingType.WORKSTREAM_CHECKPOINT),
        name,
        purpose,
        cadence,
        scheduledDate,
        ownerText,
        requiredInputs,
        expectedOutputs,
        escalationPath,
        confidence: confidenceFromTrace(traceRef),
        sourceDocumentId: sourceByExternalId.get(sourceFromTrace(traceRef) ?? "") ?? null,
        traceRef,
      },
    });
  }

  for (const [index, [entityType, entityId, kind, sourceExternalId, extractedText, traceRef, confidence]] of EVIDENCE_LINKS.entries()) {
    const id = `EV-${String(index + 1).padStart(3, "0")}-${entityType}-${entityId}`;
    await prisma.evidenceLink.upsert({
      where: { id },
      update: {
        kind: enumValue(EvidenceLinkKind, kind, EvidenceLinkKind.SUPPORTS),
        entityType,
        entityId,
        sourceDocumentId: sourceByExternalId.get(sourceExternalId) ?? null,
        deliverableId: null,
        taskId: null,
        readinessGateId: null,
        governanceMeetingId: null,
        extractedText,
        followUpRequired: kind === "GAP" || confidence === "REQUIRES_VALIDATION",
        confidence: enumValue(Confidence, confidence, Confidence.REQUIRES_VALIDATION),
        traceRef,
      },
      create: {
        id,
        kind: enumValue(EvidenceLinkKind, kind, EvidenceLinkKind.SUPPORTS),
        entityType,
        entityId,
        sourceDocumentId: sourceByExternalId.get(sourceExternalId) ?? null,
        deliverableId: null,
        taskId: null,
        readinessGateId: null,
        governanceMeetingId: null,
        extractedText,
        followUpRequired: kind === "GAP" || confidence === "REQUIRES_VALIDATION",
        confidence: enumValue(Confidence, confidence, Confidence.REQUIRES_VALIDATION),
        traceRef,
      },
    });
  }

  const counts = {
    phases: await prisma.phase.count(),
    deliverables: await prisma.deliverable.count(),
    tasks: await prisma.task.count(),
    taskDependencies: await prisma.taskDependency.count(),
    readinessGates: await prisma.readinessGate.count(),
    governanceMeetings: await prisma.governanceMeeting.count(),
    evidenceLinks: await prisma.evidenceLink.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
