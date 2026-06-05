import { z } from "zod";

import { DOCUMENT_STATUS_OPTIONS } from "@/lib/enums";

export const documentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(240),
  description: z.string().max(4000).optional().nullable(),
  projectId: z.string().optional().nullable(),
  mimeType: z.string().max(160).optional().nullable(),
  version: z.string().max(40).optional().nullable(),
  status: z.enum(DOCUMENT_STATUS_OPTIONS),
  ownerPersonId: z.string().optional().nullable(),
  ownerText: z.string().max(160).optional().nullable(),
});

export type DocumentInput = z.infer<typeof documentSchema>;
