"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, parseInput, type ActionResult } from "@/server/actions/helpers";
import { programmeSchema } from "@/lib/validation/programme";

export async function updateProgramme(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(programmeSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...data } = parsed.data;
  const programme = await prisma.programme.update({
    where: { id },
    data: {
      name: data.name,
      purpose: data.purpose ?? null,
      scopeTension: data.scopeTension ?? null,
      hardDeadline: data.hardDeadline ?? null,
      mvpSummary: data.mvpSummary ?? null,
      rag: data.rag ?? null,
    },
  });

  await writeAudit({
    entityType: "Programme",
    entityId: programme.id,
    action: "update",
    payload: data,
  });
  revalidatePath("/programme");
  return ok(programme, "Programme updated");
}
