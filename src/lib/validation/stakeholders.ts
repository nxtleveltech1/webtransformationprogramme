import { z } from "zod";

import { optionalText, requiredText } from "@/lib/validation/_shared";

const CONTACT_VISIBILITY = ["PUBLIC_INTERNAL", "RESTRICTED", "NAME_ONLY"] as const;
const CONFIDENCE = ["CONFIRMED", "INFERRED", "REQUIRES_VALIDATION", "UNCONFIRMED"] as const;
const PARTICIPANT_STATUS = [
  "CONFIRMED",
  "PENDING",
  "TO_BE_CONFIRMED",
  "INACTIVE",
] as const;
const STAKEHOLDER_ROLE_TYPES = [
  "SPONSOR",
  "APPROVER",
  "SME",
  "DECISION_MAKER",
  "INFORMED",
  "STEERCING_MEMBER",
  "CONSULTATION",
  "COMMUNICATION",
  "WORKING_TEAM",
] as const;
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
  nickname: optionalText,
  email: optionalText,
  phone: optionalText,
  mobile: optionalText,
  primaryContact: optionalText,
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
  participantStatus: z.enum(PARTICIPANT_STATUS).optional(),
});

export const stakeholderRoleAssignSchema = z.object({
  personId: requiredText,
  roleType: z.enum(STAKEHOLDER_ROLE_TYPES),
  roleLabel: optionalText,
  scope: optionalText,
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
