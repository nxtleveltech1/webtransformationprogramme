"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import {
  glossaryTermDeleteSchema,
  glossaryTermSchema,
} from "@/lib/validation/governance-reference";
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

export async function deleteGlossaryTerm(input: unknown) {
  try {
    await requireEntityAction("glossary", "delete");
    const parsed = parseInput(glossaryTermDeleteSchema, input);
    if (!parsed.success) return parsed.result;

    const existing = await prisma.glossaryTerm.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, term: true },
    });
    if (!existing) return fail("Glossary term not found.");

    await prisma.glossaryTerm.delete({ where: { id: existing.id } });
    await writeAudit({
      entityType: "GlossaryTerm",
      entityId: existing.id,
      action: "delete",
      payload: { term: existing.term },
    });
    revalidatePath("/glossary");
    return ok({ id: existing.id }, "Glossary term deleted.");
  } catch (error) {
    return permissionFail(error);
  }
}
