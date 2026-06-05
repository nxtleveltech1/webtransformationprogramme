"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { parkingLotSchema } from "@/lib/validation/parking-lot";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate() {
  revalidatePath("/parking-lot");
  revalidatePath("/raid");
}

export async function createParkingLotItem(input: unknown) {
  const parsed = parseInput(parkingLotSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, priority, ...rest } = parsed.data;

  const existing = await prisma.parkingLotItem.findMany({
    select: { externalId: true },
  });
  const externalId = computeNextExternalId(
    "PRK",
    existing.map((e) => e.externalId),
  );

  const item = await prisma.parkingLotItem.create({
    data: {
      ...blankToNull(rest),
      externalId,
      priority: priority ?? null,
    },
  });

  await writeAudit({
    entityType: "ParkingLotItem",
    entityId: item.id,
    action: "create",
    payload: { externalId },
  });
  revalidate();
  return ok(item, `Parking lot item ${externalId} created`);
}

export async function updateParkingLotItem(input: unknown) {
  const parsed = parseInput(parkingLotSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, priority, ...rest } = parsed.data;
  if (!id) return fail("Missing parking lot item id");

  const item = await prisma.parkingLotItem.update({
    where: { id },
    data: {
      ...blankToNull(rest),
      priority: priority ?? null,
    },
  });

  await writeAudit({
    entityType: "ParkingLotItem",
    entityId: item.id,
    action: "update",
    payload: { externalId: item.externalId },
  });
  revalidate();
  return ok(item, `Parking lot item ${item.externalId} updated`);
}
