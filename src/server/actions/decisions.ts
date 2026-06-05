"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
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
