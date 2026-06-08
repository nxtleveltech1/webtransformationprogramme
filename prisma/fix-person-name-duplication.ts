/**
 * One-time, idempotent Person duplicate/displayName correction.
 *
 * Targets records where `displayName` redundantly repeats the `surname`
 * (e.g. displayName "Gareth Bew" + surname "Bew", rendered as "Gareth Bew Bew"
 * wherever the app concatenates displayName + surname). The convention every
 * other Person row follows is displayName = first name(s), surname = last name.
 *
 * Because there is a @@unique([displayName, surname]) constraint, a malformed
 * row often co-exists with the correct canonical row (e.g. "Gareth"/"Bew"). So
 * this is a MERGE, not a rename:
 *   1. For each malformed person D (displayName ends with " <surname>"), compute
 *      the corrected name C = displayName without the trailing surname.
 *   2. If a canonical person K already exists at (C, surname): keep whichever
 *      row has more FK references (the data-rich one), re-point ALL Person FKs
 *      from the loser onto the keeper, fill missing contact/relations on the
 *      keeper, delete the loser, then set keeper.displayName = C.
 *   3. If no canonical row exists: simply set displayName = C.
 *
 * Idempotent: re-running finds nothing to fix.
 *
 * Safe by design (per the project's data-preservation rules):
 *   - Runs inside a single transaction.
 *   - `--dry-run` rolls the transaction back and only prints what would change.
 *   - Run against a Neon branch first, then the default branch.
 *
 * Usage:
 *   tsx prisma/fix-person-name-duplication.ts --dry-run
 *   tsx prisma/fix-person-name-duplication.ts
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");
const ROLLBACK_SENTINEL = "DRY_RUN_ROLLBACK";

type Tx = Prisma.TransactionClient;

/** Re-point every Person foreign key from `fromId` to `toId`. */
async function repointPersonFks(tx: Tx, fromId: string, toId: string): Promise<void> {
  await tx.workstream.updateMany({ where: { leadPersonId: fromId }, data: { leadPersonId: toId } });
  await tx.decision.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.action.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.risk.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.issue.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.assumption.updateMany({ where: { validatorPersonId: fromId }, data: { validatorPersonId: toId } });
  await tx.project.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.deliverable.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.task.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.readinessGate.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.governanceMeeting.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.approval.updateMany({ where: { approverPersonId: fromId }, data: { approverPersonId: toId } });
  await tx.changeRequest.updateMany({ where: { approverPersonId: fromId }, data: { approverPersonId: toId } });
  await tx.notification.updateMany({ where: { recipientPersonId: fromId }, data: { recipientPersonId: toId } });
  await tx.document.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.governanceReferenceDoc.updateMany({ where: { ownerPersonId: fromId }, data: { ownerPersonId: toId } });
  await tx.resourceAllocation.updateMany({ where: { personId: fromId }, data: { personId: toId } });
  await tx.person.updateMany({ where: { dataOwnerPersonId: fromId }, data: { dataOwnerPersonId: toId } });

  // PersonTeam — @@unique([personId, teamId]); drop colliding rows, move the rest.
  for (const pt of await tx.personTeam.findMany({ where: { personId: fromId } })) {
    const clash = await tx.personTeam.findUnique({
      where: { personId_teamId: { personId: toId, teamId: pt.teamId } },
    });
    if (clash) await tx.personTeam.delete({ where: { id: pt.id } });
    else await tx.personTeam.update({ where: { id: pt.id }, data: { personId: toId } });
  }

  // ProgrammeRoleAssignment — @@unique([personId, roleType, scope]).
  for (const pr of await tx.programmeRoleAssignment.findMany({ where: { personId: fromId } })) {
    const clash = await tx.programmeRoleAssignment.findFirst({
      where: { personId: toId, roleType: pr.roleType, scope: pr.scope },
    });
    if (clash) await tx.programmeRoleAssignment.delete({ where: { id: pr.id } });
    else await tx.programmeRoleAssignment.update({ where: { id: pr.id }, data: { personId: toId } });
  }

  // StakeholderRole — no unique constraint; dedupe on (roleType, scope).
  for (const sr of await tx.stakeholderRole.findMany({ where: { personId: fromId } })) {
    const clash = await tx.stakeholderRole.findFirst({
      where: { personId: toId, roleType: sr.roleType, scope: sr.scope },
    });
    if (clash) await tx.stakeholderRole.delete({ where: { id: sr.id } });
    else await tx.stakeholderRole.update({ where: { id: sr.id }, data: { personId: toId } });
  }

  // Resource — personId @unique (1:1); keep keeper's, orphan the loser's.
  const fromResource = await tx.resource.findFirst({ where: { personId: fromId } });
  if (fromResource) {
    const toResource = await tx.resource.findFirst({ where: { personId: toId } });
    await tx.resource.update({
      where: { id: fromResource.id },
      data: { personId: toResource ? null : toId },
    });
  }

  // User — personId @unique (1:1); keep keeper's, orphan the loser's.
  const fromUser = await tx.user.findFirst({ where: { personId: fromId } });
  if (fromUser) {
    const toUser = await tx.user.findFirst({ where: { personId: toId } });
    await tx.user.update({
      where: { id: fromUser.id },
      data: { personId: toUser ? null : toId },
    });
  }
}

