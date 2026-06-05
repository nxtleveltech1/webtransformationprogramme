"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import {
  taskCreateSchema,
  taskStatusSchema,
  taskUpdateSchema,
} from "@/lib/validation/tasks";

async function nextActionExternalId(): Promise<string> {
  const rows = await prisma.action.findMany({
    where: { externalId: { startsWith: "ACT-" } },
    select: { externalId: true },
  });
  let max = 0;
  for (const { externalId } of rows) {
    const n = Number.parseInt(externalId.replace(/^ACT-/, ""), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `ACT-${String(max + 1).padStart(3, "0")}`;
}

export async function createTask(input: unknown) {
  const parsed = parseInput(taskCreateSchema, input);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const externalId = d.externalId?.trim() || (await nextActionExternalId());
  const existing = await prisma.action.findUnique({ where: { externalId } });
  if (existing) return fail(`An action with ID ${externalId} already exists.`);

  const action = await prisma.action.create({
    data: {
      externalId,
      description: d.description,
      area: d.area || null,
      priority: d.priority,
      status: d.status,
      ownerPersonId: d.ownerPersonId || null,
      ownerText: d.ownerText || null,
      dueDate: d.dueDate || null,
      workstreamId: d.workstreamId || null,
      notes: d.notes || null,
      acceptanceCriteria: d.acceptanceCriteria || null,
      expectedOutput: d.expectedOutput || null,
    },
  });

  await writeAudit({
    entityType: "Action",
    entityId: action.id,
    action: "create",
    payload: { externalId, status: action.status, priority: action.priority },
  });
  revalidatePath("/tasks");
  revalidateWorkstreamViews(action.workstreamId);
  return ok({ id: action.id }, `Task ${externalId} created`);
}

export async function updateTask(input: unknown) {
  const parsed = parseInput(taskUpdateSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, externalId: _externalId, ...d } = parsed.data;

  const action = await prisma.action.update({
    where: { id },
    data: {
      description: d.description,
      area: d.area || null,
      priority: d.priority,
      status: d.status,
      ownerPersonId: d.ownerPersonId || null,
      ownerText: d.ownerText || null,
      dueDate: d.dueDate || null,
      workstreamId: d.workstreamId || null,
      notes: d.notes || null,
      acceptanceCriteria: d.acceptanceCriteria || null,
      expectedOutput: d.expectedOutput || null,
    },
  });

  await writeAudit({
    entityType: "Action",
    entityId: action.id,
    action: "update",
    payload: { status: action.status, priority: action.priority },
  });
  revalidatePath("/tasks");
  revalidateWorkstreamViews(action.workstreamId);
  return ok({ id: action.id }, `Task ${action.externalId} updated`);
}

export async function updateTaskStatus(input: unknown) {
  const parsed = parseInput(taskStatusSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, status } = parsed.data;

  const action = await prisma.action.update({
    where: { id },
    data: { status },
  });

  await writeAudit({
    entityType: "Action",
    entityId: action.id,
    action: "status-change",
    payload: { status },
  });
  revalidatePath("/tasks");
  revalidateWorkstreamViews(action.workstreamId);
  return ok({ id: action.id }, `Status set to ${status.replace(/_/g, " ")}`);
}

export async function completeTask(input: unknown) {
  return updateTaskStatus({
    id: typeof input === "object" && input ? (input as { id?: unknown }).id : input,
    status: "DONE",
  });
}
