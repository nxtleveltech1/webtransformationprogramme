import { z } from "zod";

import { ISSUE_STATUS_OPTIONS } from "@/lib/enums";

export const issueSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, "Description is required"),
  currentImpact: z.string().optional(),
  affectedTeams: z.string().optional(),
  status: z.enum(ISSUE_STATUS_OPTIONS),
  ownerPersonId: z.string().optional(),
  ownerText: z.string().optional(),
  resolutionRequired: z.string().optional(),
  targetResolutionDate: z.string().optional(),
  blockedWorkstream: z.string().optional(),
});

export type IssueFormValues = z.infer<typeof issueSchema>;

export const closeIssueSchema = z.object({
  id: z.string().min(1, "Missing issue id"),
  resolutionRequired: z.string().optional(),
});
