import {
  AnalysisCompleteness,
  AnalysisLens,
  Confidence,
  ExecutiveSummaryDay,
  ExportArtifactType,
  ExportVariant,
  GlossaryCategory,
  PrismaClient,
  SessionOutputType,
} from "@prisma/client";
import {
  PACK,
  parseMarkdownTable,
  readPack,
  REGISTER_SEQUENCES,
  getOrCreatePerson,
  mapQuestionStatus,
  mapPriority,
} from "./utils";
import type { SeedContext } from "./fromWorkshopData";
import {
  seedDirectoryTaxonomy,
  seedGlossaryAllSections,
  seedGovernanceReference,
  seedPeopleDirectoryExtensions,
  seedReferenceMappings,
} from "./governance-reference";
import * as fs from "fs";
import * as path from "path";

const ANALYSIS_FILES: { lens: AnalysisLens; file: string; title: string }[] = [
  { lens: AnalysisLens.A_PROCESS, file: "04_Analysis/process-and-workflow.md", title: "Business process & workflow" },
  { lens: AnalysisLens.B_RACI, file: "04_Analysis/raci.md", title: "Team responsibilities & RACI" },
  { lens: AnalysisLens.C_RESOURCING, file: "04_Analysis/resourcing-and-capacity.md", title: "Resourcing & capacity" },
  { lens: AnalysisLens.D_TECHNICAL, file: "04_Analysis/technical-and-systems.md", title: "Technical & systems" },
  { lens: AnalysisLens.E_DELIVERY, file: "04_Analysis/delivery-and-programme.md", title: "Delivery & programme" },
  { lens: AnalysisLens.F_STAKEHOLDER, file: "04_Analysis/stakeholder-and-governance.md", title: "Stakeholder & governance" },
  { lens: AnalysisLens.G_CHANGE, file: "04_Analysis/change-adoption-comms.md", title: "Change, adoption & communications" },
];

const EXEC_FILES: { day: ExecutiveSummaryDay; file: string }[] = [
  { day: ExecutiveSummaryDay.DAY1, file: "05_Executive/day1-executive-summary.md" },
  { day: ExecutiveSummaryDay.DAY2, file: "05_Executive/day2-executive-summary.md" },
  { day: ExecutiveSummaryDay.FINAL, file: "05_Executive/final-executive-summary.md" },
];

function skipHeaderRow(rows: string[][]): string[][] {
  if (rows.length === 0) return rows;
  const first = rows[0][0]?.toUpperCase() ?? "";
  if (first.includes("ID") || first === "SRC" || first === "REGISTER") return rows.slice(1);
  return rows;
}

export async function seedRegisterTables(prisma: PrismaClient) {
  const asmRows = skipHeaderRow(parseMarkdownTable(readPack("03_Registers", "assumptions-log.md")));
  for (const row of asmRows) {
    if (!row[0]?.startsWith("ASM-")) continue;
    await prisma.assumption.create({
      data: {
        externalId: row[0],
        description: row[1],
        areaImpacted: row[2],
        validatorText: row[3],
        validationRequired: row[4],
        riskIfWrong: row[5],
        traceRef: row[6],
      },
    });
  }

  const qstRows = skipHeaderRow(parseMarkdownTable(readPack("03_Registers", "open-questions.md")));
  for (const row of qstRows) {
    if (!row[0]?.startsWith("QST-")) continue;
    await prisma.openQuestion.create({
      data: {
        externalId: row[0],
        question: row[1],
        raisedBy: row[2],
        relevantTeam: row[3],
        ownerToAnswer: row[4],
        impactIfUnanswered: row[5],
        status: mapQuestionStatus(row[6] ?? "Open"),
        traceRef: row[7],
      },
    });
  }

  const prkRows = skipHeaderRow(parseMarkdownTable(readPack("03_Registers", "parking-lot.md")));
  for (const row of prkRows) {
    if (!row[0]?.startsWith("PRK-")) continue;
    await prisma.parkingLotItem.create({
      data: {
        externalId: row[0],
        topic: row[1],
        whyParked: row[2],
        ownerText: row[3],
        followUp: row[4],
        priority: row[5] ? mapPriority(row[5]) : undefined,
        suggestedForum: row[6],
        traceRef: row[7],
      },
    });
  }

  for (const seq of REGISTER_SEQUENCES) {
    await prisma.registerSequence.create({ data: seq });
  }
}

