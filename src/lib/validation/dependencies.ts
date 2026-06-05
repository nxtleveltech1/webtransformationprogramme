import { z } from "zod";

import { DEPENDENCY_STATUS_OPTIONS } from "@/lib/enums";

export const dependencySchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, "Description is required"),
  dependentWorkstream: z.string().optional(),
  providingTeam: z.string().optional(),
  receivingTeam: z.string().optional(),
  requiredDate: z.string().optional(),
  delayRisk: z.string().optional(),
  escalation: z.string().optional(),
  status: z.enum(DEPENDENCY_STATUS_OPTIONS),
  ownerText: z.string().optional(),
});

export type DependencyFormValues = z.infer<typeof dependencySchema>;

export const escalateDependencySchema = z.object({
  id: z.string().min(1, "Missing dependency id"),
  escalation: z.string().optional(),
});