async function countPersonRefs(tx: Tx, id: string): Promise<number> {
  const counts = await Promise.all([
    tx.workstream.count({ where: { leadPersonId: id } }),
    tx.decision.count({ where: { ownerPersonId: id } }),
    tx.action.count({ where: { ownerPersonId: id } }),
    tx.risk.count({ where: { ownerPersonId: id } }),
    tx.issue.count({ where: { ownerPersonId: id } }),
    tx.project.count({ where: { ownerPersonId: id } }),
    tx.task.count({ where: { ownerPersonId: id } }),
    tx.deliverable.count({ where: { ownerPersonId: id } }),
    tx.programmeRoleAssignment.count({ where: { personId: id } }),
    tx.stakeholderRole.count({ where: { personId: id } }),
    tx.personTeam.count({ where: { personId: id } }),
  ]);
  return counts.reduce((a, b) => a + b, 0);
}

/** Fill null contact/relation fields on the keeper from the loser. */
async function fillKeeperFromLoser(tx: Tx, keeperId: string, loserId: string): Promise<void> {
  const [keeper, loser] = await Promise.all([
    tx.person.findUnique({ where: { id: keeperId } }),
    tx.person.findUnique({ where: { id: loserId } }),
  ]);
  if (!keeper || !loser) return;
  const data: Prisma.PersonUpdateInput = {};
  if (!keeper.email && loser.email) data.email = loser.email;
  if (!keeper.mobile && loser.mobile) data.mobile = loser.mobile;
  if (!keeper.phone && loser.phone) data.phone = loser.phone;
  if (!keeper.roleDescription && loser.roleDescription) data.roleDescription = loser.roleDescription;
  if (!keeper.department && loser.department) data.department = loser.department;
  if (!keeper.location && loser.location) data.location = loser.location;
  if (!keeper.areaId && loser.areaId) data.area = { connect: { id: loser.areaId } };
  if (!keeper.businessId && loser.businessId) data.business = { connect: { id: loser.businessId } };
  if (!keeper.clusterId && loser.clusterId) data.cluster = { connect: { id: loser.clusterId } };
  if (Object.keys(data).length > 0) await tx.person.update({ where: { id: keeperId }, data });
}

async function run() {
  console.log(`\n=== fix-person-name-duplication ${DRY_RUN ? "(DRY RUN — will roll back)" : "(LIVE)"} ===\n`);
  try {
    await prisma.$transaction(
      async (tx) => {
        const rows = await tx.person.findMany({
          where: { surname: { not: null } },
          select: { id: true, displayName: true, surname: true },
        });

        let merged = 0;
        let renamed = 0;
        for (const row of rows) {
          const surname = row.surname!;
          const suffix = ` ${surname}`;
          if (!row.displayName.endsWith(suffix)) continue;
          const corrected = row.displayName.slice(0, -suffix.length).trim();
          if (!corrected || corrected === row.displayName) continue;

          const canonical = await tx.person.findFirst({
            where: { displayName: corrected, surname, id: { not: row.id } },
            select: { id: true },
          });

          if (canonical) {
            // Keep the data-rich record; re-point the sparser one onto it.
            const [refsMalformed, refsCanonical] = await Promise.all([
              countPersonRefs(tx, row.id),
              countPersonRefs(tx, canonical.id),
            ]);
            const keeperId = refsMalformed >= refsCanonical ? row.id : canonical.id;
            const loserId = keeperId === row.id ? canonical.id : row.id;

            await fillKeeperFromLoser(tx, keeperId, loserId);
            await repointPersonFks(tx, loserId, keeperId);
            await tx.person.delete({ where: { id: loserId } });
            // Survivor takes the corrected identity (no collision: loser is gone).
            await tx.person.update({
              where: { id: keeperId },
              data: { displayName: corrected, surname, kind: "PERSON" },
            });
            merged++;
            console.log(
              `  merged duplicate "${row.displayName}" + canonical "${corrected}" → "${corrected} ${surname}" (kept ${keeperId === row.id ? "data-rich" : "canonical"} row)`,
            );
          } else {
            await tx.person.update({ where: { id: row.id }, data: { displayName: corrected } });
            renamed++;
            console.log(`  renamed "${row.displayName}" → "${corrected}" (surname "${surname}")`);
          }
        }

        console.log(`\nSummary: ${merged} merged, ${renamed} renamed.`);
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
