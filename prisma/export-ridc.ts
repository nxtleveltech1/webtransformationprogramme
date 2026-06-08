/**
 * Export Risks, Issues, Dependencies and Constraints (RIDC) to Excel.
 *
 * Run: npm run export:ridc
 * Output: OUTPUTS/exports/om-ridc-export.xls
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

import { buildWorkbookXml, excelFileName } from "../src/lib/export/excel";
import { formatOwnerDisplay } from "../src/lib/format-person";
import { riskScore } from "../src/lib/enums";
import { relativeDays } from "../src/lib/utils";
import { isRiskOpen } from "../src/lib/services/dashboard";
import type { ExportWorkbook } from "../src/lib/export/types";

const prisma = new PrismaClient();
const DASH = "—";

function buildRidcWorkbook(
  risks: Awaited<ReturnType<typeof fetchRisks>>,
  issues: Awaited<ReturnType<typeof fetchIssues>>,
  dependencies: Awaited<ReturnType<typeof fetchDependencies>>,
  constraints: Awaited<ReturnType<typeof fetchConstraints>>,
): ExportWorkbook {
  return {
    title: "OM Programme — Risks, Issues, Dependencies & Constraints",
    subtitle: `Generated ${new Date().toLocaleString("en-GB")}`,
    sheets: [
      {
        name: "Risks",
        columns: [
          "externalId", "description", "category", "probability", "impact", "score",
          "status", "owner", "mitigationDiscussed", "mitigationRequired",
          "escalationRequired", "dueDate", "workstream", "project", "task",
          "deliverable", "workshopDay", "sessionRef", "traceRef",
        ],
        headers: {
          externalId: "Ref",
          description: "Risk",
          category: "Category",
          probability: "Probability",
          impact: "Impact",
          score: "Score",
          status: "Status",
          owner: "Owner",
          mitigationDiscussed: "Mitigation discussed",
          mitigationRequired: "Mitigation required",
          escalationRequired: "Escalation required",
          dueDate: "Due date",
          workstream: "Workstream",
          project: "Project",
          task: "Task",
          deliverable: "Deliverable",
          workshopDay: "Workshop day",
          sessionRef: "Session",
          traceRef: "Trace ref",
        },
        rows: risks,
      },
      {
        name: "Issues",
        columns: [
          "externalId", "description", "status", "currentImpact", "affectedTeams",
          "owner", "resolutionRequired", "targetResolutionDate", "blockedWorkstream",
          "project", "task", "ageDays", "workshopDay", "sessionRef", "traceRef",
        ],
        headers: {
          externalId: "Ref",
          description: "Issue",
          status: "Status",
          currentImpact: "Current impact",
          affectedTeams: "Affected teams",
          owner: "Owner",
          resolutionRequired: "Resolution required",
          targetResolutionDate: "Target resolution",
          blockedWorkstream: "Blocked workstream",
          project: "Project",
          task: "Task",
          ageDays: "Age (days)",
          workshopDay: "Workshop day",
          sessionRef: "Session",
          traceRef: "Trace ref",
        },
        rows: issues,
      },
      {
        name: "Dependencies",
        columns: [
          "externalId", "description", "status", "streamText", "dependentWorkstream",
          "providingTeam", "receivingTeam", "requiredDate", "delayRisk", "escalation",
          "owner", "workstream", "project", "task", "deliverable",
          "workshopDay", "sessionRef", "traceRef",
        ],
        headers: {
          externalId: "Ref",
          description: "Dependency",
          status: "Status",
          streamText: "Stream",
          dependentWorkstream: "Dependent workstream",
          providingTeam: "Providing team",
          receivingTeam: "Receiving team",
          requiredDate: "Required date",
          delayRisk: "Delay risk",
          escalation: "Escalation",
          owner: "Owner",
          workstream: "Workstream",
          project: "Project",
          task: "Task",
          deliverable: "Deliverable",
          workshopDay: "Workshop day",
          sessionRef: "Session",
          traceRef: "Trace ref",
        },
        rows: dependencies,
      },
      {
        name: "Constraints",
        columns: ["role", "namedResource", "capacityConcern", "confirmedVsSuggested"],
        headers: {
          role: "Role / area",
          namedResource: "Named resource",
          capacityConcern: "Capacity concern",
          confirmedVsSuggested: "Confirmed vs suggested",
        },
        rows: constraints,
      },
    ],
  };
}

async function fetchRisks() {
  const rows = await prisma.risk.findMany({
    orderBy: { externalId: "asc" },
    include: {
      ownerPerson: { select: { displayName: true, surname: true } },
      workstream: { select: { name: true } },
      project: { select: { name: true } },
      task: { select: { title: true } },
      deliverable: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    externalId: r.externalId,
    description: r.description,
    category: r.category,
    probability: r.probability,
    impact: r.impact,
    score: riskScore(r.probability, r.impact),
    status: r.status,
    owner: formatOwnerDisplay(r.ownerText, r.ownerPerson),
    mitigationDiscussed: r.mitigationDiscussed ?? DASH,
    mitigationRequired: r.mitigationRequired ?? DASH,
    escalationRequired: r.escalationRequired ?? DASH,
    dueDate: r.dueDate ?? DASH,
    workstream: r.workstream?.name ?? DASH,
    project: r.project?.name ?? DASH,
    task: r.task?.title ?? DASH,
    deliverable: r.deliverable?.name ?? DASH,
    workshopDay: r.workshopDay,
    sessionRef: r.sessionRef ?? DASH,
    traceRef: r.traceRef ?? DASH,
    open: isRiskOpen(r.status),
  }));
}

async function fetchIssues() {
  const rows = await prisma.issue.findMany({
    orderBy: { externalId: "asc" },
    include: {
      ownerPerson: { select: { displayName: true, surname: true } },
      project: { select: { name: true } },
      task: { select: { title: true } },
    },
  });

  return rows.map((i) => ({
    externalId: i.externalId,
    description: i.description,
    status: i.status,
    currentImpact: i.currentImpact ?? DASH,
    affectedTeams: i.affectedTeams ?? DASH,
    owner: formatOwnerDisplay(i.ownerText, i.ownerPerson),
    resolutionRequired: i.resolutionRequired ?? DASH,
    targetResolutionDate: i.targetResolutionDate ?? DASH,
    blockedWorkstream: i.blockedWorkstream ?? DASH,
    project: i.project?.name ?? DASH,
    task: i.task?.title ?? DASH,
    ageDays: relativeDays(i.createdAt),
    workshopDay: i.workshopDay,
    sessionRef: i.sessionRef ?? DASH,
    traceRef: i.traceRef ?? DASH,
  }));
}

async function fetchDependencies() {
  const rows = await prisma.dependency.findMany({
    orderBy: { externalId: "asc" },
    include: {
      workstream: { select: { name: true } },
      project: { select: { name: true } },
      task: { select: { title: true } },
      deliverable: { select: { name: true } },
    },
  });

  return rows.map((d) => ({
    externalId: d.externalId,
    description: d.description,
    status: d.status,
    streamText: d.streamText ?? DASH,
    dependentWorkstream: d.dependentWorkstream ?? DASH,
    providingTeam: d.providingTeam ?? DASH,
    receivingTeam: d.receivingTeam ?? DASH,
    requiredDate: d.requiredDate ?? DASH,
    delayRisk: d.delayRisk ?? DASH,
    escalation: d.escalation ?? DASH,
    owner: d.ownerText ?? DASH,
    workstream: d.workstream?.name ?? DASH,
    project: d.project?.name ?? DASH,
    task: d.task?.title ?? DASH,
    deliverable: d.deliverable?.name ?? DASH,
    workshopDay: d.workshopDay,
    sessionRef: d.sessionRef ?? DASH,
    traceRef: d.traceRef ?? DASH,
  }));
}

async function fetchConstraints() {
  const rows = await prisma.resourceConstraint.findMany({
    orderBy: { createdAt: "asc" },
  });

  return rows.map((c) => ({
    role: c.role ?? DASH,
    namedResource: c.namedResource ?? DASH,
    capacityConcern: c.capacityConcern ?? DASH,
    confirmedVsSuggested: c.confirmedVsSuggested ?? DASH,
  }));
}

async function main() {
  const [risks, issues, dependencies, constraints] = await Promise.all([
    fetchRisks(),
    fetchIssues(),
    fetchDependencies(),
    fetchConstraints(),
  ]);

  const workbook = buildRidcWorkbook(risks, issues, dependencies, constraints);
  const xml = buildWorkbookXml(workbook);
  const filename = excelFileName("om-ridc-export");
  const outDir = join(process.cwd(), "OUTPUTS", "exports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, filename);
  writeFileSync(outPath, xml, "utf8");

  console.log(`Exported ${risks.length} risks, ${issues.length} issues, ${dependencies.length} dependencies, ${constraints.length} constraints.`);
  console.log(`File: ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
