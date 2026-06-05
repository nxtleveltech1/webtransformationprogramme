import { prisma } from "@/lib/db";

/** Workstream list with lead + rollup counts. */
export function listWorkstreams() {
  return prisma.workstream.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      leadPerson: { select: { id: true, displayName: true, surname: true } },
      programme: { select: { id: true, name: true } },
      _count: {
        select: {
          projects: true,
          actions: true,
          risks: true,
          dependencies: true,
          milestones: true,
        },
      },
    },
  });
}

/** Single workstream with its associated delivery items. */
export function getWorkstream(id: string) {
  return prisma.workstream.findUnique({
    where: { id },
    include: {
      leadPerson: { select: { id: true, displayName: true, surname: true } },
      programme: { select: { id: true, name: true } },
      projects: {
        orderBy: { name: "asc" },
        include: { ownerPerson: { select: { id: true, displayName: true, surname: true } } },
      },
      actions: {
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
        include: { ownerPerson: { select: { id: true, displayName: true, surname: true } } },
      },
      risks: {
        orderBy: { updatedAt: "desc" },
        include: { ownerPerson: { select: { id: true, displayName: true, surname: true } } },
      },
      dependencies: { orderBy: { updatedAt: "desc" } },
      milestones: { orderBy: { targetDate: "asc" } },
    },
  });
}
