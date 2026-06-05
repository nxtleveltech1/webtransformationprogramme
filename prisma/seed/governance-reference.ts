import {
  Confidence,
  GovernanceDocStatus,
  GovernanceDocType,
  GlossaryCategory,
  PersonKind,
  PrismaClient,
  ProgrammeRoleType,
  StakeholderRoleType,
} from "@prisma/client";
import { getOrCreatePerson, parseMarkdownTable, readPack } from "./utils";

const AREAS = [
  { key: "programme", name: "Programme / Delivery", sortOrder: 1 },
  { key: "product", name: "Product", sortOrder: 2 },
  { key: "design", name: "Design & Content", sortOrder: 3 },
  { key: "execution", name: "Execution / Engineering", sortOrder: 4 },
  { key: "publishing", name: "Publishing", sortOrder: 5 },
  { key: "cross_channels", name: "Cross Channels Solutions", sortOrder: 6 },
  { key: "seo", name: "SEO", sortOrder: 7 },
  { key: "regional", name: "Regional / Country", sortOrder: 8 },
  { key: "security", name: "Security", sortOrder: 9 },
  { key: "ecommerce", name: "E-commerce", sortOrder: 10 },
  { key: "finance", name: "Finance / Sponsor", sortOrder: 11 },
];

const BUSINESSES = [
  { key: "omar", name: "OMAR", sortOrder: 1 },
  { key: "wealth", name: "Wealth / WT", sortOrder: 2 },
  { key: "personal", name: "Personal", sortOrder: 3 },
  { key: "corporate", name: "Corporate", sortOrder: 4 },
  { key: "business", name: "Business", sortOrder: 5 },
  { key: "cross_channels", name: "Cross Channels", sortOrder: 6 },
  { key: "secure_web", name: "Secure Web", sortOrder: 7 },
  { key: "faoli_bank", name: "Faoli Bank", sortOrder: 8 },
  { key: "omi", name: "OMI / Regional", sortOrder: 9 },
];

const CLUSTERS = [
  { key: "personal", name: "Personal", audienceLabel: "Personal audience", sortOrder: 1 },
  { key: "corporate", name: "Corporate", audienceLabel: "Corporate audience", sortOrder: 2 },
  { key: "business", name: "Business", audienceLabel: "Business audience", sortOrder: 3 },
  { key: "wealth", name: "Wealth", audienceLabel: "Wealth audience", sortOrder: 4 },
];

const WORKSTREAM_TO_AREA: Record<string, string> = {
  programme: "programme",
  product: "product",
  design: "design",
  execution: "execution",
  publishing: "publishing",
  "cross channels": "cross_channels",
  "secure web": "cross_channels",
  seo: "seo",
  content: "publishing",
  regional: "regional",
  "e-commerce": "ecommerce",
  security: "security",
  omi: "regional",
  business: "product",
};

const TEAM_TO_AREA: Record<string, string> = {
  "Programme / Delivery": "programme",
  Product: "product",
  "Design & Content": "design",
  "Design System (OMDS)": "design",
  "Execution / Engineering": "execution",
  Publishing: "publishing",
  "Cross Channels Solutions": "cross_channels",
  SEO: "seo",
  "Regional / Country": "regional",
  "Brand / Group Marketing": "product",
  "E-commerce": "ecommerce",
};

function mapConfidence(text?: string): Confidence {
  if (!text) return Confidence.INFERRED;
  if (text.includes("Confirmed")) return Confidence.CONFIRMED;
  if (text.includes("validation") || text.includes("[validate]")) {
    return Confidence.REQUIRES_VALIDATION;
  }
  return Confidence.INFERRED;
}

function inferGlossaryCategory(section: string, term: string): GlossaryCategory {
  const s = section.toLowerCase();
  if (s.includes("acronym")) return GlossaryCategory.ACRONYM;
  if (s.includes("system") || s.includes("platform") || s.includes("tool")) {
    return GlossaryCategory.SYSTEM;
  }
  if (s.includes("geograph") || s.includes("site")) return GlossaryCategory.GEOGRAPHY;
  if (s.includes("process") || s.includes("governance") || s.includes("model")) {
    return GlossaryCategory.PROCESS;
  }
  if (term.length <= 6 && term === term.toUpperCase()) return GlossaryCategory.ACRONYM;
  return GlossaryCategory.TERM;
}

