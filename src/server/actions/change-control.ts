"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import {
  changeRequestCreateSchema,
  changeRequestDecisionSchema,
  changeRequestStatusSchema,
  changeRequestUpdateSchema,
} from "@/lib/validation/change-control";

async function nextChangeRequestExternalId(): Promise<string> {
  const rows = await prisma.changeRequest.findMany({
    where: { externalId: { startsWith: "CR-" } },
    select: { externalId: true },
  });
  let max = 0;
  for (const { externalId } of rows) {
    const n = Number.parseInt(externalId.replace(/^CR-/, ""), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `CR-${String(max + 1).padStart(3, "0")}`;
}

export async function createChangeRequest(input: unknown) {
  const parsed = parseInput(changeRequestCreateSchema, input);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const externalId = await nextChangeRequestExternalId();
  const cr = await prisma.changeRequest.create({
    data: {
      externalId,
      title: d.title,
      description: d.description,
      projectId: d.projectId || null,
      impactAssessment: d.impactAssessment || null,
      priority: d.priority,
      status: d.status ?? "SUBMITTED",
      requestedBy: d.requestedBy || null,
      approverPersonId: d.approverPersonId || null,
      implementationStatus: d.implementationStatus || null,
    },
  });

  await writeAudit({
    entityType: "ChangeRequest",
    entityId: cr.id,
    action: "create",
    payload: { externalId, status: cr.status, priority: cr.priority },
  });
  revalidatePath("/change-control");
  return ok({ id: cr.id }, `Change request ${externalId} submitted`);
}

export async function updateChangeRequest(input: unknown) {
  const parsed = parseInput(changeRequestUpdateSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, status, ...d } = parsed.data;

  const cr = await prisma.changeRequest.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description,
      projectId: d.projectId || null,
      impactAssessment: d.impactAssessment || null,
      priority: d.priority,
      ...(status ? { status } : {}),
      requestedBy: d.requestedBy || null,
      approverPersonId: d.approverPersonId || null,
      implementationStatus: d.implementationStatus || null,
    },
  });

  await writeAudit({
    entityType: "ChangeRequest",
    entityId: cr.id,
    action: "update",
    payload: { status: cr.status, priority: cr.priority },
  });
  revalidatePath("/change-control");
  return ok({ id: cr.id }, `Change request ${cr.externalId} updated`);
}

export async function updateChangeRequestStatus(input: unknown) {
  const parsed = parseInput(changeRequestStatusSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, status } = parsed.data;

  const cr = await prisma.changeRequest.update({
    where: { id },
    data: { status },
  });

  await writeAudit({
    entityType: "ChangeRequest",
    entityId: cr.id,
    action: "status-change",
    payload: { status },
  });
  revalidatePath("/change-control");
  return ok({ id: cr.id }, `Status set to ${status.replace(/_/g, " ")}`);
}

export async function decideChangeRequest(input: unknown) {
  const parsed = parseInput(changeRequestDecisionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, decision, outcome } = parsed.data;

  const current = await prisma.changeRequest.findUnique({ where: { id } });
  if (!current) return fail("Change request not found.");

  const cr = await prisma.changeRequest.update({
    where: { id },
    data: {
      status: decision,
      outcome: outcome || null,
      decidedAt: new Date(),
    },
  });

  await writeAudit({
    entityType: "ChangeRequest",
    entityId: cr.id,
    action: decision === "APPROVED" ? "approve" : "reject",
    payload: { decision, outcome: outcome || null },
  });
  revalidatePath("/change-control");
  return ok(
    { id: cr.id },
    decision === "APPROVED"
      ? `Change request ${cr.externalId} approved`
      : `Change request ${cr.externalId} rejected`,
  );
}