export async function seedPeopleAndTeams(prisma: PrismaClient) {
  const peopleRows = skipHeaderRow(parseMarkdownTable(readPack("01_Context", "people-and-teams.md")));
  const teamRows: string[][] = [];
  let inTeams = false;
  const content = readPack("01_Context", "people-and-teams.md");
  for (const line of content.split("\n")) {
    if (line.includes("## Teams")) inTeams = true;
    if (inTeams && line.trim().startsWith("|") && !line.includes("---")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells[0] && cells[0] !== "Team / function") teamRows.push(cells);
    }
  }

  for (const row of peopleRows) {
    if (!row[0] || row[0] === "Name" || row[0].startsWith(">")) continue;
    if (row[0].includes("/")) continue;
    const conf = row[4]?.includes("Confirmed")
      ? Confidence.CONFIRMED
      : row[4]?.includes("validation")
        ? Confidence.REQUIRES_VALIDATION
        : Confidence.INFERRED;
    const personId = await getOrCreatePerson(prisma, row[0]);
    const person = personId
      ? await prisma.person.findUnique({ where: { id: personId } })
      : null;
    if (person) {
      await prisma.person.update({
        where: { id: person.id },
        data: {
          roleDescription: row[1],
          confidence: conf,
        },
      });
    }
  }

  const teamNames = [
    "Programme / Delivery",
    "Product",
    "Design & Content",
    "Design System (OMDS)",
    "Execution / Engineering",
    "Publishing",
    "Cross Channels Solutions",
    "SEO",
    "Regional / Country",
    "Brand / Group Marketing",
    "E-commerce",
  ];
  for (const name of teamNames) {
    await prisma.team.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  for (const row of teamRows) {
    if (!row[0]) continue;
    await prisma.team.upsert({
      where: { name: row[0] },
      create: { name: row[0], functionDescription: row[1] },
      update: { functionDescription: row[1] },
    });
  }
}

export async function seedGlossary(prisma: PrismaClient) {
  const rows = skipHeaderRow(parseMarkdownTable(readPack("01_Context", "glossary.md")));
  for (const row of rows) {
    if (!row[0] || row[0] === "Term") continue;
    const cat = row[0].length <= 6 ? GlossaryCategory.ACRONYM : GlossaryCategory.TERM;
    await prisma.glossaryTerm.upsert({
      where: { term: row[0] },
      create: {
        term: row[0],
        meaning: row[1] ?? "",
        category: cat,
        confidence: row[2]?.includes("Confirmed") ? Confidence.CONFIRMED : Confidence.INFERRED,
      },
      update: { meaning: row[1] ?? "" },
    });
  }
}

export async function seedSystems(prisma: PrismaClient) {
  const content = readPack("04_Analysis", "technical-and-systems.md");
  const systems = [
    "Contentstack",
    "Figma",
    "ServiceNow",
    "Dynatrace",
    "Grafana",
    "Google Analytics",
    "Glassbox",
    "Beta environment",
    "Staging environment",
    "Production environment",
  ];
  for (const name of systems) {
    if (content.includes(name)) {
      await prisma.systemPlatform.upsert({
        where: { name },
        create: { name, category: "Platform", notes: "Referenced in technical-and-systems.md" },
        update: {},
      });
    }
  }
}

