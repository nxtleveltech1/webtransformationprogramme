"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import {
  openQuestionSchema,
  answerQuestionSchema,
} from "@/lib/validation/open-questions";
import { blankToNull, computeNextExternalId } from "@/lib/services/registers";

function revalidate() {
  revalidatePath("/open-questions");
  revalidatePath("/raid");
}

export async function createOpenQuestion(input: unknown) {
  const parsed = parseInput(openQuestionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id: _id, ...rest } = parsed.data;

  const existing = await prisma.openQuestion.findMany({
    select: { externalId: true },
  });
  const externalId = computeNextExternalId(
    "QST",
    existing.map((e) => e.externalId),
  );

  const question = await prisma.openQuestion.create({
    data: { ...blankToNull(rest), externalId },
  });

  await writeAudit({
    entityType: "OpenQuestion",
    entityId: question.id,
    action: "create",
    payload: { externalId },
  });
  revalidate();
  return ok(question, `Question ${externalId} created`);
}

export async function updateOpenQuestion(input: unknown) {
  const parsed = parseInput(openQuestionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = parsed.data;
  if (!id) return fail("Missing question id");

  const question = await prisma.openQuestion.update({
    where: { id },
    data: blankToNull(rest),
  });

  await writeAudit({
    entityType: "OpenQuestion",
    entityId: question.id,
    action: "update",
    payload: { externalId: question.externalId },
  });
  revalidate();
  return ok(question, `Question ${question.externalId} updated`);
}

export async function markQuestionAnswered(input: unknown) {
  const parsed = parseInput(answerQuestionSchema, input);
  if (!parsed.success) return parsed.result;
  const { id } = parsed.data;

  const question = await prisma.openQuestion.update({
    where: { id },
    data: { status: "ANSWERED" },
  });

  await writeAudit({
    entityType: "OpenQuestion",
    entityId: question.id,
    action: "answer",
    payload: { externalId: question.externalId },
  });
  revalidate();
  return ok(question, `Question ${question.externalId} marked answered`);
}
