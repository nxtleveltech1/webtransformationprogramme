import type { LinkKind, RegisterType } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * A RegisterLink resolved from the perspective of a single register item: the
 * "target" is always the item on the *other* end of the link, with its type,
 * externalId, a human-readable title/summary and an optional status label.
 * `direction` records whether the current item is the source or the target of
 * the underlying RegisterLink row so the UI can phrase the relationship.
 */
export type RelatedLink = {
  id: string;
  linkKind: LinkKind;
  direction: "outgoing" | "incoming";
  targetType: RegisterType;
  targetExternalId: string;
  targetTitle: string;
  targetStatus: string | null;
  /** Route to the target register list (null when no route exists). */
  href: string | null;
};

/** Maps a RegisterType to its list route, or null when no route exists. */
const ROUTE_BY_TYPE: Record<RegisterType, string | null> = {
  DECISION: "/decisions",
  ACTION: null,
  RISK: "/risks",
  ISSUE: "/issues",
  ASSUMPTION: "/assumptions",
  DEPENDENCY: "/dependencies",
  OPEN_QUESTION: "/open-questions",
  PARKING_LOT: "/parking-lot",
  TRADEOFF: null,
};

/** Human label for each register type. */
export const TYPE_LABEL: Record<RegisterType, string> = {
  DECISION: "Decision",
  ACTION: "Action",
  RISK: "Risk",
  ISSUE: "Issue",
  ASSUMPTION: "Assumption",
  DEPENDENCY: "Dependency",
  OPEN_QUESTION: "Open question",
  PARKING_LOT: "Parking lot",
  TRADEOFF: "Trade-off",
};

type Resolved = { title: string; status: string | null };

/**
 * Resolves titles/summaries and statuses for a set of externalIds within a
 * single register type. Returns a Map keyed by externalId.
 */
