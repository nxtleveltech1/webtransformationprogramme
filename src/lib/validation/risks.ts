import { z } from "zod";

import {
  RISK_CATEGORY_OPTIONS,
  PROBABILITY_OPTIONS,
  IMPACT_OPTIONS,
} from "@/lib/enums";

export const RISK_STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Mitigating",
  "Monitoring",
  "Escalated",
  "Closed",
] as const;

export const riskSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, "Description is required"),
  category: z.enum(RISK_CATEGORY_OPTIONS),
  probability: z.enum(PROBABILITY_OPTIONS),
  impact: z.enum(IMPACT_OPTIONS),
  status: z.string().min(1, "Status is required"),
  ownerPersonId: z.string().optional(),
  ownerText: z.string().optional(),
  mitigationDiscussed: z.string().optional(),
  mitigationRequired: z.string().optional(),
  escalationRequired: z.string().optional(),
  dueDate: z.string().optional(),
});

export type RiskFormValues = z.infer<typeof riskSchema>;

export const escalateRiskSchema = z.object({
  id: z.string().min(1, "Missing risk id"),
  escalationRequired: z.string().optional(),
});
