/**
 * UI-facing enum option lists, derived from the Prisma schema enums. Kept here
 * so forms and filters share a single source of truth.
 */
export const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export const RAG_OPTIONS = ["RED", "AMBER", "GREEN"] as const;

export const ACTION_STATUS_OPTIONS = [
  "NEW",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "UNCONFIRMED",
  "SUGGESTED",
  "OPEN",
] as const;

export const DECISION_STATUS_OPTIONS = [
  "CONFIRMED",
  "PROPOSED",
  "DEFERRED",
  "REJECTED",
  "UNCLEAR",
] as const;

export const ISSUE_STATUS_OPTIONS = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const DEPENDENCY_STATUS_OPTIONS = [
  "OPEN",
  "IN_PROGRESS",
  "MET",
  "BLOCKED",
  "AT_RISK",
] as const;

export const QUESTION_STATUS_OPTIONS = ["OPEN", "ANSWERED", "DEFERRED"] as const;

export const RISK_CATEGORY_OPTIONS = [
  "BUSINESS",
  "TECHNICAL",
  "PROCESS",
  "PEOPLE",
  "RESOURCE",
  "GOVERNANCE",
  "DATA",
  "SECURITY",
  "TIMELINE",
  "FINANCIAL",
  "VENDOR",
  "CHANGE",
  "DELIVERY",
] as const;

export const PROBABILITY_OPTIONS = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;
export const IMPACT_OPTIONS = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;

export const PROJECT_STATUS_OPTIONS = [
  "PROPOSED",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETE",
  "CANCELLED",
] as const;

export const DELIVERABLE_STATUS_OPTIONS = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "AT_RISK",
  "COMPLETE",
  "CANCELLED",
] as const;

export const CHANGE_REQUEST_STATUS_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "IMPLEMENTED",
  "CANCELLED",
] as const;

export const APPROVAL_STATUS_OPTIONS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export const NOTIFICATION_TYPE_OPTIONS = [
  "INFO",
  "WARNING",
  "ESCALATION",
  "APPROVAL_REQUEST",
  "MENTION",
  "REMINDER",
] as const;

export const DOCUMENT_STATUS_OPTIONS = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "ARCHIVED",
] as const;

/** Numeric weights for risk scoring (probability x impact). */
export const LEVEL_WEIGHT: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  UNKNOWN: 0,
};

export function riskScore(probability: string, impact: string): number {
  return (LEVEL_WEIGHT[probability] ?? 0) * (LEVEL_WEIGHT[impact] ?? 0);
}
