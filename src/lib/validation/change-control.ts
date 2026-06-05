import { z } from "zod";

import { CHANGE_REQUEST_STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/enums";

const optionalText = z.string().trim().optional();

export const changeRequestCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  projectId: optionalText,
  impactAssessment: optionalText,
  priority: z.enum(PRIORITY_OPTIONS),
  status: z.enum(CHANGE_REQUEST_STATUS_OPTIONS).optional(),
  requestedBy: optionalText,
  approverPersonId: optionalText,
  implementationStatus: optionalText,
});

export const changeRequestUpdateSchema = changeRequestCreateSchema.extend({
  id: z.string().min(1, "Change request id is required"),
});

export const changeRequestStatusSchema = z.object({
  id: z.string().min(1, "Change request id is required"),
  status: z.enum(CHANGE_REQUEST_STATUS_OPTIONS),
});

export const changeRequestDecisionSchema = z.object({
  id: z.string().min(1, "Change request id is required"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  outcome: optionalText,
});

export type ChangeRequestCreateInput = z.infer<typeof changeRequestCreateSchema>;
export type ChangeRequestUpdateInput = z.infer<typeof changeRequestUpdateSchema>;
