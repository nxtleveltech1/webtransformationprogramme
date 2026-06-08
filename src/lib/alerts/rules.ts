import type { NotificationType, Priority } from "@prisma/client";

/**
 * Alert rule definitions for the automated alerting engine.
 *
 * Each rule maps a real programme trigger (evaluated against live Prisma data
 * in `engine.ts`) to a `Notification` shape. Rules are deliberately declarative:
 * the engine owns the querying + idempotency, the rules own the classification
 * (type / priority) and the human-readable copy.
 */

/** Stable identifiers for each rule. Encoded into the dedupe key — do NOT rename. */
export const ALERT_RULES = [
  "RISK_HIGH_IMPACT",
  "DEPENDENCY_BLOCKED",
  "READINESS_GATE_OVERDUE",
  "MILESTONE_SLIPPING",
] as const;

export type AlertRuleId = (typeof ALERT_RULES)[number];

export interface AlertRuleMeta {
  id: AlertRuleId;
  /** The entity the trigger relates to (stored in Notification.relatedType). */
  relatedType: string;
  type: NotificationType;
  priority: Priority;
  /** Short human description, used in audit payloads. */
  description: string;
}

export const ALERT_RULE_META: Record<AlertRuleId, AlertRuleMeta> = {
  RISK_HIGH_IMPACT: {
    id: "RISK_HIGH_IMPACT",
    relatedType: "Risk",
    type: "ESCALATION",
    priority: "HIGH",
    description: "Open risk with HIGH impact requires owner attention.",
  },
  DEPENDENCY_BLOCKED: {
    id: "DEPENDENCY_BLOCKED",
    relatedType: "Dependency",
    type: "ESCALATION",
    priority: "CRITICAL",
    description: "Dependency is BLOCKED and needs escalation.",
  },
  READINESS_GATE_OVERDUE: {
    id: "READINESS_GATE_OVERDUE",
    relatedType: "ReadinessGate",
    type: "WARNING",
    priority: "HIGH",
    description: "Readiness gate is overdue and not yet approved/complete.",
  },
  MILESTONE_SLIPPING: {
    id: "MILESTONE_SLIPPING",
    relatedType: "Milestone",
    type: "WARNING",
    priority: "MEDIUM",
    description: "Milestone is slipping (variance > 0 or target date passed).",
  },
};

/**
 * Deterministic dedupe key encoding rule + entity. Stored verbatim at the start
 * of `Notification.body` so re-runs can detect an existing live alert for the
 * same trigger and skip it. Format is parseable and stable.
 */
export function alertDedupeKey(ruleId: AlertRuleId, entityId: string): string {
  return `[alert:${ruleId}:${entityId}]`;
}
