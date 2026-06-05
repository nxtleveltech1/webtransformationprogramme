import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().min(1, "Name is required").max(160),
  role: z.string().max(160).optional().nullable(),
  team: z.string().max(160).optional().nullable(),
  capacityHours: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type ResourceInput = z.infer<typeof resourceSchema>;

export const allocationSchema = z.object({
  id: z.string().optional(),
  resourceId: z.string().min(1, "Resource is required"),
  projectId: z.string().optional().nullable(),
  workstreamCode: z.string().max(64).optional().nullable(),
  roleOnWork: z.string().max(160).optional().nullable(),
  allocationPct: z.coerce.number().int().min(0).max(200),
  startDate: z.string().max(40).optional().nullable(),
  endDate: z.string().max(40).optional().nullable(),
});

export type AllocationInput = z.infer<typeof allocationSchema>;