export async function seedSessions(ctx: SeedContext) {
  const sessionFiles = [
    {
      num: 1,
      file: "02_Sessions/day1-session1.md",
      name: "Day 1 Session 1 — Planning workshop",
      dayId: ctx.day1Id,
      purpose: "Web Transformation Planning Workshop — Day 1",
    },
    {
      num: 2,
      file: "02_Sessions/day1-session2.md",
      name: "Day 1 Session 2 — Cross Channels & follow-up",
      dayId: ctx.day1Id,
      purpose: "Web Transformation Planning Workshop — Day 1",
    },
    {
      num: 3,
      file: "02_Sessions/day1-session3.md",
      name: "Day 1 Session 3 — Scope options & closing",
      dayId: ctx.day1Id,
      purpose: "Web Transformation Planning Workshop — Day 1",
    },
    {
      num: 1,
      file: "02_Sessions/day2-session1.md",
      name: "Day 2 Session 1 — Delivery model and governance re-baseline",
      dayId: ctx.day2Id,
      purpose: "Web Transformation Planning Workshop — Day 2",
    },
    {
      num: 2,
      file: "02_Sessions/day2-session2.md",
      name: "Day 2 Session 2 — Resourcing, roll-offs and close",
      dayId: ctx.day2Id,
      purpose: "Web Transformation Planning Workshop — Day 2",
    },
  ];

  for (const { num, file, name, dayId, purpose } of sessionFiles) {
    const body = readPack(file);
    const session = await ctx.prisma.workshopSession.create({
      data: {
        workshopId: ctx.workshopId,
        dayId,
        sessionNumber: num,
        name,
        facilitator: "Gareth Bew",
        scribe: num === 1 ? "Bertus" : "Bertus Goosen",
        purpose,
        location: "Cape Town",
        bodyMarkdown: body,
      },
    });

    const coveredMatch = body.match(/### Agenda items covered\n([\s\S]*?)### Agenda items not covered/);
    const notCoveredMatch = body.match(/### Agenda items not covered[\s\S]*?\n([\s\S]*?)(?:\n---|\n## )/);
    let order = 0;
    if (coveredMatch) {
      for (const line of coveredMatch[1].split("\n")) {
        const m = line.match(/^-\s+(.+)/);
        if (m) {
          await ctx.prisma.sessionAgendaItem.create({
            data: { sessionId: session.id, title: m[1], covered: true, sortOrder: order++ },
          });
        }
      }
    }
    if (notCoveredMatch) {
      for (const line of notCoveredMatch[1].split("\n")) {
        const m = line.match(/^-\s+(.+)/);
        if (m) {
          await ctx.prisma.sessionAgendaItem.create({
            data: { sessionId: session.id, title: m[1], covered: false, sortOrder: order++ },
          });
        }
      }
    }

    const topicBlocks = body.split(/### \d+\.\d+ /).slice(1);
    let topicOrder = 0;
    for (const block of topicBlocks) {
      const titleLine = block.split("\n")[0];
      const summaryMatch = block.match(/\*\*Summary:\*\*\s*(.+)/);
      await ctx.prisma.sessionTopic.create({
        data: {
          sessionId: session.id,
          title: titleLine.trim(),
          summary: summaryMatch?.[1] ?? block.slice(0, 500),
          sortOrder: topicOrder++,
        },
      });
    }

    await ctx.prisma.sessionOutput.create({
      data: {
        sessionId: session.id,
        outputType: SessionOutputType.SUMMARY,
        bodyMarkdown: body.slice(0, 8000),
      },
    });
  }
}

export async function seedAnalysis(prisma: PrismaClient) {
  for (const { lens, file, title } of ANALYSIS_FILES) {
    const body = readPack(file);
    const incomplete = body.includes("incomplete") || body.includes("Clarification required");
    const artifact = await prisma.analysisArtifact.create({
      data: {
        lens,
        title,
        bodyMarkdown: body,
        completeness: incomplete ? AnalysisCompleteness.INCOMPLETE : AnalysisCompleteness.COMPLETE,
        filePath: file,
      },
    });

    if (lens === AnalysisLens.B_RACI) {
      const rows = skipHeaderRow(parseMarkdownTable(body));
      let order = 0;
      for (const row of rows) {
        if (!row[0] || row[0].includes("Area /") || row[0].startsWith(">")) continue;
        await prisma.raciRow.create({
          data: {
            analysisArtifactId: artifact.id,
            area: row[0],
            programme: row[1],
            product: row[2],
            design: row[3],
            execution: row[4],
            publishing: row[5],
            crossChannels: row[6],
            seo: row[7],
            regional: row[8],
            sortOrder: order++,
          },
        });
      }
    }
  }
}

export async function seedExecutive(prisma: PrismaClient, workshopId: string) {
  for (const { day, file } of EXEC_FILES) {
    const body = readPack(file);
    if (body.length < 50) continue;
    await prisma.executiveSummary.upsert({
      where: { day },
      create: {
        workshopId,
        day,
        bodyMarkdown: body,
        publishedAt: day === ExecutiveSummaryDay.DAY1 ? new Date("2026-06-03") : undefined,
        filePath: file,
      },
      update: { bodyMarkdown: body, workshopId },
    });
  }

  const qa = readPack("05_Executive", "qa-report.md");
  if (qa.length > 100) {
    await prisma.qaReportItem.create({
      data: {
        severity: "info",
        artifact: "WorkshopPack Day 1",
        finding: "Day 1 QA report ingested — see body in related executive artifacts",
        resolution: "Published provisional 2026-06-03",
      },
    });
  }
}

export async function seedReconciliation(prisma: PrismaClient) {
  const body = readPack("05_Executive", "reconciliation-log.md");
  const rows = skipHeaderRow(parseMarkdownTable(body));
  for (const row of rows) {
    if (!row[0]?.startsWith("DEC-") && !row[0]?.includes("Session")) continue;
    if (row.length < 3) continue;
    await prisma.reconciliationRecord.create({
      data: {
        sourceExternalId: row[0].includes("DEC") ? "SRC-007" : undefined,
        conflict: row[1],
        disposition: row[2],
        humanValidationRequired: body.includes("human validation"),
      },
    });
  }
}

export async function seedExportArtifacts() {
  const root = path.resolve(PACK, "..");
  const artifacts: { type: ExportArtifactType; path: string; variant: ExportVariant }[] = [
    { type: ExportArtifactType.HTML, path: "Roadmap/portfolio-exec-2026-06-03.html", variant: ExportVariant.CANONICAL },
    { type: ExportArtifactType.HTML, path: "OUTPUTS/CURSOR/portfolio-exec-2026-06-03.html", variant: ExportVariant.CURSOR },
    { type: ExportArtifactType.HTML, path: "OUTPUTS/GPT/portfolio-exec-2026-06-03-GPT.html", variant: ExportVariant.GPT },
    {
      type: ExportArtifactType.XLSX,
      path: "WorkshopPack/Web_Transformation_Workshop Working Doc - 2_export.xlsx",
      variant: ExportVariant.CANONICAL,
    },
  ];
  return artifacts.filter((a) => fs.existsSync(path.join(root, a.path)));
}

export async function seedExports(prisma: PrismaClient) {
  const artifacts = await seedExportArtifacts();
  for (const a of artifacts) {
    await prisma.exportArtifact.create({
      data: {
        type: a.type,
        path: a.path,
        variant: a.variant,
        generatedAt: new Date("2026-06-03"),
      },
    });
  }
}

export async function seedMarkdownAll(ctx: SeedContext) {
  await seedRegisterTables(ctx.prisma);
  await seedDirectoryTaxonomy(ctx.prisma);
  await seedPeopleAndTeams(ctx.prisma);
  await seedPeopleDirectoryExtensions(ctx.prisma);
  await seedGlossaryAllSections(ctx.prisma);
  await seedGovernanceReference(ctx.prisma);
  await seedReferenceMappings(ctx.prisma);
  await seedSystems(ctx.prisma);
  await seedSessions(ctx);
  await seedAnalysis(ctx.prisma);
  await seedExecutive(ctx.prisma, ctx.workshopId);
  await seedReconciliation(ctx.prisma);
  await seedExports(ctx.prisma);
}
