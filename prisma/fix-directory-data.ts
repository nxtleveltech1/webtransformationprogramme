/**
 * One-time, idempotent directory data correction.
 *
 * Fixes the polluted `Person` table that made the Stakeholder Directory read
 * like a glossary:
 *   1. Merge duplicates / aliases / parser fragments onto one canonical Person,
 *      re-pointing EVERY Person foreign key first (no orphaned references).
 *   2. Reclassify groups / functions / titles as `kind = GROUP` (kept for
 *      owner/audit integrity, hidden from the directory).
 *   3. Reclassify unresolved non-person leftovers as GROUP, or delete them when
 *      they have no foreign-key references.
 *   4. Delete glossary rows that leaked from table headers (Area / System /
 *      Acronym / Term / Geography).
 *
 * Safe by design (per the project's data-preservation / migration rules):
 *   - Runs inside a single transaction.
 *   - `--dry-run` rolls the transaction back and only prints projected counts.
 *   - Intended to be run against a Neon branch first, then the default branch.
 *
 * Usage:
 *   tsx prisma/fix-directory-data.ts --dry-run
 *   tsx prisma/fix-directory-data.ts
 */
import { Confidence, Prisma, PrismaClient } from "@prisma/client";
import {
  CANONICAL_PEOPLE,
  isNonPersonToken,
  normalizePersonToken,
  resolveCanonical,
} from "./seed/people-canonical";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");
const ROLLBACK_SENTINEL = "DRY_RUN_ROLLBACK";

/** Glossary terms that are really column headers and must not exist as terms. */
const LEAKED_GLOSSARY_TERMS = ["Area", "System", "Acronym", "Term", "Geography", "Geographies"];

type Tx = Prisma.TransactionClient;

type PersonRow = {
  id: string;
  displayName: string;
  surname: string | null;
  roleDescription: string | null;
  department: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  confidence: Confidence;
  areaId: string | null;
  businessId: string | null;
  clusterId: string | null;
  primaryWorkstreamId: string | null;
};

const CONFIDENCE_RANK: Record<Confidence, number> = {
  CONFIRMED: 4,
  REQUIRES_VALIDATION: 3,
  INFERRED: 2,
  UNCONFIRMED: 1,
};

function fullName(p: { displayName: string; surname: string | null }): string {
  return [p.displayName, p.surname].filter(Boolean).join(" ");
}

/** Re-point every Person foreign key from `fromId` to `toId`. */
async function repointPersonFks(tx: Tx, fromId: string, toId: string): Promise<void> {
  // Simple owner/lead/recipient/validator/approver FKs (no unique constraint).
  await tx.workstream.updateMany({ where: { leadPersonId: fromId }, data: { leadPersonId: toId } });
  await tx.decision.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.action.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.risk.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.issue.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.assumption.updateMany({
    where: { validatorPersonId: fromId },
    data: { validatorPersonId: toId },
  });
  await tx.project.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.deliverable.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.task.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.readinessGate.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.governanceMeeting.updateMany({
    where: { ownerPersonId: fromId },
    data: { ownerPersonId: toId },
  });
  await tx.approval.updateMany({ where: { approverPersonId: fromId }, data: { approverPersonId: toId } });
  await tx.changeRequest.updateMany({
    where: { approverPersonId: fromId },
    data: { approverPersonId: toId },
  });
  await tx.notification.updateMany({
    where: { recipientPersonId: fromId },
    data: { recipientPersonId: toId },
  });
  await tx.document.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.governanceReferenceDoc.updateMany({
    where: { ownerPersonId: fromId },
    data: { ownerPersonId: toId },
  });
  await tx.resourceAllocation.updateMany({ where: { personId: fromId }, data: { personId: toId } });
  await tx.person.updateMany({
    where: { dataOwnerPersonId: fromId },
    data: { dataOwnerPersonId: toId },
  });

  // PersonTeam — @@unique([personId, teamId]); drop colliding rows, move the rest.
  const fromTeams = await tx.personTeam.findMany({ where: { personId: fromId } });
  for (const pt of fromTeams) {
    const clash = await tx.personTeam.findUnique({
      where: { personId_teamId: { personId: toId, teamId: pt.teamId } },
    });
    if (clash) {
      await tx.personTeam.delete({ where: { id: pt.id } });
    } else {
      await tx.personTeam.update({ where: { id: pt.id }, data: { personId: toId } });
    }
  }

  // ProgrammeRoleAssignment — @@unique([personId, roleType, scope]).
  const fromRoles = await tx.programmeRoleAssignment.findMany({ where: { personId: fromId } });
  for (const pr of fromRoles) {
    const clash = await tx.programmeRoleAssignment.findFirst({
      where: { personId: toId, roleType: pr.roleType, scope: pr.scope },
    });
    if (clash) {
      await tx.programmeRoleAssignment.delete({ where: { id: pr.id } });
    } else {
      await tx.programmeRoleAssignment.update({ where: { id: pr.id }, data: { personId: toId } });
    }
  }

  // StakeholderRole — no unique constraint; dedupe on (roleType, scope).
  const fromStake = await tx.stakeholderRole.findMany({ where: { personId: fromId } });
  for (const sr of fromStake) {
    const clash = await tx.stakeholderRole.findFirst({
      where: { personId: toId, roleType: sr.roleType, scope: sr.scope },
    });
    if (clash) {
      await tx.stakeholderRole.delete({ where: { id: sr.id } });
    } else {
      await tx.stakeholderRole.update({ where: { id: sr.id }, data: { personId: toId } });
    }
  }

  // Resource — personId @unique (1:1); keep canonical's, orphan the loser.
  const fromResource = await tx.resource.findFirst({ where: { personId: fromId } });
  if (fromResource) {
    const toResource = await tx.resource.findFirst({ where: { personId: toId } });
    if (toResource) {
      await tx.resource.update({ where: { id: fromResource.id }, data: { personId: null } });
    } else {
      await tx.resource.update({ where: { id: fromResource.id }, data: { personId: toId } });
    }
  }

  // User — personId @unique (1:1); keep canonical's, orphan the loser.
  const fromUser = await tx.user.findFirst({ where: { personId: fromId } });
  if (fromUser) {
    const toUser = await tx.user.findFirst({ where: { personId: toId } });
    if (toUser) {
      await tx.user.update({ where: { id: fromUser.id }, data: { personId: null } });
    } else {
      await tx.user.update({ where: { id: fromUser.id }, data: { personId: toId } });
    }
  }
}

