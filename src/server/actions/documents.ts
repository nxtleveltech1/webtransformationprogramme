"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput, type ActionResult } from "@/server/actions/helpers";
import { documentSchema } from "@/lib/validation/documents";

function clean<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
  ) as T;
}

export async function upsertDocument(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(documentSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = clean(parsed.data);

  try {
    if (id) {
      const doc = await prisma.document.update({ where: { id }, data: rest });
      await writeAudit({
        entityType: "Document",
        entityId: doc.id,
        action: "update",
        payload: rest,
      });
      revalidatePath("/documents");
      return ok(doc, "Document updated");
    }
    const doc = await prisma.document.create({ data: rest });
    await writeAudit({
      entityType: "Document",
      entityId: doc.id,
      action: "create",
      payload: rest,
    });
    revalidatePath("/documents");
    return ok(doc, "Document created");
  } catch {
    return fail("Could not save the document. Please try again.");
  }
}

export async function deleteDocument(input: unknown): Promise<ActionResult> {
  const id = typeof input === "string" ? input : (input as { id?: string })?.id;
  if (!id) return fail("Missing document id");
  try {
    await prisma.document.delete({ where: { id } });
    await writeAudit({ entityType: "Document", entityId: id, action: "delete" });
    revalidatePath("/documents");
    return ok(null, "Document deleted");
  } catch {
    return fail("Could not delete the document.");
  }
}
