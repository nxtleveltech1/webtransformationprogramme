/**
 * Programme data seed (DEV / DEMO ONLY).
 *
 * Idempotent: wipes and recreates only the four programme-context tables that
 * surface migration, capacity and lifecycle signals. It never touches the core
 * registers (risks, actions, decisions, ...) or the enterprise PM models.
 *
 * Figures are programme-framed approximations of the migration baseline
 * (~1,530 page OMAR inventory, ~60 migrated to date, ~1,000 in-scope trajectory).
 *
 * Run with: npm run db:seed:programme
 */
import { PrismaClient, PageTreatment, DsZone } from "@prisma/client";

const prisma = new PrismaClient();

const PAGE_MIGRATION_ITEMS: {
  url: string;
  treatment: PageTreatment;
  effortEstimate: string; // leading integer = page count for aggregation
  ownerName: string;
  status: string;
  notes: string;
}[] = [
  {
    url: "Migrated to date (restyled & live)",
    treatment: PageTreatment.RESTYLE,
    effortEstimate: "60",
    ownerName: "Publishing",
    status: "Moved",
    notes: "Pages already restyled onto the new design system and published.",
  },
  {
    url: "Personal — articles (priority restyle)",
    treatment: PageTreatment.RESTYLE,
    effortEstimate: "150",
    ownerName: "Publishing / Natalie",
    status: "In progress",
    notes: "High-traffic article set being restyled first.",
  },
  {
    url: "Personal — articles (remaining)",
    treatment: PageTreatment.RESTYLE,
    effortEstimate: "520",
    ownerName: "Publishing / Natalie",
    status: "Not started",
    notes: "Bulk of the article inventory awaiting publisher capacity.",
  },
  {
    url: "Personal — product pages",
    treatment: PageTreatment.NEW_TEMPLATE,
    effortEstimate: "110",
    ownerName: "Design / OMDS",
    status: "Not started",
    notes: "Require new V2 product templates that do not yet exist in Contentstack.",
  },
  {
    url: "Corporate — landing & macro pages",
    treatment: PageTreatment.NEW_TEMPLATE,
    effortEstimate: "70",
    ownerName: "Corporate stream",
    status: "Not started",
    notes: "Audience landing pages on new templates.",
  },
  {
    url: "Business — landing & macro pages",
    treatment: PageTreatment.NEW_TEMPLATE,
    effortEstimate: "55",
    ownerName: "Business stream",
    status: "Not started",
    notes: "Audience landing pages on new templates.",
  },
  {
    url: "Wealth — landing & macro pages",
    treatment: PageTreatment.NEW_TEMPLATE,
    effortEstimate: "60",
    ownerName: "Wealth stream",
    status: "Not started",
    notes: "Audience landing pages on new templates.",
  },
  {
    url: "Secure web — service pages",
    treatment: PageTreatment.AS_IS,
    effortEstimate: "35",
    ownerName: "Execution",
    status: "Blocked",
    notes: "'As-is' definition unclear (RSK-003); blocked pending decision.",
  },
  {
    url: "Consolidate / merge candidates",
    treatment: PageTreatment.CONSOLIDATE,
    effortEstimate: "270",
    ownerName: "Content / SEO",
    status: "Out of scope",
    notes: "Low-value or duplicate pages to be merged; out of the migration trajectory.",
  },
  {
    url: "Retire / decommission",
    treatment: PageTreatment.RETIRE,
    effortEstimate: "200",
    ownerName: "Content / SEO",
    status: "Out of scope",
    notes: "Pages to be retired; excluded from the migration count.",
  },
];

const RESOURCE_CONSTRAINTS: {
  role: string;
  namedResource: string | null;
  capacityConcern: string;
  confirmedVsSuggested: string;
}[] = [
  {
    role: "Publishers",
    namedResource: "2 publishers (1 migration + 1 BAU)",
    capacityConcern:
      "Only two publishers and no dedicated OMAR publisher; every change touches the full page inventory.",
    confirmedVsSuggested: "Confirmed",
  },
  {
    role: "New-template build",
    namedResource: null,
    capacityConcern: "~2 hours per page for net-new template builds.",
    confirmedVsSuggested: "Estimate",
  },
  {
    role: "As-is build",
    namedResource: null,
    capacityConcern: "~30 minutes per page — depends on the 'as-is' definition being agreed.",
    confirmedVsSuggested: "Estimate",
  },
  {
    role: "BAU throughput",
    namedResource: null,
    capacityConcern: "~85 tickets cleared per 5-day cycle (reference throughput).",
    confirmedVsSuggested: "Reference",
  },
  {
    role: "SEO lead time",
    namedResource: "SEO lead",
    capacityConcern: "≥ 2 months of lead time required before QA / go-live windows.",
    confirmedVsSuggested: "Confirmed",
  },
  {
    role: "Front-end engineering",
    namedResource: "Cross Channels squad",
    capacityConcern:
      "Most front-end developers roll off to Web Platform after PI2 (RSK-017) — finite build window.",
    confirmedVsSuggested: "Confirmed",
  },
];

