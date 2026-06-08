import { PrismaClient } from "@prisma/client";
import { seedCoreData } from "./seed/fromWorkshopData";
import { seedMarkdownAll } from "./seed/fromMarkdown";
import { seedLinksAndTraces } from "./seed/links";

const prisma = new PrismaClient();

async function main() {
  // SAFETY GUARD: the truncate below wipes EVERY table in the public schema,
  // including the demo PM/RBAC layer created by `db:seed:pm` and any data
  // entered through the app. It must never run silently. To reset the database
  // you must opt in explicitly via `SEED_RESET=1` (or use `npm run db:seed:reset`).
  const allowReset =
    process.env.SEED_RESET === "1" ||
    process.env.SEED_RESET === "true" ||
    process.argv.includes("--reset");

  if (!allowReset) {
    console.error(
      [
        "Refusing to run: prisma/seed.ts performs a destructive TRUNCATE of ALL tables.",
        "This would wipe the demo PM layer (projects, milestones, approvals, RBAC, ...)",
        "and anything entered through the app.",
        "",
        "If you really want to reset and re-seed the workshop registers, re-run with:",
        "  SEED_RESET=1 npm run db:seed       (or)  npm run db:seed:reset",
        "",
        "After a reset, run `npm run db:seed:pm` to rebuild the demo PM/RBAC layer.",
      ].join("\n"),
    );
    process.exit(1);
  }

  // SECOND GUARD: never TRUNCATE the LIVE production database by accident.
  // The live Neon branch host is recognised by its hostname; resetting it
  // requires an explicit, separate opt-in so SEED_RESET alone cannot wipe prod.
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isLiveHost = /ep-polished-voice-a21mukhc/.test(dbUrl);
  const understandLive =
    process.env.I_UNDERSTAND_LIVE === "1" || process.env.I_UNDERSTAND_LIVE === "true";
  if (isLiveHost && !understandLive) {
    console.error(
      [
        "Refusing to run: DATABASE_URL points at the LIVE production Neon database.",
        "A destructive TRUNCATE here would destroy real programme data.",
        "",
        "Use a Neon BRANCH database for resets. If you genuinely intend to wipe",
        "and re-seed the live database, re-run with BOTH flags set explicitly:",
        "  SEED_RESET=1 I_UNDERSTAND_LIVE=1 npm run db:seed",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("SEED_RESET enabled — clearing ALL existing data...");
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" CASCADE';
      END LOOP;
    END $$;
  `);

  console.log("Seeding programme core + workshop_data registers...");
  const ctx = await seedCoreData(prisma);

  console.log("Seeding markdown context, sessions, analysis...");
  await seedMarkdownAll(ctx);

  console.log("Building register links and trace references...");
  await seedLinksAndTraces(prisma);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
