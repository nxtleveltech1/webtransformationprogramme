"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { issueSchema, closeIssueSchema } from "@/lib/validation/issues";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate() {
  revalidatePath("/issues");
  revalidatePath("/raid");
}

export async function createIssue(input: unknown) {
  const parsed = parseInput(issueSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, ownerPersonId, ...rest } = parsed.data;

  const existing = await prisma.issue.findMany({ select: { externalId: true } });
  const externalId = computeNextExternalId(
    "ISS",
    existing.map((e) => e.externalId),
  );

  const issue = await prisma.issue.create({
    data: {
      ...blankToNull(rest),
      externalId,
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Issue",
    entityId: issue.id,
    action: "create",
    payload: { externalId },
  });
  revalidate();
  return ok(issue, `Issue ${externalId} created`);
}

export async function updateIssue(input: unknown) {
  const parsed = parseInput(issueSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ownerPersonId, ...rest } = parsed.data;
  if (!id) return fail("Missing issue id");

  const issue = await prisma.issue.update({
    where: { id },
    data: {
      ...blankToNull(rest),
      ownerPersonId: ownerPersonId || null,
    },
  });

  await writeAudit({
    entityType: "Issue",
    entityId: issue.id,
    action: "update",
    payload: { externalId: issue.externalId },
  });
  revalidate();
  return ok(issue, `Issue ${issue.externalId} updated`);
}

export async function closeIssue(input: unknown) {
  const parsed = parseInput(closeIssueSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, resolutionRequired } = parsed.data;

  const issue = await prisma.issue.update({
    where: { id },
    data: {
      status: "CLOSED",
      ...(resolutionRequired?.trim() ? { resolutionRequired } : {}),
    },
  });

  await writeAudit({
    entityType: "Issue",
    entityId: issue.id,
    action: "close",
    payload: { externalId: issue.externalId },
  });
  revalidate();
  return ok(issue, `Issue ${issue.externalId} closed`);
}
