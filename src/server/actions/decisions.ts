"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { decisionSchema } from "@/lib/validation/decisions";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate(workstreamId?: string | null) {
  revalidatePath("/decisions");
  revalidatePath("/raid");
  revalidateWorkstreamViews(workstreamId);
}

export async function createDecision(input: unknown) {
  const parsed = parseInput(decisionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, ownerPersonId, ...rest } = parsed.data;

  const existing = await prisma.decision.findMany({
    select: { externalId: true },
  });
  const externalId = computeNextExternalId(
    "DEC",
    existing.map((e) => e.externalId),
  );

  const decision = await prisma.decision.create({
    data: {
      ...blankToNull(rest),
      externalId,
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Decision",
    entityId: decision.id,
    action: "create",
    payload: { externalId },
  });
  revalidate(decision.workstreamId);
  return ok(decision, `Decision ${externalId} created`);
}

export async function updateDecision(input: unknown) {
  const parsed = parseInput(decisionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ownerPersonId, ...rest } = parsed.data;
  if (!id) return fail("Missing decision id");

  const decision = await prisma.decision.update({
    where: { id },
    data: {
      ...blankToNull(rest),
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Decision",
    entityId: decision.id,
    action: "update",
    payload: { externalId: decision.externalId },
  });
  revalidate(decision.workstreamId);
  return ok(decision, `Decision ${decision.externalId} updated`);
}

export async function deleteDecision(input: unknown) {
  try {
    await requireEntityAction("decision", "delete");
    const id =
      typeof input === "object" && input !== null && "id" in input
        ? String((input as { id: unknown }).id)
        : "";
    if (!id) return fail("Missing decision id");

    const existing = await prisma.decision.findUnique({
      where: { id },
      select: { id: true, externalId: true, workstreamId: true },
    });
    if (!existing) return fail("Decision not found");

    await prisma.decision.delete({ where: { id: existing.id } });
    await writeAudit({
      entityType: "Decision",
      entityId: existing.id,
      action: "delete",
      payload: { externalId: existing.externalId },
    });
    revalidate(existing.workstreamId);
    return ok({ id: existing.id }, `Decision ${existing.externalId} deleted`);
  } catch (error) {
    if (error instanceof PermissionDeniedError) return fail(error.message);
    throw error;
  }
}
