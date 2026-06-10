import { z } from "zod";

import { RAG_OPTIONS } from "@/lib/enums";
import { optionalEnum, optionalText, requiredText } from "@/lib/validation/_shared";

const workstreamFields = {
  code: requiredText,
  name: requiredText,
  oneLineStatus: optionalText,
  rag: optionalEnum(RAG_OPTIONS),
  leadPersonId: optionalText,
  leadText: optionalText,
  programmeId: optionalText,
};

export const createWorkstreamSchema = z.object(workstreamFields);

export const updateWorkstreamSchema = z.object({
  id: requiredText,
  ...workstreamFields,
});

export const deleteWorkstreamSchema = z.object({
  id: requiredText,
});

export type CreateWorkstreamInput = z.infer<typeof createWorkstreamSchema>;
export type UpdateWorkstreamInput = z.infer<typeof updateWorkstreamSchema>;
