"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import {
  approvalCreateSchema,
  approvalDecisionSchema,
} from "@/lib/validation/approvals";

async function nextApprovalExternalId(): Promise<string> {
  const rows = await prisma.approval.findMany({
    where: { externalId: { startsWith: "APR-" } },
    select: { externalId: true },
  });
  let max = 0;
  for (const { externalId } of rows) {
    const n = Number.parseInt(externalId.replace(/^APR-/, ""), 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return `APR-${String(max + 1).padStart(3, "0")}`;
}

export async function createApproval(input: unknown) {
  const parsed = parseInput(approvalCreateSchema, input);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const externalId = await nextApprovalExternalId();
  const approval = await prisma.approval.create({
    data: {
      externalId,
      title: d.title,
      entityType: d.entityType,
      entityId: d.entityId || null,
      summary: d.summary || null,
      priority: d.priority,
      requestedBy: d.requestedBy || null,
      approverPersonId: d.approverPersonId || null,
      approverText: d.approverText || null,
      dueDate: d.dueDate || null,
    },
  });

  await writeAudit({
    entityType: "Approval",
    entityId: approval.id,
    action: "create",
    payload: { externalId, entityType: approval.entityType },
  });
  revalidatePath("/approvals");
  return ok({ id: approval.id }, `Approval ${externalId} created`);
}

export async function decideApproval(input: unknown) {
  const parsed = parseInput(approvalDecisionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, decision, decisionReason } = parsed.data;

  const current = await prisma.approval.findUnique({ where: { id } });
  if (!current) return fail("Approval not found.");
  if (current.status !== "PENDING") {
    return fail(
      `This approval is already ${current.status.toLowerCase()} and cannot be changed.`,
    );
  }

  const approval = await prisma.approval.update({
    where: { id },
    data: {
      status: decision,
      decisionReason: decisionReason || null,
      decidedAt: new Date(),
    },
  });

  await writeAudit({
    entityType: "Approval",
    entityId: approval.id,
    action: decision === "APPROVED" ? "approve" : "reject",
    payload: { decision, decisionReason: decisionReason || null },
  });
  revalidatePath("/approvals");
  return ok(
    { id: approval.id },
    decision === "APPROVED"
      ? `Approval ${approval.externalId} approved`
      : `Approval ${approval.externalId} rejected`,
  );
}
