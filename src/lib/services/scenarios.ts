import { prisma } from "@/lib/db";
import { hasTable } from "@/lib/services/schema-guards";
import {
  computeCpm,
  taskDurationDays,
  type CpmDependencyInput,
  type CpmTaskInput,
} from "@/lib/services/cpm";

export interface ScenarioImpact {
  /** Programme duration in whole days on the live baseline schedule. */
  baselineDays: number;
  /** Programme duration in whole days under the scenario's what-if changes. */
  scenarioDays: number;
  /** scenarioDays - baselineDays. Positive = later finish (slip). */
  deltaDays: number;
  /** Count of task changes that actually altered a duration the CPM used. */
  taskChanges: number;
  /** Count of milestone changes (informational — outside the CPM graph). */
  milestoneChanges: number;
  /** Whether the baseline schedule had any usable durations to compute on. */
  computable: boolean;
}

export interface ScenarioChangeRow {
  id: string;
  targetType: "TASK" | "MILESTONE";
  targetId: string;
  targetLabel: string | null;
  deltaDays: number;
  note: string | null;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  changeCount: number;
  impact: ScenarioImpact;
  updatedAt: Date;
}

export interface ScenarioDetail extends ScenarioSummary {
  changes: ScenarioChangeRow[];
}

export interface ScenarioTargetOption {
  id: string;
  label: string;
  meta: string | null;
}

/**
 * Loads the live baseline schedule (tasks + dependencies) once, so any number of
 * scenarios can be costed against the same baseline CPM.
 */
