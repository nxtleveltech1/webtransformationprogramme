import type { OpenQuestion } from "@prisma/client";

import { prisma } from "@/lib/db";

export type OpenQuestionRow = OpenQuestion;

export async function getOpenQuestions(): Promise<OpenQuestionRow[]> {
  return prisma.openQuestion.findMany({
    orderBy: { externalId: "asc" },
  });
}
