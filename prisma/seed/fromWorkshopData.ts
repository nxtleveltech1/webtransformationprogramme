import {
  PrismaClient,
  ProgrammeStatus,
  WorkshopStatus,
  MetricCategory,
} from "@prisma/client";
import {
  getOrCreatePerson,
  resolveOwnerPersonId,
  mapActionStatus,
  mapDecisionStatus,
  mapDependencyStatus,
  mapImpact,
  mapIssueStatus,
  mapPriority,
  mapProbability,
  mapRiskCategory,
  parseTraceDaySession,
  resolveSourceId,
} from "./utils";
import { seedSources } from "./sources";
import {
  ACTIONS,
  CRITICAL_PATH,
  DECISIONS,
  DEPENDENCIES,
  GOVERNANCE,
  ISSUES,
  OVERVIEW_JOURNEYS,
  RISKS,
  ROADMAP_ROWS,
  STREAM_INPUTS,
  TRADEOFFS,
  WORKSTREAMS,
} from "./workshop-data.generated";

export type SeedContext = {
  prisma: PrismaClient;
  programmeId: string;
  workshopId: string;
  day1Id: string;
  day2Id: string;
};

export async function seedCoreData(prisma: PrismaClient): Promise<SeedContext> {
  const programme = await prisma.programme.create({
    data: {
      name: "Old Mutual Web Transformation / Migration Programme",
      purpose:
        "Migrate country/business websites and secure-web journeys to Contentstack; uplift CX; decommission legacy platform.",
      scopeTension:
        "Is this a content migration, a web transformation, or a bounded hybrid?",
      hardDeadline: "End of November 2026",
      pageBaseline: 1530,
      mvpSummary: "New navigation (4 audiences) + secure web IA",
      status: ProgrammeStatus.ACTIVE,
    },
  });

  const workshop = await prisma.workshopEvent.create({
    data: {
      programmeId: programme.id,
      title: "Web Transformation — Two-Day Planning Workshop",
      location: "Cape Town (in-person + Teams)",
      startDate: new Date("2026-06-02"),
      endDate: new Date("2026-06-03"),
      status: WorkshopStatus.IN_PROGRESS,
    },
  });

  const day1 = await prisma.workshopDay.create({
    data: {
      workshopId: workshop.id,
      dayNumber: 1,
      date: new Date("2026-06-02"),
      theme: "Day 1 — scope, workstreams, RAID",
    },
  });
  const day2 = await prisma.workshopDay.create({
    data: {
      workshopId: workshop.id,
      dayNumber: 2,
      date: new Date("2026-06-03"),
      theme: "Day 2 — delivery re-baseline, resourcing, readiness",
    },
  });

  const platformMetrics = [
    "Analytics coverage",
    "Commercialisation / tenant onboarding",
    "Design system compliance",
    "Availability",
    "Page load < 3 seconds",
    "Automated deployment pipelines",
    "Code scanning for quality",
  ];
  const customerMetrics = [
    "Increase organic traffic",
    "Increase session duration",
    "Customer satisfaction (NPS)",
    "Friction reduction",
    "Active digital users",
  ];
  for (const name of platformMetrics) {
    await prisma.successMetric.create({
      data: { programmeId: programme.id, name, category: MetricCategory.PLATFORM, confirmed: true },
    });
  }
  for (const name of customerMetrics) {
    await prisma.successMetric.create({
      data: { programmeId: programme.id, name, category: MetricCategory.CUSTOMER, confirmed: true },
    });
  }

  await prisma.scopeOption.create({
    data: {
      programmeId: programme.id,
      name: "Tactical navigation-only",
      description: "Navigation-only across all sites to hit timeline",
      status: "Open",
    },
  });
  await prisma.scopeOption.create({
    data: {
      programmeId: programme.id,
      name: "Full transformation",
      description: "Full scope to ~2027",
      status: "Open",
    },
  });

  for (let i = 0; i < WORKSTREAMS.length; i++) {
    const [code, name, primaryLead, leadText] = WORKSTREAMS[i];
    const leadId = primaryLead ? await getOrCreatePerson(prisma, primaryLead) : null;
    await prisma.workstream.create({
      data: {
        programmeId: programme.id,
        code,
        name,
        leadPersonId: leadId,
        leadText: leadText ?? null,
        sortOrder: i,
      },
    });
  }

  await seedSources(prisma, workshop.id);

  for (const row of DECISIONS) {
    const [id, item, title, desc, owner, req, status, due, trace] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const { day, session, sourceId } = parseTraceDaySession(trace);
    await prisma.decision.create({
      data: {
        externalId: id,
        category: item,
        title,
        description: desc,
        status: mapDecisionStatus(status),
        ownerText: owner,
        ownerPersonId: await resolveOwnerPersonId(prisma, owner),
        requiredDecision: req,
        dueDate: due,
        traceRef: trace,
        workshopDay: day,
        sessionRef: session,
        sourceDocumentId: await resolveSourceId(prisma, sourceId),
      },
    });
  }

  for (const row of TRADEOFFS) {
    const [id, cat, dim, opts, owner, needed, status, due, trace] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.tradeoff.create({
      data: {
        externalId: id,
        category: cat,
        dimension: dim,
        optionsText: opts,
        ownerText: owner,
        decisionNeeded: needed,
        status,
        dueDate: due,
        traceRef: trace,
      },
    });
  }

  for (const row of ACTIONS) {
    const [num, area, ws, pri, desc, owner, due, status, related, trace] = row as unknown as [
      number,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    const extId = `ACT-${String(num).padStart(3, "0")}`;
    const { day, session, sourceId } = parseTraceDaySession(trace);
    await prisma.action.create({
      data: {
        externalId: extId,
        area,
        description: desc,
        priority: mapPriority(pri),
        status: mapActionStatus(status),
        ownerText: owner,
        ownerPersonId: await resolveOwnerPersonId(prisma, owner),
        teamText: ws,
        dueDate: due,
        relatedRefs: related,
        traceRef: trace,
        workshopDay: day,
        sessionRef: session,
        sourceDocumentId: await resolveSourceId(prisma, sourceId),
      },
    });
  }

  for (const row of RISKS) {
    const [id, desc, cat, prob, imp, owner, mit, due, status] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.risk.create({
      data: {
        externalId: id,
        description: desc,
        category: mapRiskCategory(cat),
        probability: mapProbability(prob),
        impact: mapImpact(imp),
        ownerText: owner,
        ownerPersonId: await resolveOwnerPersonId(prisma, owner),
        mitigationRequired: mit,
        dueDate: due,
        status,
      },
    });
  }

  for (const row of ISSUES) {
    const [id, desc, impact, teams, owner, resolution, due, status] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.issue.create({
      data: {
        externalId: id,
        description: desc,
        currentImpact: impact,
        affectedTeams: teams,
        ownerText: owner,
        ownerPersonId: await resolveOwnerPersonId(prisma, owner),
        resolutionRequired: resolution,
        targetResolutionDate: due,
        status: mapIssueStatus(status),
      },
    });
  }

  for (const row of DEPENDENCIES) {
    const [id, stream, desc, owner, reqDate, delayRisk, mit, escalation, status] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.dependency.create({
      data: {
        externalId: id,
        streamText: stream,
        description: desc,
        ownerText: owner,
        requiredDate: reqDate,
        delayRisk,
        escalation,
        status: mapDependencyStatus(status),
      },
    });
  }

  for (const row of CRITICAL_PATH) {
    const [step, activity, owner, pred, due, status, critical, refs] = row as unknown as [
      number,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.criticalPathStep.create({
      data: {
        stepNumber: step,
        activity,
        ownerText: owner,
        predecessor: pred,
        dueDate: due,
        status,
        isCritical: critical === "Y",
        traceRef: refs,
      },
    });
  }

  for (const row of ROADMAP_ROWS) {
    const [ws, activity, owner, start, end, dep, status, notes] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.roadmapActivity.create({
      data: { workstream: ws, activity, ownerText: owner, startDate: start, endDate: end, dependency: dep, status, notes },
    });
  }

  for (const row of GOVERNANCE) {
    const [name, purpose, chair, members, cadence, inputs, outputs, escalation] = row as unknown as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    await prisma.governanceForum.create({
      data: { name, purpose, chair, members, cadence, inputs, outputs, escalation },
    });
  }

  for (const row of OVERVIEW_JOURNEYS) {
    const [name, area, cluster, notes] = row as unknown as [string, string, string, string];
    await prisma.customerJourney.create({ data: { name, businessArea: area, cluster, notes, traceRef: notes } });
  }

  for (const row of STREAM_INPUTS) {
    const [ws, lead, artefact, ask, start, end, dep, risk, readiness] = row as unknown as [
      string,
      string,
      string,
      string,
      string | null,
      string | null,
      string | null,
      string,
      string,
    ];
    await prisma.streamInput.create({
      data: {
        workstream: ws,
        leadText: lead,
        artefact,
        ask,
        startDate: start ?? undefined,
        endDate: end ?? undefined,
        dependency: dep ?? undefined,
        riskRef: risk,
        readiness,
      },
    });
  }

  return { prisma, programmeId: programme.id, workshopId: workshop.id, day1Id: day1.id, day2Id: day2.id };
}