async function loadBaseline(): Promise<{
  taskInputs: CpmTaskInput[];
  depInputs: CpmDependencyInput[];
  baselineDays: number;
}> {
  const hasTasks = await hasTable("Task");
  const hasDeps = await hasTable("TaskDependency");
  if (!hasTasks) {
    return { taskInputs: [], depInputs: [], baselineDays: 0 };
  }

  const [tasks, dependencies] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ sortOrder: "asc" }, { externalId: "asc" }],
      select: {
        id: true,
        externalId: true,
        title: true,
        status: true,
        percentComplete: true,
        criticalPath: true,
        baselineStartDate: true,
        baselineEndDate: true,
        forecastStartDate: true,
        forecastEndDate: true,
        durationDays: true,
        workstream: { select: { name: true } },
      },
    }),
    hasDeps
      ? prisma.taskDependency.findMany({
          select: {
            id: true,
            predecessorTaskId: true,
            successorTaskId: true,
            dependencyType: true,
            lagDays: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const taskInputs: CpmTaskInput[] = tasks.map((t) => ({
    id: t.id,
    externalId: t.externalId,
    title: t.title,
    status: t.status,
    percentComplete: t.percentComplete,
    flaggedCritical: t.criticalPath,
    baselineStartDate: t.baselineStartDate,
    baselineEndDate: t.baselineEndDate,
    forecastStartDate: t.forecastStartDate,
    forecastEndDate: t.forecastEndDate,
    durationDays: t.durationDays,
    workstreamName: t.workstream?.name ?? null,
  }));

  const depInputs: CpmDependencyInput[] = dependencies.map((d) => ({
    id: d.id,
    predecessorTaskId: d.predecessorTaskId,
    successorTaskId: d.successorTaskId,
    dependencyType: d.dependencyType,
    lagDays: d.lagDays,
  }));

  const baselineDays = computeCpm(taskInputs, depInputs).projectDurationDays;
  return { taskInputs, depInputs, baselineDays };
}

/**
 * Recompute the programme end date under a scenario's changes. Task changes
 * adjust the task's duration (the unit the CPM schedules on); milestone changes
 * are tracked separately because milestones sit outside the task dependency
 * graph and so do not move the computed critical path.
 */
function computeImpact(
  baseline: { taskInputs: CpmTaskInput[]; depInputs: CpmDependencyInput[]; baselineDays: number },
  changes: ScenarioChangeRow[],
): ScenarioImpact {
  const deltaByTask = new Map<string, number>();
  let milestoneChanges = 0;
  for (const c of changes) {
    if (c.targetType === "TASK") {
      deltaByTask.set(c.targetId, (deltaByTask.get(c.targetId) ?? 0) + c.deltaDays);
    } else {
      milestoneChanges += 1;
    }
  }

  const adjusted = baseline.taskInputs.map((t) => {
    const delta = deltaByTask.get(t.id) ?? 0;
    if (delta === 0) return t;
    const adj = Math.max(0, taskDurationDays(t) + delta);
    // Pin the adjusted duration via durationDays and clear date pairs so the CPM
    // uses our what-if length rather than re-deriving from the live dates.
    return {
      ...t,
      baselineStartDate: null,
      baselineEndDate: null,
      forecastStartDate: null,
      forecastEndDate: null,
      durationDays: adj,
    } satisfies CpmTaskInput;
  });

  const scenarioDays = computeCpm(adjusted, baseline.depInputs).projectDurationDays;

  return {
    baselineDays: baseline.baselineDays,
    scenarioDays,
    deltaDays: scenarioDays - baseline.baselineDays,
    taskChanges: deltaByTask.size,
    milestoneChanges,
    computable: baseline.baselineDays > 0,
  };
}

export async function getScenarios(): Promise<ScenarioDetail[]> {
  if (!(await hasTable("Scenario"))) return [];
  const baseline = await loadBaseline();
  const scenarios = await prisma.scenario.findMany({
    orderBy: { updatedAt: "desc" },
    include: { changes: { orderBy: { createdAt: "asc" } } },
  });

  return scenarios.map((s) => {
    const changes: ScenarioChangeRow[] = s.changes.map((c) => ({
      id: c.id,
      targetType: c.targetType,
      targetId: c.targetId,
      targetLabel: c.targetLabel,
      deltaDays: c.deltaDays,
      note: c.note,
    }));
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      status: s.status,
      changeCount: s.changes.length,
      impact: computeImpact(baseline, changes),
      updatedAt: s.updatedAt,
      changes,
    };
  });
}

export async function getScenarioDetail(id: string): Promise<ScenarioDetail | null> {
  if (!(await hasTable("Scenario"))) return null;
  const scenario = await prisma.scenario.findUnique({
    where: { id },
    include: { changes: { orderBy: { createdAt: "asc" } } },
  });
  if (!scenario) return null;

  const baseline = await loadBaseline();
  const changes: ScenarioChangeRow[] = scenario.changes.map((c) => ({
    id: c.id,
    targetType: c.targetType,
    targetId: c.targetId,
    targetLabel: c.targetLabel,
    deltaDays: c.deltaDays,
    note: c.note,
  }));

  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    status: scenario.status,
    changeCount: changes.length,
    impact: computeImpact(baseline, changes),
    updatedAt: scenario.updatedAt,
    changes,
  };
}

/** Tasks + milestones a scenario change can target, for the picker UI. */
export async function getScenarioTargets(): Promise<{
  tasks: ScenarioTargetOption[];
  milestones: ScenarioTargetOption[];
}> {
  const [hasTasks, hasMilestones] = await Promise.all([
    hasTable("Task"),
    hasTable("Milestone"),
  ]);

  const [tasks, milestones] = await Promise.all([
    hasTasks
      ? prisma.task.findMany({
          orderBy: [{ sortOrder: "asc" }, { externalId: "asc" }],
          select: {
            id: true,
            externalId: true,
            title: true,
            workstream: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    hasMilestones
      ? prisma.milestone.findMany({
          orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            targetDate: true,
            workstream: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    tasks: tasks.map((t) => ({
      id: t.id,
      label: t.externalId ? `${t.externalId} · ${t.title}` : t.title,
      meta: t.workstream?.name ?? null,
    })),
    milestones: milestones.map((m) => ({
      id: m.id,
      label: m.title,
      meta: m.targetDate ?? m.workstream?.name ?? null,
    })),
  };
}
