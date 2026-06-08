import { prisma } from "@/lib/db";
import { parseDateMs } from "@/lib/utils";
import {
  ALERT_RULE_META,
  alertDedupeKey,
  type AlertRuleId,
} from "@/lib/alerts/rules";
import type { NotificationType, Priority } from "@prisma/client";

/**
 * Automated alerting engine.
 *
 * Evaluates the four alert rules against LIVE programme data and creates
 * `Notification` rows for any trigger that does not already have an open
 * (unread) alert. It never backfills history and never fabricates data — it
 * only reflects the current real state of the registers.
 *
 * Idempotency: every generated notification embeds a deterministic dedupe key
 * (`[alert:<RULE>:<entityId>]`) at the start of its body. Before inserting we
 * load the existing UNREAD notifications for the relevant entities and skip any
 * candidate whose key already appears. Re-running the engine therefore produces
 * no duplicates; once a human reads (acknowledges) an alert it can be raised
 * again on a later run if the trigger condition still holds.
 */

interface AlertCandidate {
  ruleId: AlertRuleId;
  entityId: string;
  recipientPersonId: string | null;
  type: NotificationType;
  priority: Priority;
  relatedType: string;
  title: string;
  body: string;
  actionUrl: string;
}

export interface AlertEngineResult {
  /** Notifications actually created on this run. */
  created: number;
  /** Candidates skipped because a live alert already existed. */
  skipped: number;
  /** Per-rule counts for visibility/audit. */
  byRule: Record<AlertRuleId, number>;
}

function withKey(ruleId: AlertRuleId, entityId: string, body: string): string {
  return `${alertDedupeKey(ruleId, entityId)} ${body}`;
}

/** Rule 1: Open risks with HIGH impact -> escalate to the risk owner. */
async function collectHighImpactRiskAlerts(): Promise<AlertCandidate[]> {
  const meta = ALERT_RULE_META.RISK_HIGH_IMPACT;
  const risks = await prisma.risk.findMany({
    where: {
      impact: "HIGH",
      status: { notIn: ["Closed", "Resolved", "Mitigated"] },
    },
    select: { id: true, externalId: true, description: true, ownerPersonId: true },
  });

  return risks.map((risk) => ({
    ruleId: meta.id,
    entityId: risk.id,
    recipientPersonId: risk.ownerPersonId,
    type: meta.type,
    priority: meta.priority,
    relatedType: meta.relatedType,
    title: `High-impact risk needs attention: ${risk.externalId}`,
    body: withKey(
      meta.id,
      risk.id,
      `Risk ${risk.externalId} has HIGH impact and is still open. ${risk.description}`.trim(),
    ),
    actionUrl: "/risks",
  }));
}

/**
 * Rule 2: BLOCKED dependencies -> escalate to the owning workstream lead.
 * Dependencies have no direct owner person, so we route to the workstream lead.
 */
async function collectBlockedDependencyAlerts(): Promise<AlertCandidate[]> {
  const meta = ALERT_RULE_META.DEPENDENCY_BLOCKED;
  const deps = await prisma.dependency.findMany({
    where: { status: "BLOCKED" },
    select: {
      id: true,
      externalId: true,
      description: true,
      ownerText: true,
      workstream: { select: { leadPersonId: true } },
    },
  });

  return deps.map((dep) => ({
    ruleId: meta.id,
    entityId: dep.id,
    recipientPersonId: dep.workstream?.leadPersonId ?? null,
    type: meta.type,
    priority: meta.priority,
    relatedType: meta.relatedType,
    title: `Blocked dependency: ${dep.externalId}`,
    body: withKey(
      meta.id,
      dep.id,
      `Dependency ${dep.externalId} is BLOCKED${
        dep.ownerText ? ` (owner: ${dep.ownerText})` : ""
      }. ${dep.description}`.trim(),
    ),
    actionUrl: "/dependencies",
  }));
}

/**
 * Rule 3: Readiness gates whose dueDate is in the past and which are not yet
 * COMPLETE/APPROVED (READY/APPROVED here, plus we exclude REJECTED) -> warn the
 * gate owner.
 */
