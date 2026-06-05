import { z } from "zod";

import { QUESTION_STATUS_OPTIONS } from "@/lib/enums";

export const openQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3, "Question is required"),
  raisedBy: z.string().optional(),
  relevantTeam: z.string().optional(),
  ownerToAnswer: z.string().optional(),
  impactIfUnanswered: z.string().optional(),
  status: z.enum(QUESTION_STATUS_OPTIONS),
});

export type OpenQuestionFormValues = z.infer<typeof openQuestionSchema>;

export const answerQuestionSchema = z.object({
  id: z.string().min(1, "Missing question id"),
});