/** Total number of Person FK references for a person id. */
async function countPersonRefs(tx: Tx, id: string): Promise<number> {
  const counts = await Promise.all([
    tx.workstream.count({ where: { leadPersonId: id } }),
    tx.decision.count({ where: { ownerPersonId: id } }),
    tx.action.count({ where: { ownerPersonId: id } }),
    tx.risk.count({ where: { ownerPersonId: id } }),
    tx.issue.count({ where: { ownerPersonId: id } }),
    tx.assumption.count({ where: { validatorPersonId: id } }),
    tx.project.count({ where: { ownerPersonId: id } }),
    tx.deliverable.count({ where: { ownerPersonId: id } }),
    tx.task.count({ where: { ownerPersonId: id } }),
    tx.readinessGate.count({ where: { ownerPersonId: id } }),
    tx.governanceMeeting.count({ where: { ownerPersonId: id } }),
    tx.approval.count({ where: { approverPersonId: id } }),
    tx.changeRequest.count({ where: { approverPersonId: id } }),
    tx.notification.count({ where: { recipientPersonId: id } }),
    tx.document.count({ where: { ownerPersonId: id } }),
    tx.governanceReferenceDoc.count({ where: { ownerPersonId: id } }),
    tx.resourceAllocation.count({ where: { personId: id } }),
    tx.personTeam.count({ where: { personId: id } }),
    tx.programmeRoleAssignment.count({ where: { personId: id } }),
    tx.stakeholderRole.count({ where: { personId: id } }),
    tx.resource.count({ where: { personId: id } }),
    tx.user.count({ where: { personId: id } }),
    tx.person.count({ where: { dataOwnerPersonId: id } }),
  ]);
  return counts.reduce((a, b) => a + b, 0);
}

/** Fill null/weaker scalar fields on the keeper from a merged source row. */
function mergedKeeperData(keeper: PersonRow, source: PersonRow): Prisma.PersonUpdateInput {
  const data: Prisma.PersonUpdateInput = {};
  const fill: (keyof PersonRow)[] = [
    "department",
    "location",
    "email",
    "phone",
    "mobile",
  ];
  for (const f of fill) {
    if (!keeper[f] && source[f]) (data as Record<string, unknown>)[f] = source[f];
  }
  // Prefer the longer/richer role description.
  const krole = keeper.roleDescription ?? "";
  const srole = source.roleDescription ?? "";
  if (srole.length > krole.length) data.roleDescription = srole;
  // Relations are set via *Id scalars.
  if (!keeper.areaId && source.areaId) data.area = { connect: { id: source.areaId } };
  if (!keeper.businessId && source.businessId) data.business = { connect: { id: source.businessId } };
  if (!keeper.clusterId && source.clusterId) data.cluster = { connect: { id: source.clusterId } };
  if (!keeper.primaryWorkstreamId && source.primaryWorkstreamId) {
    data.primaryWorkstream = { connect: { id: source.primaryWorkstreamId } };
  }
  if (CONFIDENCE_RANK[source.confidence] > CONFIDENCE_RANK[keeper.confidence]) {
    data.confidence = source.confidence;
  }
  return data;
}

async function snapshotCounts(tx: Tx) {
  const [people, groups, total, glossary, leaked] = await Promise.all([
    tx.person.count({ where: { kind: "PERSON" } }),
    tx.person.count({ where: { kind: "GROUP" } }),
    tx.person.count(),
    tx.glossaryTerm.count(),
    tx.glossaryTerm.count({ where: { term: { in: LEAKED_GLOSSARY_TERMS } } }),
  ]);
  return { people, groups, total, glossary, leaked };
}

