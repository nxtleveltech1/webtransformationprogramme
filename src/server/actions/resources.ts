"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  resourceSchema,
  allocationSchema,
} from "@/lib/validation/resources";

function clean<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
  ) as T;
}

export async function upsertResource(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(resourceSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = clean(parsed.data);

  try {
    if (id) {
      const resource = await prisma.resource.update({ where: { id }, data: rest });
      await writeAudit({
        entityType: "Resource",
        entityId: resource.id,
        action: "update",
        payload: rest,
      });
      revalidatePath("/resources");
      return ok(resource, "Resource updated");
    }
    const resource = await prisma.resource.create({ data: rest });
    await writeAudit({
      entityType: "Resource",
      entityId: resource.id,
      action: "create",
      payload: rest,
    });
    revalidatePath("/resources");
    return ok(resource, "Resource created");
  } catch {
    return fail("Could not save the resource. Please try again.");
  }
}

export async function upsertAllocation(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(allocationSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = clean(parsed.data);

  try {
    if (id) {
      const allocation = await prisma.resourceAllocation.update({
        where: { id },
        data: rest,
      });
      await writeAudit({
        entityType: "ResourceAllocation",
        entityId: allocation.id,
        action: "update",
        payload: rest,
      });
      revalidatePath("/resources");
      return ok(allocation, "Allocation updated");
    }
    const allocation = await prisma.resourceAllocation.create({ data: rest });
    await writeAudit({
      entityType: "ResourceAllocation",
      entityId: allocation.id,
      action: "create",
      payload: rest,
    });
    revalidatePath("/resources");
    return ok(allocation, "Allocation added");
  } catch {
    return fail("Could not save the allocation. Please try again.");
  }
}

export async function deleteAllocation(input: unknown): Promise<ActionResult> {
  const id = typeof input === "string" ? input : (input as { id?: string })?.id;
  if (!id) return fail("Missing allocation id");
  try {
    await prisma.resourceAllocation.delete({ where: { id } });
    await writeAudit({
      entityType: "ResourceAllocation",
      entityId: id,
      action: "delete",
    });
    revalidatePath("/resources");
    return ok(null, "Allocation removed");
  } catch {
    return fail("Could not remove the allocation.");
  }
}
