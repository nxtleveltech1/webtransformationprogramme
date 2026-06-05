import { prisma } from "@/lib/db";
import { hasTable } from "@/lib/services/schema-guards";

/**
 * Loads the time-phased data sources the roadmap renders. WBS tasks are the
 * authoritative Gantt feed; roadmap and critical-path rows are retained as
 * supporting programme views. Date columns are free-text strings, so parsing
 * happens client-side.
 */
export async function getTimelineData() {
  const [activities, criticalPath, milestones, tasks] = await Promise.all([
    prisma.roadmapActivity.findMany({ orderBy: { startDate: "asc" } }),
    prisma.criticalPathStep.findMany({ orderBy: { stepNumber: "asc" } }),
    prisma.milestone.findMany({
      orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
      include: {
        workstream: { select: { id: true, code: true, name: true } },
        project: { select: { id: true, code: true, name: true } },
      },
    }),
    hasTable("Task").then((exists) =>
      exists
        ? prisma.task.findMany({
            orderBy: [{ sortOrder: "asc" }, { externalId: "asc" }],
            include: {
              workstream: { select: { name: true } },
              ownerPerson: { select: { displayName: true, surname: true } },
              deliverable: { select: { externalId: true, name: true } },
            },
          })
        : [],
    ),
  ]);

  return { activities, criticalPath, milestones, tasks };
}