const PROCESS_WORKFLOWS: {
  name: string;
  currentStateSteps: string;
  futureStateSteps: string;
  ownerText: string;
  bottlenecks: string;
}[] = [
  {
    name: "End-to-end delivery lifecycle",
    currentStateSteps:
      "Ad-hoc intake → Design → Build → Publish → Live (no consistent gates)",
    futureStateSteps:
      "Define → Discovery → Design → Approval → Build → Handover → Go Live → Support",
    ownerText: "Programme",
    bottlenecks:
      "Beta / Staging readiness and the architecture decision for Beta/Staging/Production plus tooling ownership (ACT-009) gate the lifecycle.",
  },
  {
    name: "Environment sequencing",
    currentStateSteps: "Local → Production (no parallel validation environment)",
    futureStateSteps:
      "Contentstack → Beta / Staging → Production → Live Testing → Tooling",
    ownerText: "Execution / Ops",
    bottlenecks:
      "Beta must support parallel validation of navigation, taxonomy, APIs, tooling and DS components before Production cutover.",
  },
];

const COMPONENT_TEMPLATES: {
  name: string;
  dsZone: DsZone;
  contentstackMapped: boolean;
  status: string;
  notes: string;
}[] = [
  {
    name: "Navigation (4 audiences)",
    dsZone: DsZone.GREEN,
    contentstackMapped: false,
    status: "To build",
    notes: "Audience-aware primary navigation across Personal, Corporate, Business, Wealth.",
  },
  {
    name: "Article template (restyled)",
    dsZone: DsZone.GREEN,
    contentstackMapped: true,
    status: "In progress",
    notes: "Primary restyle template — mapped and in use for the priority article set.",
  },
  {
    name: "Product page V2 template",
    dsZone: DsZone.GREEN,
    contentstackMapped: false,
    status: "To build",
    notes: "Net-new product template; does not yet exist in Contentstack (RSK-008).",
  },
  {
    name: "Find an Advisor",
    dsZone: DsZone.MIXED,
    contentstackMapped: false,
    status: "Blocked (DS V2)",
    notes: "Depends on design-system V2 components.",
  },
  {
    name: "Calculators",
    dsZone: DsZone.GREEN,
    contentstackMapped: false,
    status: "Beta-ready",
    notes: "Ready for Beta validation.",
  },
  {
    name: "Service tree (secure web)",
    dsZone: DsZone.RED,
    contentstackMapped: false,
    status: "Not started",
    notes: "Secure-web service pages; 'as-is' treatment unresolved.",
  },
];

async function main() {
  await prisma.$transaction([
    prisma.pageMigrationItem.deleteMany(),
    prisma.resourceConstraint.deleteMany(),
    prisma.processWorkflow.deleteMany(),
    prisma.componentTemplate.deleteMany(),
  ]);

  await prisma.pageMigrationItem.createMany({ data: PAGE_MIGRATION_ITEMS });
  await prisma.resourceConstraint.createMany({ data: RESOURCE_CONSTRAINTS });
  await prisma.processWorkflow.createMany({ data: PROCESS_WORKFLOWS });
  await prisma.componentTemplate.createMany({ data: COMPONENT_TEMPLATES });

  const totalPages = PAGE_MIGRATION_ITEMS.reduce(
    (sum, i) => sum + (parseInt(i.effortEstimate, 10) || 0),
    0,
  );
  console.log(
    `Programme seed complete: ${PAGE_MIGRATION_ITEMS.length} migration items (~${totalPages} pages), ` +
      `${RESOURCE_CONSTRAINTS.length} resource constraints, ${PROCESS_WORKFLOWS.length} workflows, ` +
      `${COMPONENT_TEMPLATES.length} component templates.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