function inferProgrammeRoles(roleText: string): ProgrammeRoleType[] {
  const t = roleText.toLowerCase();
  const roles: ProgrammeRoleType[] = [];
  if (t.includes("facilitator") || t.includes("programme lead") || t.includes("delivery lead")) {
    roles.push(ProgrammeRoleType.FACILITATOR);
  }
  if (t.includes("product owner")) roles.push(ProgrammeRoleType.PRODUCT_OWNER);
  if (t.includes("stream lead") || t.includes("migration lead") || t.includes("design lead")) {
    roles.push(ProgrammeRoleType.STREAM_LEAD);
  }
  if (t.includes("technical architect") || t.includes("strategist")) {
    roles.push(ProgrammeRoleType.TECHNICAL_ARCHITECT);
  }
  if (t.includes("business stakeholder")) roles.push(ProgrammeRoleType.BUSINESS_STAKEHOLDER);
  if (t.includes("scribe")) roles.push(ProgrammeRoleType.SCRIBE);
  if (t.includes("gatekeeper")) roles.push(ProgrammeRoleType.GATEKEEPER);
  if (t.includes("sme") || t.includes("product sme")) roles.push(ProgrammeRoleType.SME);
  if (t.includes("sponsor") || t.includes("cfo")) roles.push(ProgrammeRoleType.SPONSOR);
  return roles;
}

function inferStakeholderRoles(roleText: string): StakeholderRoleType[] {
  const t = roleText.toLowerCase();
  const roles: StakeholderRoleType[] = [];
  if (t.includes("approv") || t.includes("approval authority")) roles.push(StakeholderRoleType.APPROVER);
  if (t.includes("sponsor") || t.includes("steering")) roles.push(StakeholderRoleType.SPONSOR);
  if (t.includes("sme") || t.includes("product info")) roles.push(StakeholderRoleType.SME);
  if (t.includes("decision")) roles.push(StakeholderRoleType.DECISION_MAKER);
  return roles;
}

function resolveAreaKey(workstreamText: string): string | null {
  const parts = workstreamText.split("/").map((p) => p.trim().toLowerCase());
  for (const part of parts) {
    for (const [needle, key] of Object.entries(WORKSTREAM_TO_AREA)) {
      if (part.includes(needle)) return key;
    }
  }
  return null;
}

export async function seedDirectoryTaxonomy(prisma: PrismaClient) {
  for (const area of AREAS) {
    await prisma.directoryArea.upsert({
      where: { key: area.key },
      create: area,
      update: { name: area.name, sortOrder: area.sortOrder },
    });
  }
  for (const business of BUSINESSES) {
    await prisma.directoryBusiness.upsert({
      where: { key: business.key },
      create: business,
      update: { name: business.name, sortOrder: business.sortOrder },
    });
  }
  for (const cluster of CLUSTERS) {
    await prisma.directoryCluster.upsert({
      where: { key: cluster.key },
      create: cluster,
      update: {
        name: cluster.name,
        audienceLabel: cluster.audienceLabel,
        sortOrder: cluster.sortOrder,
      },
    });
  }
}

