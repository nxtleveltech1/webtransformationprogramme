import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation/_shared";

const SCENARIO_STATUS = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const TARGET_TYPE = ["TASK", "MILESTONE"] as const;

export const scenarioSchema = z.object({
  id: optionalText,
  name: requiredText,
  description: optionalText,
  status: z.enum(SCENARIO_STATUS).optional(),
});

export const scenarioDeleteSchema = z.object({
  id: requiredText,
});

export const scenarioChangeSchema = z.object({
  scenarioId: requiredText,
  targetType: z.enum(TARGET_TYPE),
  targetId: requiredText,
  targetLabel: optionalText,
  // Whole-day shift; positive = extend / slip later, negative = pull in.
  deltaDays: z.coerce.number().int().min(-3650).max(3650),
  note: optionalText,
});

export const scenarioChangeDeleteSchema = z.object({
  id: requiredText,
});