async function collectOverdueReadinessGateAlerts(): Promise<AlertCandidate[]> {
  const meta = ALERT_RULE_META.READINESS_GATE_OVERDUE;
  const gates = await prisma.readinessGate.findMany({
    where: { status: { notIn: ["APPROVED", "REJECTED"] } },
    select: {
      id: true,
      externalId: true,
      name: true,
      dueDate: true,
      ownerPersonId: true,
    },
  });

  const now = Date.now();
  const overdue = gates.filter((gate) => {
    const due = parseDateMs(gate.dueDate);
    return due !== null && due < now;
  });

  return overdue.map((gate) => ({
    ruleId: meta.id,
    entityId: gate.id,
    recipientPersonId: gate.ownerPersonId,
    type: meta.type,
    priority: meta.priority,
    relatedType: meta.relatedType,
    title: `Readiness gate overdue: ${gate.name}`,
    body: withKey(
      meta.id,
      gate.id,
      `Readiness gate ${gate.externalId} (${gate.name}) is past its due date (${gate.dueDate}) and not yet approved.`,
    ),
    actionUrl: "/readiness",
  }));
}

/**
 * Rule 4: Milestones slipping — varianceDays > 0, OR a real target date in the
 * past while the milestone is not complete. Milestones have no owner person, so
 * we route to the workstream lead when one exists.
 */
async function collectSlippingMilestoneAlerts(): Promise<AlertCandidate[]> {
  const meta = ALERT_RULE_META.MILESTONE_SLIPPING;
  const milestones = await prisma.milestone.findMany({
    select: {
      id: true,
      title: true,
      targetDate: true,
      varianceDays: true,
      status: true,
      workstream: { select: { leadPersonId: true } },
    },
  });

  const now = Date.now();
  const isComplete = (status: string | null) =>
    !!status && /complete|done|achieved/i.test(status);

  const slipping = milestones.filter((m) => {
    if (isComplete(m.status)) return false;
    if ((m.varianceDays ?? 0) > 0) return true;
    const target = parseDateMs(m.targetDate);
    return target !== null && target < now;
  });

  return slipping.map((m) => {
    const variance = m.varianceDays ?? 0;
    const reason =
      variance > 0
        ? `slipping by ${variance} day(s)`
        : `past its target date (${m.targetDate})`;
    return {
      ruleId: meta.id,
      entityId: m.id,
      recipientPersonId: m.workstream?.leadPersonId ?? null,
      type: meta.type,
      priority: meta.priority,
      relatedType: meta.relatedType,
      title: `Milestone slipping: ${m.title}`,
      body: withKey(
        meta.id,
        m.id,
        `Milestone "${m.title}" is ${reason} and not yet complete.`,
      ),
      actionUrl: "/milestones",
    };
  });
}

/**
 * Evaluate every rule and create notifications for new triggers only.
 */
export async function evaluateAlertRules(): Promise<AlertEngineResult> {
  const candidateGroups = await Promise.all([
    collectHighImpactRiskAlerts(),
    collectBlockedDependencyAlerts(),
    collectOverdueReadinessGateAlerts(),
    collectSlippingMilestoneAlerts(),
  ]);
  const candidates = candidateGroups.flat();

  const byRule: Record<AlertRuleId, number> = {
    RISK_HIGH_IMPACT: 0,
    DEPENDENCY_BLOCKED: 0,
    READINESS_GATE_OVERDUE: 0,
    MILESTONE_SLIPPING: 0,
  };

  if (candidates.length === 0) {
    return { created: 0, skipped: 0, byRule };
  }

  // Load existing UNREAD alerts for the entities in scope so we can dedupe in a
  // single query rather than per-candidate.
  const relatedIds = candidates.map((c) => c.entityId);
  const existing = await prisma.notification.findMany({
    where: { read: false, relatedId: { in: relatedIds } },
    select: { body: true },
  });
  const existingKeys = new Set(
    existing
      .map((n) => n.body?.match(/^\[alert:[^\]]+\]/)?.[0])
      .filter((k): k is string => Boolean(k)),
  );

  const toCreate = candidates.filter(
    (c) => !existingKeys.has(alertDedupeKey(c.ruleId, c.entityId)),
  );
  const skipped = candidates.length - toCreate.length;

  for (const c of toCreate) {
    await prisma.notification.create({
      data: {
        recipientPersonId: c.recipientPersonId,
        type: c.type,
        priority: c.priority,
        title: c.title,
        body: c.body,
        relatedType: c.relatedType,
        relatedId: c.entityId,
        actionUrl: c.actionUrl,
      },
    });
    byRule[c.ruleId] += 1;
  }

  return { created: toCreate.length, skipped, byRule };
}
