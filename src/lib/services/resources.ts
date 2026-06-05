import { prisma } from "@/lib/db";

export type WorkloadFlag = "OVERLOADED" | "BALANCED" | "UNDERALLOCATED";

/**
 * Classifies a resource's total allocation percentage into a workload band.
 * >100 = overloaded, <50 = under-allocated, otherwise balanced.
 */
export function workloadFlag(totalAllocationPct: number): WorkloadFlag {
  if (totalAllocationPct > 100) return "OVERLOADED";
  if (totalAllocationPct < 50) return "UNDERALLOCATED";
  return "BALANCED";
}

export async function getResources() {
  const resources = await prisma.resource.findMany({
    orderBy: { displayName: "asc" },
    include: {
      person: { select: { id: true, displayName: true, email: true } },
      allocations: {
        orderBy: { allocationPct: "desc" },
      },
    },
  });

  // Resolve project names referenced by allocations in one round-trip.
  const projectIds = Array.from(
    new Set(
      resources
        .flatMap((r) => r.allocations.map((a) => a.projectId))
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const projects = projectIds.length
    ? await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true, code: true },
      })
    : [];
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return resources.map((resource) => {
    const totalAllocationPct = resource.allocations.reduce(
      (sum, a) => sum + (a.allocationPct ?? 0),
      0,
    );
    return {
      ...resource,
      allocations: resource.allocations.map((a) => ({
        ...a,
        projectName: a.projectId ? (projectMap.get(a.projectId)?.name ?? null) : null,
        projectCode: a.projectId ? (projectMap.get(a.projectId)?.code ?? null) : null,
      })),
      totalAllocationPct,
      allocationCount: resource.allocations.length,
      flag: workloadFlag(totalAllocationPct),
    };
  });
}

export type ResourceWithWorkload = Awaited<ReturnType<typeof getResources>>[number];

export async function getResource(id: string) {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      person: true,
      allocations: { orderBy: { allocationPct: "desc" } },
    },
  });
  if (!resource) return null;

  const projectIds = Array.from(
    new Set(resource.allocations.map((a) => a.projectId).filter((id): id is string => Boolean(id))),
  );
  const projects = projectIds.length
    ? await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true, code: true },
      })
    : [];
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const totalAllocationPct = resource.allocations.reduce(
    (sum, a) => sum + (a.allocationPct ?? 0),
    0,
  );

  return {
    ...resource,
    allocations: resource.allocations.map((a) => ({
      ...a,
      projectName: a.projectId ? (projectMap.get(a.projectId)?.name ?? null) : null,
      projectCode: a.projectId ? (projectMap.get(a.projectId)?.code ?? null) : null,
    })),
    totalAllocationPct,
    flag: workloadFlag(totalAllocationPct),
  };
}

export async function getResourceConstraints() {
  return prisma.resourceConstraint.findMany({ orderBy: { createdAt: "asc" } });
}

export type ResourceConstraintRecord = Awaited<
  ReturnType<typeof getResourceConstraints>
>[number];

export function summariseResources(resources: ResourceWithWorkload[]) {
  return {
    total: resources.length,
    overloaded: resources.filter((r) => r.flag === "OVERLOADED").length,
    underallocated: resources.filter((r) => r.flag === "UNDERALLOCATED").length,
    avgAllocation: resources.length
      ? Math.round(
          resources.reduce((sum, r) => sum + r.totalAllocationPct, 0) / resources.length,
        )
      : 0,
  };
}