async function resolveTitles(
  type: RegisterType,
  externalIds: string[],
): Promise<Map<string, Resolved>> {
  const out = new Map<string, Resolved>();
  const ids = Array.from(new Set(externalIds));
  if (ids.length === 0) return out;

  const where = { externalId: { in: ids } };

  switch (type) {
    case "DECISION": {
      const rows = await prisma.decision.findMany({
        where,
        select: { externalId: true, title: true, description: true, status: true },
      });
      for (const r of rows) {
        out.set(r.externalId, { title: r.title ?? r.description, status: r.status });
      }
      break;
    }
    case "ACTION": {
      const rows = await prisma.action.findMany({
        where,
        select: { externalId: true, description: true, status: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.description, status: r.status });
      break;
    }
    case "RISK": {
      const rows = await prisma.risk.findMany({
        where,
        select: { externalId: true, description: true, status: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.description, status: r.status });
      break;
    }
    case "ISSUE": {
      const rows = await prisma.issue.findMany({
        where,
        select: { externalId: true, description: true, status: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.description, status: r.status });
      break;
    }
    case "ASSUMPTION": {
      const rows = await prisma.assumption.findMany({
        where,
        select: { externalId: true, description: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.description, status: null });
      break;
    }
    case "DEPENDENCY": {
      const rows = await prisma.dependency.findMany({
        where,
        select: { externalId: true, description: true, status: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.description, status: r.status });
      break;
    }
    case "OPEN_QUESTION": {
      const rows = await prisma.openQuestion.findMany({
        where,
        select: { externalId: true, question: true, status: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.question, status: r.status });
      break;
    }
    case "PARKING_LOT": {
      const rows = await prisma.parkingLotItem.findMany({
        where,
        select: { externalId: true, topic: true },
      });
      for (const r of rows) out.set(r.externalId, { title: r.topic, status: null });
      break;
    }
    case "TRADEOFF": {
      const rows = await prisma.tradeoff.findMany({
        where,
        select: { externalId: true, dimension: true, decisionNeeded: true, status: true },
      });
      for (const r of rows) {
        out.set(r.externalId, {
          title: r.dimension ?? r.decisionNeeded ?? r.externalId,
          status: r.status,
        });
      }
      break;
    }
  }

  return out;
}

type RawTarget = {
  id: string;
  linkKind: LinkKind;
  direction: "outgoing" | "incoming";
  targetType: RegisterType;
  targetExternalId: string;
};

/**
 * Builds resolved RelatedLink rows from raw targets, batching title lookups by
 * target type to keep the number of queries small.
 */
async function resolveTargets(targets: RawTarget[]): Promise<RelatedLink[]> {
  const idsByType = new Map<RegisterType, string[]>();
  for (const t of targets) {
    const list = idsByType.get(t.targetType) ?? [];
    list.push(t.targetExternalId);
    idsByType.set(t.targetType, list);
  }

  const resolvedByType = new Map<RegisterType, Map<string, Resolved>>();
  await Promise.all(
    Array.from(idsByType.entries()).map(async ([type, ids]) => {
      resolvedByType.set(type, await resolveTitles(type, ids));
    }),
  );

  return targets.map((t) => {
    const resolved = resolvedByType.get(t.targetType)?.get(t.targetExternalId);
    return {
      id: t.id,
      linkKind: t.linkKind,
      direction: t.direction,
      targetType: t.targetType,
      targetExternalId: t.targetExternalId,
      targetTitle: resolved?.title ?? t.targetExternalId,
      targetStatus: resolved?.status ?? null,
      href: ROUTE_BY_TYPE[t.targetType],
    };
  });
}

/**
 * Returns all RegisterLink rows touching the given item (in both directions),
 * resolved to the linked item's type, externalId, title/summary, status and
 * linkKind — ready for the UI. Only real rows are returned; an item with no
 * links resolves to an empty array.
 */
export async function getRelatedLinks(
  type: RegisterType,
  externalId: string,
): Promise<RelatedLink[]> {
  const links = await prisma.registerLink.findMany({
    where: {
      OR: [
        { fromType: type, fromExternalId: externalId },
        { toType: type, toExternalId: externalId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  const targets: RawTarget[] = links.map((l) => {
    const isSource = l.fromType === type && l.fromExternalId === externalId;
    return isSource
      ? {
          id: l.id,
          linkKind: l.linkKind,
          direction: "outgoing",
          targetType: l.toType,
          targetExternalId: l.toExternalId,
        }
      : {
          id: l.id,
          linkKind: l.linkKind,
          direction: "incoming",
          targetType: l.fromType,
          targetExternalId: l.fromExternalId,
        };
  });

  return resolveTargets(targets);
}

/**
 * Batch variant of {@link getRelatedLinks} for list/detail-drawer pages: returns
 * a plain object mapping each requested externalId to its resolved links. Items
 * with no links are present with an empty array, so callers can index safely.
 */
export async function getRelatedLinksMap(
  type: RegisterType,
  externalIds: string[],
): Promise<Record<string, RelatedLink[]>> {
  const ids = Array.from(new Set(externalIds));
  const result: Record<string, RelatedLink[]> = {};
  for (const id of ids) result[id] = [];
  if (ids.length === 0) return result;

  const links = await prisma.registerLink.findMany({
    where: {
      OR: [
        { fromType: type, fromExternalId: { in: ids } },
        { toType: type, toExternalId: { in: ids } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Track which source item each raw target belongs to.
  const owners: string[] = [];
  const targets: RawTarget[] = [];
  for (const l of links) {
    const fromMatches = l.fromType === type && ids.includes(l.fromExternalId);
    const toMatches = l.toType === type && ids.includes(l.toExternalId);
    if (fromMatches) {
      owners.push(l.fromExternalId);
      targets.push({
        id: l.id,
        linkKind: l.linkKind,
        direction: "outgoing",
        targetType: l.toType,
        targetExternalId: l.toExternalId,
      });
    }
    if (toMatches) {
      owners.push(l.toExternalId);
      targets.push({
        id: l.id,
        linkKind: l.linkKind,
        direction: "incoming",
        targetType: l.fromType,
        targetExternalId: l.fromExternalId,
      });
    }
  }

  const resolved = await resolveTargets(targets);
  resolved.forEach((link, i) => {
    const owner = owners[i];
    (result[owner] ??= []).push(link);
  });

  return result;
}
