import { prisma } from "@/lib/db";

/** All projects for the list view, with the relations the table renders. */
export function listProjects() {
  return prisma.project.findMany({
    orderBy: [{ priority: "asc" }, { name: "asc" }],
    include: {
      ownerPerson: { select: { id: true, displayName: true } },
      workstream: { select: { id: true, code: true, name: true } },
      programme: { select: { id: true, name: true } },
      _count: {
        select: {
          milestones: true,
          deliverables: true,
          actions: true,
          risks: true,
          issues: true,
          dependencies: true,
          documents: true,
        },
      },
    },
  });
}

/** Single project with every tab's relations pre-loaded. */
export function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      ownerPerson: { select: { id: true, displayName: true } },
      workstream: { select: { id: true, code: true, name: true } },
      programme: { select: { id: true, name: true } },
      milestones: { orderBy: { targetDate: "asc" } },
      deliverables: {
        orderBy: { dueDate: "asc" },
        include: { ownerPerson: { select: { id: true, displayName: true } } },
      },
      actions: {
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
        include: { ownerPerson: { select: { id: true, displayName: true } } },
      },
      risks: {
        orderBy: { updatedAt: "desc" },
        include: { ownerPerson: { select: { id: true, displayName: true } } },
      },
      issues: {
        orderBy: { updatedAt: "desc" },
        include: { ownerPerson: { select: { id: true, displayName: true } } },
      },
      dependencies: { orderBy: { updatedAt: "desc" } },
      documents: {
        orderBy: { updatedAt: "desc" },
        include: { ownerPerson: { select: { id: true, displayName: true } } },
      },
    },
  });
}

/** Audit trail scoped to a single project. */
export function getProjectActivity(projectId: string) {
  return prisma.auditEvent.findMany({
    where: { entityType: "Project", entityId: projectId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Workstream options for the project create / edit form. */
export function getWorkstreamOptions() {
  return prisma.workstream.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, code: true, name: true },
  });
}

/** Programme options (usually a single programme). */
export function getProgrammeOptions() {
  return prisma.programme.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
}
