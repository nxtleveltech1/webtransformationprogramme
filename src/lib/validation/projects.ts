import { z } from "zod";

import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, RAG_OPTIONS } from "@/lib/enums";
import { optionalEnum, optionalText, requiredText } from "@/lib/validation/_shared";

const projectFields = {
  name: requiredText,
  code: optionalText,
  description: optionalText,
  status: z.enum(PROJECT_STATUS_OPTIONS),
  priority: z.enum(PRIORITY_OPTIONS),
  rag: optionalEnum(RAG_OPTIONS),
  programmeId: optionalText,
  workstreamId: optionalText,
  ownerPersonId: optionalText,
  ownerText: optionalText,
  sponsor: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  budgetNote: optionalText,
};

export const createProjectSchema = z.object(projectFields);

export const updateProjectSchema = z.object({
  id: requiredText,
  ...projectFields,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
