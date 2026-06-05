import { z } from "zod";

import { RAG_OPTIONS } from "@/lib/enums";

export const userUpdateSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1, "Name is required").max(160),
  email: z.string().email("Enter a valid email").max(240),
  active: z.boolean(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userRoleSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;

export const programmeSettingsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(240),
  hardDeadline: z.string().max(120).optional().nullable(),
  rag: z.enum(RAG_OPTIONS).optional().nullable(),
  mvpSummary: z.string().max(4000).optional().nullable(),
});

export type ProgrammeSettingsInput = z.infer<typeof programmeSettingsSchema>;
