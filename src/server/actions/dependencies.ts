"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import {
  dependencySchema,
  escalateDependencySchema,
} from "@/lib/validation/dependencies";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate(workstreamId?: string | null) {
  revalidatePath("/dependencies");
  revalidatePath("/raid");
  revalidateWorkstreamViews(workstreamId);
}

export async function createDependency(input: unknown) {
  const parsed = parseInput(dependencySchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, ...rest } = parsed.data;

  const existing = await prisma.dependency.findMany({
    select: { externalId: true },
  });
  const externalId = computeNextExternalId(
    "DEP",
    existing.map((e) => e.externalId),
  );

  const dependency = await prisma.dependency.create({
    data: { ...blankToNull(rest), externalId },
  });

  await writeAudit({
    entityType: "Dependency",
    entityId: dependency.id,
    action: "create",
    payload: { externalId },
  });
  revalidate(dependency.workstreamId);
  return ok(dependency, `Dependency ${externalId} created`);
}

export async function updateDependency(input: unknown) {
  const parsed = parseInput(dependencySchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = parsed.data;
  if (!id) return fail("Missing dependency id");

  const dependency = await prisma.dependency.update({
    where: { id },
    data: blankToNull(rest),
  });

  await writeAudit({
    entityType: "Dependency",
    entityId: dependency.id,
    action: "update",
    payload: { externalId: dependency.externalId },
  });
  revalidate(dependency.workstreamId);
  return ok(dependency, `Dependency ${dependency.externalId} updated`);
}

export async function escalateDependency(input: unknown) {
  const parsed = parseInput(escalateDependencySchema, input);
  if (!parsed.success) return parsed.result;
  const { id, escalation } = parsed.data;

  const dependency = await prisma.dependency.update({
    where: { id },
    data: {
      status: "AT_RISK",
      escalation: escalation?.trim()
        ? escalation
        : "Escalated for governance review",
    },
  });

  await writeAudit({
    entityType: "Dependency",
    entityId: dependency.id,
    action: "escalate",
    payload: { externalId: dependency.externalId },
  });
  revalidate(dependency.workstreamId);
  return ok(dependency, `Dependency ${dependency.externalId} escalated`);
}
