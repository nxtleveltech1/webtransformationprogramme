"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import { glossaryTermSchema } from "@/lib/validation/governance-reference";
import { fail, ok, parseInput } from "@/server/actions/helpers";

function permissionFail(error: unknown) {
  if (error instanceof PermissionDeniedError) {
    return fail(error.message);
  }
  throw error;
}

export async function upsertGlossaryTerm(input: unknown) {
  try {
    await requireEntityAction("glossary", "edit");
    const parsed = parseInput(glossaryTermSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const term = d.id
      ? await prisma.glossaryTerm.update({
          where: { id: d.id },
          data: {
            term: d.term,
            meaning: d.meaning,
            category: d.category ?? "TERM",
            confidence: d.confidence ?? "INFERRED",
          },
        })
      : await prisma.glossaryTerm.create({
          data: {
            term: d.term,
            meaning: d.meaning,
            category: d.category ?? "TERM",
            confidence: d.confidence ?? "INFERRED",
          },
        });

    await writeAudit({
      entityType: "GlossaryTerm",
      entityId: term.id,
      action: d.id ? "update" : "create",
      payload: { term: term.term },
    });
    revalidatePath("/glossary");
    return ok({ id: term.id }, "Glossary term saved.");
  } catch (error) {
    return permissionFail(error);
  }
}
