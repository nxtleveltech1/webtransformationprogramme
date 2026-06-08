"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import { ok, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  criticalPathStepUpdateSchema,
  roadmapActivityUpdateSchema,
  wbsTaskUpdateSchema,
} from "@/lib/validation/schedule";

/**
 * Edits the schedule entities plotted on the Gantt (Gantt / Roadmap page). Each
 * action revalidates the timeline plus the entity's own register so the change
 * is reflected everywhere it is read.
 */
export async function updateWbsTask(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(wbsTaskUpdateSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...d } = parsed.data;
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description ?? null,
      status: d.status,
      priority: d.priority,
      rag: d.rag ?? null,
      percentComplete: d.percentComplete ?? 0,
      baselineStartDate: d.baselineStartDate ?? null,
      baselineEndDate: d.baselineEndDate ?? null,
      forecastStartDate: d.forecastStartDate ?? null,
      forecastEndDate: d.forecastEndDate ?? null,
      durationDays: d.durationDays ?? null,
      ownerPersonId: d.ownerPersonId ?? null,
      ownerText: d.ownerText ?? null,
      workstreamId: d.workstreamId ?? null,
      blockers: d.blockers ?? null,
      acceptanceCriteria: d.acceptanceCriteria ?? null,
      criticalPath: d.criticalPath,
    },
  });

  await writeAudit({
    entityType: "Task",
    entityId: task.id,
    action: "update",
    payload: { status: task.status, percentComplete: task.percentComplete },
  });
  revalidatePath("/timeline");
  revalidatePath("/wbs");
  revalidateWorkstreamViews(task.workstreamId);
  return ok({ id: task.id }, `${task.externalId} updated`);
}

export async function updateCriticalPathStep(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(criticalPathStepUpdateSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...d } = parsed.data;
  const step = await prisma.criticalPathStep.update({
    where: { id },
    data: {
      activity: d.activity,
      ownerText: d.ownerText ?? null,
      predecessor: d.predecessor ?? null,
      dueDate: d.dueDate ?? null,
      status: d.status ?? null,
      isCritical: d.isCritical,
    },
  });

  await writeAudit({
    entityType: "CriticalPathStep",
    entityId: step.id,
    action: "update",
    payload: { status: step.status },
  });
  revalidatePath("/timeline");
  revalidatePath("/critical-path");
  return ok({ id: step.id }, `Step ${step.stepNumber} updated`);
}

export async function updateRoadmapActivity(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(roadmapActivityUpdateSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...d } = parsed.data;
  const activity = await prisma.roadmapActivity.update({
    where: { id },
    data: {
      workstream: d.workstream ?? null,
      activity: d.activity,
      ownerText: d.ownerText ?? null,
      startDate: d.startDate ?? null,
      endDate: d.endDate ?? null,
      dependency: d.dependency ?? null,
      status: d.status ?? null,
      notes: d.notes ?? null,
    },
  });

  await writeAudit({
    entityType: "RoadmapActivity",
    entityId: activity.id,
    action: "update",
    payload: { status: activity.status },
  });
  revalidatePath("/timeline");
  return ok({ id: activity.id }, "Activity updated");
}
