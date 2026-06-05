import { z } from "zod";

import { RAG_OPTIONS } from "@/lib/enums";
import { optionalEnum, optionalText, requiredText } from "@/lib/validation/_shared";

/**
 * Editable programme overview fields. The programme record itself is created by
 * the seed; this module only edits the existing singleton.
 */
export const programmeSchema = z.object({
  id: requiredText,
  name: requiredText,
  purpose: optionalText,
  scopeTension: optionalText,
  hardDeadline: optionalText,
  mvpSummary: optionalText,
  rag: optionalEnum(RAG_OPTIONS),
});

export type ProgrammeInput = z.infer<typeof programmeSchema>;
