import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation/_shared";

/** Optional integer that accepts "" / null from form inputs. */
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().nullish(),
);

const milestoneFields = {
  title: requiredText,
  targetDate: optionalText,
  piGate: optionalText,
  status: optionalText,
  varianceDays: optionalInt,
  notes: optionalText,
  workstreamId: optionalText,
  projectId: optionalText,
};

export const createMilestoneSchema = z.object(milestoneFields);

export const updateMilestoneSchema = z.object({
  id: requiredText,
  ...milestoneFields,
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
