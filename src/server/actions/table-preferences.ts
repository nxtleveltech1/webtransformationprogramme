"use server";

import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentActor } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { ok, parseInput, type ActionResult } from "@/server/actions/helpers";

const saveSchema = z.object({
  tableKey: z.string().min(1).max(64),
  columnVisibility: z.record(z.string(), z.boolean()),
});

/**
 * Returns the signed-in user's saved column visibility for a table, or null
 * when none is saved / the request is unauthenticated.
 */
export async function getTablePreference(
  tableKey: string,
): Promise<Record<string, boolean> | null> {
  const actor = await getCurrentActor();
  if (!actor.userId) return null;
  const pref = await prisma.tablePreference.findUnique({
    where: { userId_tableKey: { userId: actor.userId, tableKey } },
    select: { columnVisibility: true },
  });
  return (pref?.columnVisibility as Record<string, boolean> | undefined) ?? null;
}

/**
 * Persists the signed-in user's column visibility for a table. No-op (still
 * `ok`) when unauthenticated so the table degrades gracefully to in-memory.
 */
export async function saveTablePreference(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(saveSchema, input);
  if (!parsed.success) return parsed.result;

  const actor = await getCurrentActor();
  if (!actor.userId) return ok();

  const { tableKey, columnVisibility } = parsed.data;
  await prisma.tablePreference.upsert({
    where: { userId_tableKey: { userId: actor.userId, tableKey } },
    create: { userId: actor.userId, tableKey, columnVisibility },
    update: { columnVisibility },
  });

  await writeAudit({
    entityType: "TablePreference",
    entityId: `${actor.userId}:${tableKey}`,
    action: "UPSERT",
    actorName: actor.name,
    actorRole: actor.role,
    payload: columnVisibility,
  });

  return ok();
}
