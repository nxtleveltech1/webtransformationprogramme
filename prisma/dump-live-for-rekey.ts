/**
 * READ-ONLY. Dumps live programme records to docs/rekey-dryrun/live.json so the
 * Python cross-matcher can compare them against the cleaned roadmap dataset.
 * No writes.
 *
 * Run: npx tsx prisma/dump-live-for-rekey.ts
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const out = path.resolve(__dirname, "..", "docs", "rekey-dryrun");
  fs.mkdirSync(out, { recursive: true });

  const data = {
    tasks: await prisma.task.findMany({
      select: { externalId: true, title: true, description: true, workstreamId: true },
    }),
    deliverables: await prisma.deliverable.findMany({
      select: { externalId: true, name: true, description: true },
    }),
    risks: await prisma.risk.findMany({
      select: { externalId: true, description: true, mitigationRequired: true },
    }),
    dependencies: await prisma.dependency.findMany({
      select: { externalId: true, description: true },
    }),
    decisions: await prisma.decision.findMany({
      select: { externalId: true, title: true, description: true },
    }),
    issues: await prisma.issue.findMany({ select: { externalId: true, description: true } }),
    workstreams: await prisma.workstream.findMany({ select: { code: true, name: true } }),
  };

  fs.writeFileSync(path.join(out, "live.json"), JSON.stringify(data, null, 2), "utf-8");
  console.log(
    `live.json written: tasks=${data.tasks.length} deliverables=${data.deliverables.length} risks=${data.risks.length} deps=${data.dependencies.length} decisions=${data.decisions.length} issues=${data.issues.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
