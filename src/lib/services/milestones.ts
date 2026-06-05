import { prisma } from "@/lib/db";

/** Milestone list with workstream + project context. */
export function listMilestones() {
  return prisma.milestone.findMany({
    orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
    include: {
      workstream: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, code: true, name: true } },
    },
  });
}

/** Workstream + project options for the milestone form. */
export async function getMilestoneFormOptions() {
  const [workstreams, projects] = await Promise.all([
    prisma.workstream.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.project.findMany({
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);
  return { workstreams, projects };
}
