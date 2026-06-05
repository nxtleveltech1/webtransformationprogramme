import { z } from "zod";

import { ACTION_STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/enums";

const optionalText = z.string().trim().optional();

export const taskCreateSchema = z.object({
  externalId: optionalText,
  description: z.string().trim().min(1, "Description is required"),
  area: optionalText,
  priority: z.enum(PRIORITY_OPTIONS),
  status: z.enum(ACTION_STATUS_OPTIONS),
  ownerPersonId: optionalText,
  ownerText: optionalText,
  dueDate: optionalText,
  workstreamId: optionalText,
  notes: optionalText,
  acceptanceCriteria: optionalText,
  expectedOutput: optionalText,
});

export const taskUpdateSchema = taskCreateSchema.extend({
  id: z.string().min(1, "Task id is required"),
});

export const taskStatusSchema = z.object({
  id: z.string().min(1, "Task id is required"),
  status: z.enum(ACTION_STATUS_OPTIONS),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