export async function seedPeopleDirectoryExtensions(prisma: PrismaClient) {
  const peopleRows = parseMarkdownTable(readPack("01_Context", "people-and-teams.md")).slice(1);
  const areas = await prisma.directoryArea.findMany();
  const businesses = await prisma.directoryBusiness.findMany();
  const areaByKey = new Map(areas.map((a) => [a.key, a.id]));
  const businessByKey = new Map(businesses.map((b) => [b.key, b.id]));

  const teams = await prisma.team.findMany();
  const teamByName = new Map(teams.map((t) => [t.name, t.id]));

  for (const row of peopleRows) {
    if (!row[0] || row[0] === "Name" || row[0].startsWith(">") || row[0].includes("/")) continue;

    const personId = await getOrCreatePerson(prisma, row[0]);
    if (!personId) continue;

    const workstreamText = row[2] ?? "";
    const areaKey = resolveAreaKey(workstreamText);
    const areaId = areaKey ? areaByKey.get(areaKey) : undefined;

    let businessId: string | undefined;
    const wsLower = workstreamText.toLowerCase();
    if (wsLower.includes("wealth") || wsLower.includes("wt")) {
      businessId = businessByKey.get("wealth");
    } else if (wsLower.includes("corporate")) {
      businessId = businessByKey.get("corporate");
    } else if (wsLower.includes("secure web")) {
      businessId = businessByKey.get("secure_web");
    } else if (wsLower.includes("omi")) {
      businessId = businessByKey.get("omi");
    }

    await prisma.person.update({
      where: { id: personId },
      data: {
        roleDescription: row[1],
        kind: PersonKind.PERSON,
        confidence: mapConfidence(row[4]),
        areaId: areaId ?? null,
        businessId: businessId ?? null,
      },
    });

    const teamParts = workstreamText.split("/").map((p) => p.trim());
    for (const part of teamParts) {
      const matchedTeam = teams.find(
        (t) =>
          t.name.toLowerCase().includes(part.toLowerCase()) ||
          part.toLowerCase().includes(t.name.toLowerCase().split(" ")[0] ?? ""),
      );
      if (matchedTeam) {
        await prisma.personTeam.upsert({
          where: { personId_teamId: { personId, teamId: matchedTeam.id } },
          create: { personId, teamId: matchedTeam.id, isPrimary: part === teamParts[0] },
          update: { isPrimary: part === teamParts[0] },
        });
      }
    }

    const roleScope = workstreamText || "";
    for (const roleType of inferProgrammeRoles(row[1] ?? "")) {
      await prisma.programmeRoleAssignment.upsert({
        where: {
          personId_roleType_scope: { personId, roleType, scope: roleScope },
        },
        create: {
          personId,
          roleType,
          scope: roleScope || null,
          isPrimary: true,
        },
        update: { isPrimary: true },
      });
    }

    for (const roleType of inferStakeholderRoles(row[1] ?? "")) {
      const existing = await prisma.stakeholderRole.findFirst({
        where: { personId, roleType },
      });
      if (!existing) {
        await prisma.stakeholderRole.create({
          data: { personId, roleType, scope: workstreamText || null },
        });
      }
    }
  }

  for (const [teamName, areaKey] of Object.entries(TEAM_TO_AREA)) {
    const teamId = teamByName.get(teamName);
    const areaId = areaByKey.get(areaKey);
    if (!teamId || !areaId) continue;
    const members = await prisma.personTeam.findMany({
      where: { teamId },
      select: { personId: true },
    });
    for (const { personId } of members) {
      await prisma.person.updateMany({
        where: { id: personId, areaId: null },
        data: { areaId },
      });
    }
  }
}

/** Column headers that must never be ingested as glossary terms. */
const GLOSSARY_HEADER_TOKENS = new Set([
  "term",
  "acronym",
  "system",
  "area",
  "geography",
  "geographies",
]);

export async function seedGlossaryAllSections(prisma: PrismaClient) {
  const content = readPack("01_Context", "glossary.md");
  let currentSection = "Programme & business terms";

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      currentSection = line.replace(/^##\s+/, "").trim();
      continue;
    }
    if (!line.trim().startsWith("|") || line.includes("---")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());

    const term = cells[0];
    const meaning = cells[1] ?? "";
    // Skip header rows (any variant), separator rows, and rows with no meaning.
    if (!term || GLOSSARY_HEADER_TOKENS.has(term.toLowerCase())) continue;
    if (!meaning) continue;

    const category = inferGlossaryCategory(currentSection, term);

    await prisma.glossaryTerm.upsert({
      where: { term },
      create: {
        term,
        meaning,
        category,
        confidence: mapConfidence(cells[2]),
      },
      update: { meaning, category, confidence: mapConfidence(cells[2]) },
    });
  }
}

export async function seedGovernanceReference(prisma: PrismaClient) {
  const programme = await prisma.programme.findFirst();
  const garethId = await getOrCreatePerson(prisma, "Gareth Bew");

  const doc = await prisma.governanceReferenceDoc.upsert({
    where: { slug: "programme-terms-of-reference" },
    create: {
      type: GovernanceDocType.TERMS_OF_REFERENCE,
      title: "Web Transformation Programme — Terms of Reference",
      slug: "programme-terms-of-reference",
      version: "1.0",
      status: GovernanceDocStatus.PUBLISHED,
      summary:
        "Governance reference for stakeholder identification, approval routing, sign-offs, forums, escalation, and communication requirements.",
      programmeId: programme?.id ?? null,
      ownerPersonId: garethId,
      publishedAt: new Date("2026-06-04"),
    },
    update: {
      status: GovernanceDocStatus.PUBLISHED,
      publishedAt: new Date("2026-06-04"),
    },
  });

  await prisma.governanceReferenceSection.deleteMany({ where: { docId: doc.id } });

  const content = readPack("04_Analysis", "stakeholder-and-governance.md");
  const sections: { heading: string; body: string; sortOrder: number }[] = [];
  let currentHeading = "Overview";
  let currentBody: string[] = [];
  let sortOrder = 0;

  const flush = () => {
    if (currentBody.length === 0 && currentHeading === "Overview") return;
    sections.push({
      heading: currentHeading,
      body: currentBody.join("\n").trim(),
      sortOrder: sortOrder++,
    });
    currentBody = [];
  };

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      flush();
      currentHeading = line.replace(/^##\s+/, "").trim();
      continue;
    }
    if (line.startsWith("# ")) continue;
    currentBody.push(line);
  }
  flush();

  for (const section of sections) {
    if (!section.body) continue;
    await prisma.governanceReferenceSection.create({
      data: {
        docId: doc.id,
        heading: section.heading,
        body: section.body,
        sortOrder: section.sortOrder,
      },
    });
  }
}

