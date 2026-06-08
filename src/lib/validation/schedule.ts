import { z } from "zod";

import { optionalEnum, optionalText, requiredText } from "@/lib/validation/_shared";
import { PRIORITY_OPTIONS, RAG_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/enums";

/** Optional integer that accepts "" / null from form inputs. */
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().nullish(),
);

/**
 * Edit schemas for the schedule entities surfaced on the Gantt. These mirror the
 * Task / CriticalPathStep / RoadmapActivity Prisma models; dates are free-text
 * strings to match the seeded data, parsed client-side for the Gantt.
 */
export const wbsTaskUpdateSchema = z.object({
  id: requiredText,
  title: requiredText,
  description: optionalText,
  status: z.enum(TASK_STATUS_OPTIONS),
  priority: z.enum(PRIORITY_OPTIONS),
  rag: optionalEnum(RAG_OPTIONS),
  percentComplete: optionalInt,
  baselineStartDate: optionalText,
  baselineEndDate: optionalText,
  forecastStartDate: optionalText,
  forecastEndDate: optionalText,
  durationDays: optionalInt,
  ownerPersonId: optionalText,
  ownerText: optionalText,
  workstreamId: optionalText,
  blockers: optionalText,
  acceptanceCriteria: optionalText,
  criticalPath: z.boolean().optional(),
});

export const criticalPathStepUpdateSchema = z.object({
  id: requiredText,
  activity: requiredText,
  ownerText: optionalText,
  predecessor: optionalText,
  dueDate: optionalText,
  status: optionalText,
  isCritical: z.boolean().optional(),
});

export const roadmapActivityUpdateSchema = z.object({
  id: requiredText,
  workstream: optionalText,
  activity: requiredText,
  ownerText: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  dependency: optionalText,
  status: optionalText,
  notes: optionalText,
});

export type WbsTaskUpdateInput = z.infer<typeof wbsTaskUpdateSchema>;
export type CriticalPathStepUpdateInput = z.infer<typeof criticalPathStepUpdateSchema>;
export type RoadmapActivityUpdateInput = z.infer<typeof roadmapActivityUpdateSchema>;
