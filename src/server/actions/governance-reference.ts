"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import {
  publishGovernanceDocSchema,
  referenceMappingSchema,
} from "@/lib/validation/governance-reference";
import { fail, ok, parseInput } from "@/server/actions/helpers";

function revalidateGovernanceReference() {
  revalidatePath("/governance-reference");
}

function permissionFail(error: unknown) {
  if (error instanceof PermissionDeniedError) {
    return fail(error.message);
  }
  throw error;
}

export async function publishGovernanceDoc(input: unknown) {
  try {
    await requireEntityAction("governance", "edit");
    const parsed = parseInput(publishGovernanceDocSchema, input);
    if (!parsed.success) return parsed.result;

    const doc = await prisma.governanceReferenceDoc.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await writeAudit({
      entityType: "GovernanceReferenceDoc",
      entityId: doc.id,
      action: "publish",
      payload: { status: doc.status, slug: doc.slug },
    });
    revalidateGovernanceReference();
    return ok({ id: doc.id }, "Governance document updated.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function upsertReferenceMapping(input: unknown) {
  try {
    await requireEntityAction("governance", "configure");
    const parsed = parseInput(referenceMappingSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const mapping = d.id
      ? await prisma.referenceMapping.update({
          where: { id: d.id },
          data: {
            conceptKey: d.conceptKey,
            label: d.label,
            description: d.description,
            glossaryTermId: d.glossaryTermId ?? null,
            entityType: d.entityType ?? null,
            fieldPath: d.fieldPath ?? null,
            processName: d.processName ?? null,
            relatedDocSectionId: d.relatedDocSectionId ?? null,
          },
        })
      : await prisma.referenceMapping.create({
          data: {
            conceptKey: d.conceptKey,
            label: d.label,
            description: d.description,
            glossaryTermId: d.glossaryTermId ?? null,
            entityType: d.entityType ?? null,
            fieldPath: d.fieldPath ?? null,
            processName: d.processName ?? null,
            relatedDocSectionId: d.relatedDocSectionId ?? null,
          },
        });

    await writeAudit({
      entityType: "ReferenceMapping",
      entityId: mapping.id,
      action: d.id ? "update" : "create",
      payload: { conceptKey: mapping.conceptKey },
    });
    revalidateGovernanceReference();
    return ok({ id: mapping.id }, "Reference mapping saved.");
  } catch (error) {
    return permissionFail(error);
  }
}
