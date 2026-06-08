import { LinkKind, PrismaClient, RegisterType } from "@prisma/client";

const ID_PATTERNS: { type: RegisterType; regex: RegExp }[] = [
  { type: RegisterType.DECISION, regex: /\bDEC-\d{3}\b/gi },
  { type: RegisterType.ACTION, regex: /\bACT-\d{3}\b/gi },
  { type: RegisterType.RISK, regex: /\bRSK-\d{3}\b/gi },
  { type: RegisterType.ISSUE, regex: /\bISS-\d{3}\b/gi },
  { type: RegisterType.ASSUMPTION, regex: /\bASM-\d{3}\b/gi },
  { type: RegisterType.DEPENDENCY, regex: /\bDEP-\d{3}\b/gi },
  { type: RegisterType.OPEN_QUESTION, regex: /\bQST-\d{3}\b/gi },
  { type: RegisterType.PARKING_LOT, regex: /\bPRK-\d{3}\b/gi },
  { type: RegisterType.TRADEOFF, regex: /\bTO-\d+\b/gi },
];

function normalizeId(id: string, type: RegisterType): string {
  const u = id.toUpperCase();
  if (type === RegisterType.ACTION && /^\d+$/.test(u)) return `ACT-${u.padStart(3, "0")}`;
  return u;
}

function extractIds(text: string | null | undefined): { type: RegisterType; id: string }[] {
  if (!text) return [];
  const found: { type: RegisterType; id: string }[] = [];
  for (const { type, regex } of ID_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      found.push({ type, id: normalizeId(m[0], type) });
    }
  }
  return found;
}

type EntityRef = {
  type: RegisterType;
  externalId: string;
  traceRef?: string | null;
  relatedRefs?: string | null;
};

async function loadEntities(prisma: PrismaClient): Promise<EntityRef[]> {
  const refs: EntityRef[] = [];
  const decisions = await prisma.decision.findMany({ select: { externalId: true, traceRef: true } });
  for (const d of decisions) refs.push({ type: RegisterType.DECISION, externalId: d.externalId, traceRef: d.traceRef });

  const actions = await prisma.action.findMany({
    select: { externalId: true, traceRef: true, relatedRefs: true },
  });
  for (const a of actions)
    refs.push({
      type: RegisterType.ACTION,
      externalId: a.externalId,
      traceRef: a.traceRef,
      relatedRefs: a.relatedRefs,
    });

  const risks = await prisma.risk.findMany({ select: { externalId: true } });
  for (const r of risks) refs.push({ type: RegisterType.RISK, externalId: r.externalId });

  const issues = await prisma.issue.findMany({ select: { externalId: true } });
  for (const i of issues) refs.push({ type: RegisterType.ISSUE, externalId: i.externalId });

  const deps = await prisma.dependency.findMany({ select: { externalId: true, description: true } });
  for (const d of deps)
    refs.push({
      type: RegisterType.DEPENDENCY,
      externalId: d.externalId,
      relatedRefs: d.description,
    });

  const assumptions = await prisma.assumption.findMany({ select: { externalId: true, traceRef: true } });
  for (const a of assumptions)
    refs.push({ type: RegisterType.ASSUMPTION, externalId: a.externalId, traceRef: a.traceRef });

  const questions = await prisma.openQuestion.findMany({ select: { externalId: true, traceRef: true } });
  for (const q of questions)
    refs.push({ type: RegisterType.OPEN_QUESTION, externalId: q.externalId, traceRef: q.traceRef });

  const parking = await prisma.parkingLotItem.findMany({ select: { externalId: true, traceRef: true } });
  for (const p of parking)
    refs.push({ type: RegisterType.PARKING_LOT, externalId: p.externalId, traceRef: p.traceRef });

  const tradeoffs = await prisma.tradeoff.findMany({ select: { externalId: true, traceRef: true } });
  for (const t of tradeoffs)
    refs.push({ type: RegisterType.TRADEOFF, externalId: t.externalId, traceRef: t.traceRef });

  const critical = await prisma.criticalPathStep.findMany({ select: { stepNumber: true, traceRef: true } });
  for (const c of critical)
    refs.push({
      type: RegisterType.ACTION,
      externalId: `CP-${c.stepNumber}`,
      traceRef: c.traceRef,
    });

  return refs;
}

export async function seedLinksAndTraces(prisma: PrismaClient) {
  const entities = await loadEntities(prisma);
  const linkKeys = new Set<string>();

  for (const entity of entities) {
    // Critical-path steps are pseudo-entities (CP-N) that are NOT a RegisterType.
    // Storing links as ACTION:CP-N produces dangling endpoints, so skip them
    // here; critical-path ↔ RAID linkage is modelled separately.
    if (entity.externalId?.startsWith("CP-")) continue;
    const texts = [entity.traceRef, entity.relatedRefs].filter(Boolean) as string[];
    for (const text of texts) {
      const targets = extractIds(text).filter((t) => !(t.type === entity.type && t.id === entity.externalId));

      const dayMatch = text.match(/D(\d+)/i);
      const sessMatch = text.match(/S([\d\-]+)/i);
      const srcMatch = text.match(/(SRC-\d+)/i);

      if (entity.externalId && !entity.externalId.startsWith("CP-")) {
        await prisma.traceReference.create({
          data: {
            entityType: entity.type,
            entityExternalId: entity.externalId,
            workshopDay: dayMatch ? parseInt(dayMatch[1], 10) : undefined,
            sessionRef: sessMatch ? `S${sessMatch[1]}` : undefined,
            sourceExternalId: srcMatch?.[1].toUpperCase(),
            rawTrace: text,
          },
        });
      }

      for (const target of targets) {
        const key = `${entity.type}|${entity.externalId}|${target.type}|${target.id}|${LinkKind.RELATED}`;
        if (linkKeys.has(key)) continue;
        linkKeys.add(key);
        await prisma.registerLink.create({
          data: {
            fromType: entity.type,
            fromExternalId: entity.externalId,
            toType: target.type,
            toExternalId: target.id,
            linkKind: LinkKind.RELATED,
          },
        });
      }
    }
  }

  // Enrich from mitigation text on risks (ACT references)
  const risks = await prisma.risk.findMany();
  for (const risk of risks) {
    const text = `${risk.mitigationRequired ?? ""} ${risk.mitigationDiscussed ?? ""}`;
    for (const target of extractIds(text)) {
      if (target.id === risk.externalId) continue;
      const key = `${RegisterType.RISK}|${risk.externalId}|${target.type}|${target.id}|${LinkKind.MITIGATES}`;
      if (linkKeys.has(key)) continue;
      linkKeys.add(key);
      await prisma.registerLink.create({
        data: {
          fromType: RegisterType.RISK,
          fromExternalId: risk.externalId,
          toType: target.type,
          toExternalId: target.id,
          linkKind: LinkKind.MITIGATES,
        },
      });
    }
  }
}
