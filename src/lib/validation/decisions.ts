import { z } from "zod";

import { DECISION_STATUS_OPTIONS } from "@/lib/enums";

export const decisionSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  description: z.string().min(3, "Description is required"),
  status: z.enum(DECISION_STATUS_OPTIONS),
  ownerPersonId: z.string().optional(),
  ownerText: z.string().optional(),
  approver: z.string().optional(),
  requiredDecision: z.string().optional(),
  dueDate: z.string().optional(),
  rationale: z.string().optional(),
  optionsConsidered: z.string().optional(),
  tradeoffs: z.string().optional(),
  followUp: z.string().optional(),
});

export type DecisionFormValues = z.infer<typeof decisionSchema>;
