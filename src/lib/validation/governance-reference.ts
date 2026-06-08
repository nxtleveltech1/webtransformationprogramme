import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation/_shared";

const GLOSSARY_CATEGORIES = ["ACRONYM", "SYSTEM", "TERM", "PROCESS", "GEOGRAPHY"] as const;
const CONFIDENCE = ["CONFIRMED", "INFERRED", "REQUIRES_VALIDATION", "UNCONFIRMED"] as const;
const DOC_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const glossaryTermSchema = z.object({
  id: optionalText,
  term: requiredText,
  meaning: requiredText,
  category: z.enum(GLOSSARY_CATEGORIES).optional(),
  confidence: z.enum(CONFIDENCE).optional(),
});

export const glossaryTermDeleteSchema = z.object({
  id: requiredText,
});

export const referenceMappingDeleteSchema = z.object({
  id: requiredText,
});

export const publishGovernanceDocSchema = z.object({
  id: requiredText,
  status: z.enum(DOC_STATUS),
});

export const referenceMappingSchema = z.object({
  id: optionalText,
  conceptKey: requiredText,
  label: requiredText,
  description: requiredText,
  glossaryTermId: optionalText,
  entityType: optionalText,
  fieldPath: optionalText,
  processName: optionalText,
  relatedDocSectionId: optionalText,
});
