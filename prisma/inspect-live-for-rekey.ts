/**
 * READ-ONLY live DB inspection to plan the re-key against the cleaned
 * workstream roadmap dataset. NO writes — findMany/count only.
 *
 * Run: npx tsx prisma/inspect-live-for-rekey.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function prefixHisto(ids: (string | null)[]) {
  const h = new Map<string, number>();
  for (const id of ids) {
    if (!id) continue;
    const m = id.match(/^([A-Za-z]+)/);
    const p = m ? m[1].toUpperCase() : "(none)";
    h.set(p, (h.get(p) ?? 0) + 1);
  }
  return [...h.entries()].sort((a, b) => b[1] - a[1]);
}

async function main() {
  const [tasks, deliverables, risks, deps, decisions, issues, workstreams, milestones, projects, phases] =
    await Promise.all([
      prisma.task.findMany({ select: { externalId: true, title: true } }),
      prisma.deliverable.findMany({ select: { externalId: true, name: true } }),
      prisma.risk.findMany({ select: { externalId: true, description: true } }),
      prisma.dependency.findMany({ select: { externalId: true, description: true } }),
      prisma.decision.findMany({ select: { externalId: true } }),
      prisma.issue.findMany({ select: { externalId: true } }),
      prisma.workstream.findMany({ select: { code: true, name: true } }),
      prisma.milestone.findMany({ select: { title: true } }),
      prisma.project.findMany({ select: { code: true, name: true } }),
      prisma.phase.findMany({ select: { code: true, name: true } }),
    ]);

  const line = (s: string) => console.log(s);
  line("=== LIVE DB COUNTS ===");
  line(`tasks=${tasks.length} deliverables=${deliverables.length} risks=${risks.length} deps=${deps.length} decisions=${decisions.length} issues=${issues.length} milestones=${milestones.length}`);
  line(`workstreams=${workstreams.length} projects=${projects.length} phases=${phases.length}`);
  line("");
  line("=== externalId prefix histograms ===");
  line(`Task:        ${JSON.stringify(prefixHisto(tasks.map((t) => t.externalId)))}`);
  line(`Deliverable: ${JSON.stringify(prefixHisto(deliverables.map((d) => d.externalId)))}`);
  line(`Risk:        ${JSON.stringify(prefixHisto(risks.map((r) => r.externalId)))}`);
  line(`Dependency:  ${JSON.stringify(prefixHisto(deps.map((d) => d.externalId)))}`);
  line(`Decision:    ${JSON.stringify(prefixHisto(decisions.map((d) => d.externalId)))}`);
  line(`Issue:       ${JSON.stringify(prefixHisto(issues.map((i) => i.externalId)))}`);
  line("");
  line("=== sample Task externalIds + titles (first 15) ===");
  for (const t of tasks.slice(0, 15)) line(`  ${t.externalId}  ::  ${t.title.slice(0, 70)}`);
  line("");
  line("=== Workstreams (code :: name) ===");
  for (const w of workstreams) line(`  ${w.code}  ::  ${w.name}`);
  line("");
  line("=== Projects (code :: name) ===");
  for (const p of projects.slice(0, 20)) line(`  ${p.code}  ::  ${p.name}`);
  line("");
  line("=== Phases (code :: name) ===");
  for (const p of phases.slice(0, 20)) line(`  ${p.code}  ::  ${p.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
