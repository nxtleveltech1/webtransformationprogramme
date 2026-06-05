"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { assumptionSchema } from "@/lib/validation/assumptions";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate() {
  revalidatePath("/assumptions");
  revalidatePath("/raid");
}

export async function createAssumption(input: unknown) {
  const parsed = parseInput(assumptionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, validatorPersonId, ...rest } = parsed.data;

  const existing = await prisma.assumption.findMany({
    select: { externalId: true },
  });
  const externalId = computeNextExternalId(
    "ASM",
    existing.map((e) => e.externalId),
  );

  const assumption = await prisma.assumption.create({
    data: {
      ...blankToNull(rest),
      externalId,
      validatorPersonId: validatorPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Assumption",
    entityId: assumption.id,
    action: "create",
    payload: { externalId },
  });
  revalidate();
  return ok(assumption, `Assumption ${externalId} created`);
}

export async function updateAssumption(input: unknown) {
  const parsed = parseInput(assumptionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, validatorPersonId, ...rest } = parsed.data;
  if (!id) return fail("Missing assumption id");

  const assumption = await prisma.assumption.update({
    where: { id },
    data: {
      ...blankToNull(rest),
      validatorPersonId: validatorPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Assumption",
    entityId: assumption.id,
    action: "update",
    payload: { externalId: assumption.externalId },
  });
  revalidate();
  return ok(assumption, `Assumption ${assumption.externalId} updated`);
}
