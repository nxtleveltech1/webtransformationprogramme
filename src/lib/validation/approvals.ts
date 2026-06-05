import { z } from "zod";

import { PRIORITY_OPTIONS } from "@/lib/enums";

const optionalText = z.string().trim().optional();

export const approvalCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  entityType: z.string().trim().min(1, "Entity type is required"),
  entityId: optionalText,
  summary: optionalText,
  priority: z.enum(PRIORITY_OPTIONS),
  requestedBy: optionalText,
  approverPersonId: optionalText,
  approverText: optionalText,
  dueDate: optionalText,
});

export const approvalDecisionSchema = z.object({
  id: z.string().min(1, "Approval id is required"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  decisionReason: optionalText,
});

export type ApprovalCreateInput = z.infer<typeof approvalCreateSchema>;
