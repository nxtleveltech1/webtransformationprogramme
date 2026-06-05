import { prisma } from "@/lib/db";

/**
 * Loads the programme singleton plus the summary data the Programme Workspace
 * renders. Returns `null` when no programme has been seeded.
 */
export async function getProgrammeWorkspace() {
  const programme = await prisma.programme.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      metrics: { orderBy: { name: "asc" } },
      scopeOptions: { orderBy: { createdAt: "asc" } },
      workstreams: {
        orderBy: { sortOrder: "asc" },
        include: {
          leadPerson: { select: { id: true, displayName: true, surname: true } },
          _count: { select: { projects: true, actions: true, risks: true } },
        },
      },
      projects: {
        orderBy: { name: "asc" },
        include: {
          ownerPerson: { select: { id: true, displayName: true, surname: true } },
          workstream: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });

  if (!programme) return null;

  const programmeId = programme.id;
  const workstreamIds = programme.workstreams.map((w) => w.id);
  const projectIds = programme.projects.map((p) => p.id);

  const [
    riskCount,
    issueCount,
    dependencyCount,
    openActionCount,
    decisions,
    forums,
    resourceConstraints,
  ] = await Promise.all([
    prisma.risk.count({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { workstreamId: { in: workstreamIds } },
        ],
        status: { notIn: ["Closed", "Resolved", "Mitigated"] },
      },
    }),
    prisma.issue.count({
      where: { projectId: { in: projectIds }, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.dependency.count({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { workstreamId: { in: workstreamIds } },
        ],
        status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED", "AT_RISK"] },
      },
    }),
    prisma.action.count({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { workstreamId: { in: workstreamIds } },
        ],
        status: { notIn: ["DONE"] },
      },
    }),
    prisma.decision.findMany({
      where: { workstreamId: { in: workstreamIds } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        externalId: true,
        title: true,
        description: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.governanceForum.findMany({ orderBy: { name: "asc" } }),
    prisma.resourceConstraint.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return {
    programme,
    counts: {
      workstreams: programme.workstreams.length,
      projects: programme.projects.length,
      risks: riskCount,
      issues: issueCount,
      dependencies: dependencyCount,
      openActions: openActionCount,
      metrics: programme.metrics.length,
    },
    decisions,
    forums,
    resourceConstraints,
    programmeId,
  };
}

/** People list for owner / lead selects. */
export function getPeopleOptions() {
  return prisma.person.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true, roleDescription: true },
  });
}
