"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import { ok, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  type CreateMilestoneInput,
} from "@/lib/validation/milestones";

function buildData(
  data: Omit<CreateMilestoneInput, never>,
): Prisma.MilestoneUncheckedCreateInput {
  return {
    title: data.title,
    targetDate: data.targetDate ?? null,
    piGate: data.piGate ?? null,
    status: data.status ?? null,
    varianceDays: data.varianceDays ?? null,
    notes: data.notes ?? null,
    workstreamId: data.workstreamId ?? null,
    projectId: data.projectId ?? null,
  };
}

export async function createMilestone(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(createMilestoneSchema, input);
  if (!parsed.success) return parsed.result;

  const milestone = await prisma.milestone.create({ data: buildData(parsed.data) });

  await writeAudit({
    entityType: "Milestone",
    entityId: milestone.id,
    action: "create",
    payload: { title: milestone.title, targetDate: milestone.targetDate },
  });
  revalidatePath("/milestones");
  revalidatePath("/timeline");
  revalidateWorkstreamViews(milestone.workstreamId);
  return ok(milestone, "Milestone created");
}

export async function updateMilestone(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(updateMilestoneSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...rest } = parsed.data;
  const milestone = await prisma.milestone.update({ where: { id }, data: buildData(rest) });

  await writeAudit({
    entityType: "Milestone",
    entityId: milestone.id,
    action: "update",
    payload: rest,
  });
  revalidatePath("/milestones");
  revalidatePath("/timeline");
  revalidateWorkstreamViews(milestone.workstreamId);
  return ok(milestone, "Milestone updated");
}