async function run() {
  console.log(`\n=== fix-directory-data ${DRY_RUN ? "(DRY RUN — will roll back)" : "(LIVE)"} ===\n`);

  try {
    await prisma.$transaction(
      async (tx) => {
      const before = await snapshotCounts(tx);
      console.log("BEFORE:", before);

      const rows = (await tx.person.findMany({
        select: {
          id: true,
          displayName: true,
          surname: true,
          roleDescription: true,
          department: true,
          location: true,
          email: true,
          phone: true,
          mobile: true,
          confidence: true,
          areaId: true,
          businessId: true,
          clusterId: true,
          primaryWorkstreamId: true,
        },
      })) as PersonRow[];

      // ── Classify every existing Person row ─────────────────────────────────
      const groupsByKey = new Map<string, PersonRow[]>();
      const nonPersonRows: PersonRow[] = [];
      const unresolvedRows: PersonRow[] = [];

      for (const row of rows) {
        const name = fullName(row);
        const canonical = resolveCanonical(name);
        if (canonical) {
          const list = groupsByKey.get(canonical.key) ?? [];
          list.push(row);
          groupsByKey.set(canonical.key, list);
        } else if (isNonPersonToken(name)) {
          nonPersonRows.push(row);
        } else {
          unresolvedRows.push(row);
        }
      }

      // ── 1. Merge each canonical group onto a single keeper ─────────────────
      let merged = 0;
      let renamed = 0;
      for (const person of CANONICAL_PEOPLE) {
        const group = groupsByKey.get(person.key);
        if (!group || group.length === 0) continue;

        const canonicalName = { displayName: person.displayName, surname: person.surname };
        // Prefer the row already at canonical identity; else the richest row.
        const keeper =
          group.find(
            (r) => r.displayName === person.displayName && (r.surname ?? null) === (person.surname ?? null),
          ) ??
          group.find((r) => r.surname) ??
          group[0];

        for (const source of group) {
          if (source.id === keeper.id) continue;
          await repointPersonFks(tx, source.id, keeper.id);
          const fillData = mergedKeeperData(keeper, source);
          if (Object.keys(fillData).length > 0) {
            await tx.person.update({ where: { id: keeper.id }, data: fillData });
            // keep keeper snapshot roughly in sync for subsequent merges
            Object.assign(keeper, {
              areaId: keeper.areaId ?? source.areaId,
              businessId: keeper.businessId ?? source.businessId,
              clusterId: keeper.clusterId ?? source.clusterId,
              primaryWorkstreamId: keeper.primaryWorkstreamId ?? source.primaryWorkstreamId,
            });
          }
          await tx.person.delete({ where: { id: source.id } });
          merged++;
          console.log(`  merged "${fullName(source)}" → "${fullName(canonicalName)}"`);
        }

        // Promote keeper to the canonical identity + ensure kind=PERSON.
        const needsRename =
          keeper.displayName !== person.displayName ||
          (keeper.surname ?? null) !== (person.surname ?? null);
        await tx.person.update({
          where: { id: keeper.id },
          data: {
            displayName: person.displayName,
            surname: person.surname,
            kind: "PERSON",
          },
        });
        if (needsRename) {
          renamed++;
          console.log(`  renamed keeper → "${fullName(canonicalName)}"`);
        }
      }

      // ── 2. Reclassify known groups / functions / titles as GROUP ───────────
      let regrouped = 0;
      for (const row of nonPersonRows) {
        await tx.person.update({ where: { id: row.id }, data: { kind: "GROUP" } });
        regrouped++;
        console.log(`  group  "${fullName(row)}" → kind=GROUP`);
      }

      // ── 3. Unresolved leftovers: delete if unreferenced, else hide as GROUP ─
      let deletedLeftover = 0;
      let hiddenLeftover = 0;
      for (const row of unresolvedRows) {
        const refs = await countPersonRefs(tx, row.id);
        if (refs === 0) {
          await tx.person.delete({ where: { id: row.id } });
          deletedLeftover++;
          console.log(`  deleted unresolved "${fullName(row)}" (no references)`);
        } else {
          await tx.person.update({ where: { id: row.id }, data: { kind: "GROUP" } });
          hiddenLeftover++;
          console.log(`  hid unresolved "${fullName(row)}" → kind=GROUP (${refs} refs)`);
        }
      }

      // ── 4. Delete leaked glossary header rows ──────────────────────────────
      const leakedDeleted = await tx.glossaryTerm.deleteMany({
        where: { term: { in: LEAKED_GLOSSARY_TERMS } },
      });

      const after = await snapshotCounts(tx);
      console.log("\nAFTER: ", after);
      console.log("\nSummary:", {
        merged,
        renamed,
        regrouped,
        deletedLeftover,
        hiddenLeftover,
        leakedGlossaryDeleted: leakedDeleted.count,
      });

      if (DRY_RUN) throw new Error(ROLLBACK_SENTINEL);
      },
      { maxWait: 30_000, timeout: 180_000 },
    );

    console.log("\n✔ Correction committed.\n");
  } catch (err) {
    if (err instanceof Error && err.message === ROLLBACK_SENTINEL) {
      console.log("\n✔ Dry run complete — transaction rolled back, no changes persisted.\n");
    } else {
      throw err;
    }
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
