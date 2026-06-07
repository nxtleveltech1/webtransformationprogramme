/**
 * Non-destructive upsert of stakeholder directory taxonomy, extensions,
 * glossary, ToR, and reference mappings. Safe to run on an existing database.
 */
import { PrismaClient } from "@prisma/client";
import { seedExternalSteerco } from "./seed/external-steerco";
import {
  seedDirectoryTaxonomy,
  seedGlossaryAllSections,
  seedGovernanceReference,
  seedPeopleDirectoryExtensions,
  seedReferenceMappings,
} from "./seed/governance-reference";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding directory taxonomy...");
  await seedDirectoryTaxonomy(prisma);
  console.log("Extending people directory...");
  await seedPeopleDirectoryExtensions(prisma);
  console.log("Seeding external steerco members...");
  await seedExternalSteerco(prisma);
  console.log("Seeding glossary (all sections)...");
  await seedGlossaryAllSections(prisma);
  console.log("Seeding governance reference (ToR)...");
  await seedGovernanceReference(prisma);
  console.log("Seeding reference mappings...");
  await seedReferenceMappings(prisma);
  console.log("Governance incremental seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