export async function seedReferenceMappings(prisma: PrismaClient) {
  const mappings: {
    conceptKey: string;
    label: string;
    description: string;
    entityType?: string;
    fieldPath?: string;
    processName?: string;
    glossaryTerm?: string;
  }[] = [
    {
      conceptKey: "person.owner",
      label: "Task / action owner",
      description: "Assignable programme person used as the accountable owner on actions, tasks, risks, and decisions.",
      entityType: "Action",
      fieldPath: "ownerPersonId",
      processName: "Task allocation",
      glossaryTerm: "RAID",
    },
    {
      conceptKey: "stakeholder.role",
      label: "Stakeholder role (RACI)",
      description: "RACI-style stakeholder classification: sponsor, approver, SME, decision maker, informed.",
      entityType: "StakeholderRole",
      fieldPath: "roleType",
      processName: "Governance & RACI",
    },
    {
      conceptKey: "programme.role",
      label: "Programme role",
      description: "Delivery programme role such as stream lead, product owner, gatekeeper, or SME.",
      entityType: "ProgrammeRoleAssignment",
      fieldPath: "roleType",
      processName: "Stakeholder directory",
    },
    {
      conceptKey: "gatekeeper.model",
      label: "Gatekeeper model",
      description: "Design and publishing teams review and sign off every page before go-live (DEC-019).",
      entityType: "GovernanceReferenceDoc",
      processName: "Publishing gate",
      glossaryTerm: "Gatekeeper model",
    },
    {
      conceptKey: "directory.area",
      label: "Directory area",
      description: "Organisational area grouping stakeholders (programme, design, execution, regional, etc.).",
      entityType: "Person",
      fieldPath: "areaId",
      processName: "Stakeholder directory",
    },
    {
      conceptKey: "directory.cluster",
      label: "Audience cluster",
      description: "Audience cluster for IA sign-off and content audit (Personal, Corporate, Business, Wealth).",
      entityType: "Person",
      fieldPath: "clusterId",
      processName: "Template sign-off",
    },
    {
      conceptKey: "directory.business",
      label: "Business area",
      description: "Business or site set the stakeholder represents (OMAR, Wealth, Secure Web, etc.).",
      entityType: "Person",
      fieldPath: "businessId",
      processName: "Stakeholder directory",
    },
    {
      conceptKey: "contact.visibility",
      label: "Contact visibility",
      description: "Controls whether email/phone are visible based on role and per-person visibility setting.",
      entityType: "Person",
      fieldPath: "contactVisibility",
      processName: "PII access control",
    },
  ];

  for (const m of mappings) {
    const glossaryTerm = m.glossaryTerm
      ? await prisma.glossaryTerm.findUnique({ where: { term: m.glossaryTerm } })
      : null;

    const existing = await prisma.referenceMapping.findFirst({
      where: { conceptKey: m.conceptKey },
    });

    if (existing) {
      await prisma.referenceMapping.update({
        where: { id: existing.id },
        data: {
          label: m.label,
          description: m.description,
          entityType: m.entityType ?? null,
          fieldPath: m.fieldPath ?? null,
          processName: m.processName ?? null,
          glossaryTermId: glossaryTerm?.id ?? null,
        },
      });
    } else {
      await prisma.referenceMapping.create({
        data: {
          conceptKey: m.conceptKey,
          label: m.label,
          description: m.description,
          entityType: m.entityType ?? null,
          fieldPath: m.fieldPath ?? null,
          processName: m.processName ?? null,
          glossaryTermId: glossaryTerm?.id ?? null,
        },
      });
    }
  }
}
