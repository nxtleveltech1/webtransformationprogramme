import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation/_shared";

const CONTACT_VISIBILITY = ["PUBLIC_INTERNAL", "RESTRICTED", "NAME_ONLY"] as const;
const CONFIDENCE = ["CONFIRMED", "INFERRED", "REQUIRES_VALIDATION", "UNCONFIRMED"] as const;
const PROGRAMME_ROLE_TYPES = [
  "STREAM_LEAD",
  "PRODUCT_OWNER",
  "SME",
  "GATEKEEPER",
  "FACILITATOR",
  "TECHNICAL_ARCHITECT",
  "BUSINESS_STAKEHOLDER",
  "SPONSOR",
  "CONTRIBUTOR",
  "PROGRAMME_DIRECTOR",
  "SCRIBE",
  "EXECUTIVE_SPONSOR",
] as const;

export const stakeholderCreateSchema = z.object({
  displayName: requiredText,
  surname: optionalText,
  email: optionalText,
  phone: optionalText,
  mobile: optionalText,
  roleDescription: optionalText,
  department: optionalText,
  location: optionalText,
  areaId: optionalText,
  businessId: optionalText,
  clusterId: optionalText,
  primaryWorkstreamId: optionalText,
  dataOwnerPersonId: optionalText,
  contactVisibility: z.enum(CONTACT_VISIBILITY).optional(),
  confidence: z.enum(CONFIDENCE).optional(),
});

export const stakeholderUpdateSchema = stakeholderCreateSchema
  .partial()
  .extend({ id: requiredText });

export const programmeRoleAssignSchema = z.object({
  personId: requiredText,
  roleType: z.enum(PROGRAMME_ROLE_TYPES),
  scope: optionalText,
  isPrimary: z.boolean().optional(),
  workstreamId: optionalText,
});

export const teamAssignSchema = z.object({
  personId: requiredText,
  teamId: requiredText,
  isPrimary: z.boolean().optional(),
});

export const stakeholderArchiveSchema = z.object({
  id: requiredText,
});
