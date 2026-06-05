"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { riskSchema, escalateRiskSchema } from "@/lib/validation/risks";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate(workstreamId?: string | null) {
  revalidatePath("/risks");
  revalidatePath("/raid");
  revalidateWorkstreamViews(workstreamId);
}

export async function createRisk(input: unknown) {
  const parsed = parseInput(riskSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, ownerPersonId, ...rest } = parsed.data;

  const existing = await prisma.risk.findMany({ select: { externalId: true } });
  const externalId = computeNextExternalId(
    "RSK",
    existing.map((e) => e.externalId),
  );

  const risk = await prisma.risk.create({
    data: {
      ...blankToNull(rest),
      externalId,
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Risk",
    entityId: risk.id,
    action: "create",
    payload: { externalId },
  });
  revalidate(risk.workstreamId);
  return ok(risk, `Risk ${externalId} created`);
}

export async function updateRisk(input: unknown) {
  const parsed = parseInput(riskSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ownerPersonId, ...rest } = parsed.data;
  if (!id) return fail("Missing risk id");

  const risk = await prisma.risk.update({
    where: { id },
    data: {
      ...blankToNull(rest),
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Risk",
    entityId: risk.id,
    action: "update",
    payload: { externalId: risk.externalId },
  });
  revalidate(risk.workstreamId);
  return ok(risk, `Risk ${risk.externalId} updated`);
}

export async function escalateRisk(input: unknown) {
  const parsed = parseInput(escalateRiskSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, escalationRequired } = parsed.data;

  const risk = await prisma.risk.update({
    where: { id },
    data: {
      status: "Escalated",
      escalationRequired: escalationRequired?.trim()
        ? escalationRequired
        : "Escalated for governance review",
    },
  });

  await writeAudit({
    entityType: "Risk",
    entityId: risk.id,
    action: "escalate",
    payload: { externalId: risk.externalId },
  });
  revalidate(risk.workstreamId);
  return ok(risk, `Risk ${risk.externalId} escalated`);
}
