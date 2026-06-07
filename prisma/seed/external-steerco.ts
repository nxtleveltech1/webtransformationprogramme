import {
  Confidence,
  ParticipantStatus,
  PersonKind,
  PrismaClient,
  StakeholderRoleType,
} from "@prisma/client";

const EXTERNAL_STEERCO_AREA = {
  key: "external_steerco",
  name: "External Steerco",
  sortOrder: 12,
};

const STEERCO_CLUSTERS = [
  { key: "gtt", name: "GTT", audienceLabel: "GTT cluster", sortOrder: 10 },
  {
    key: "group_marketing",
    name: "Group Marketing",
    audienceLabel: "Group Marketing",
    sortOrder: 11,
  },
  {
    key: "group_compliance",
    name: "Group Compliance",
    audienceLabel: "Group Compliance",
    sortOrder: 12,
  },
  { key: "ls_pf", name: "L&S (PF)", audienceLabel: "Personal Finance", sortOrder: 13 },
  { key: "ls_mfc", name: "L&S (MFC)", audienceLabel: "MFC", sortOrder: 14 },
  {
    key: "ls_servicing",
    name: "L&S (Servicing)",
    audienceLabel: "Servicing",
    sortOrder: 15,
  },
  { key: "ls_wealth", name: "L&S (Wealth)", audienceLabel: "Wealth", sortOrder: 16 },
  {
    key: "ls_corporate",
    name: "L&S (Corporate)",
    audienceLabel: "Corporate",
    sortOrder: 17,
  },
  { key: "iwyze", name: "iWyze", audienceLabel: "iWyze", sortOrder: 18 },
  { key: "om_insure", name: "OM Insure", audienceLabel: "OM Insure", sortOrder: 19 },
  { key: "omar_cluster", name: "OMAR", audienceLabel: "OMAR", sortOrder: 20 },
];

const STEERCO_BUSINESSES = [
  { key: "grid", name: "GRiD", sortOrder: 20 },
  { key: "digital_channels", name: "Digital Channels", sortOrder: 21 },
  { key: "design_ba", name: "Design", sortOrder: 22 },
  { key: "group_marketing_ba", name: "Group Marketing", sortOrder: 23 },
  { key: "group_risk", name: "Group Risk", sortOrder: 24 },
  { key: "pf", name: "PF", sortOrder: 25 },
  { key: "mfc", name: "MFC", sortOrder: 26 },
  { key: "servicing", name: "Servicing", sortOrder: 27 },
  { key: "wealth_ba", name: "Wealth", sortOrder: 28 },
  { key: "corporate_ba", name: "Corporate", sortOrder: 29 },
  { key: "iwyze_ba", name: "iWYZE", sortOrder: 30 },
  { key: "ominsure", name: "OMInsure", sortOrder: 31 },
];

type SteercoMember = {
  displayName: string;
  surname: string;
  clusterKey: string;
  businessKey: string;
  roleDescription: string;
  primaryContact?: string;
  confidence?: Confidence;
  participantStatus?: ParticipantStatus;
};

/** External Steerco members — source: programme steerco roster (Jun 2026). */
const EXTERNAL_STEERCO_MEMBERS: SteercoMember[] = [
  {
    displayName: "Megan",
    surname: "Harrison",
    clusterKey: "gtt",
    businessKey: "grid",
    roleDescription: "Head of GRiD",
  },
  {
    displayName: "Marlana",
    surname: "Moller",
    clusterKey: "gtt",
    businessKey: "grid",
    roleDescription: "PPM",
  },
  {
    displayName: "Keshvi",
    surname: "Singh",
    clusterKey: "gtt",
    businessKey: "digital_channels",
    roleDescription: "Web PO",
  },
  {
    displayName: "Gareth",
    surname: "Bew",
    clusterKey: "gtt",
    businessKey: "digital_channels",
    roleDescription: "Project Manager",
  },
  {
    displayName: "Rey",
    surname: "Uys",
    clusterKey: "gtt",
    businessKey: "design_ba",
    roleDescription: "Head of Design",
  },
  {
    displayName: "Mosala",
    surname: "Philips",
    clusterKey: "group_marketing",
    businessKey: "group_marketing_ba",
    roleDescription: "Chief Marketing Officer",
  },
  {
    displayName: "Rianca",
    surname: "Gangiah",
    clusterKey: "group_compliance",
    businessKey: "group_risk",
    roleDescription: "Senior Risk Officer",
  },
  {
    displayName: "Kwena",
    surname: "Mothibi",
    clusterKey: "ls_pf",
    businessKey: "pf",
    roleDescription: "Head Customer Solutions",
  },
  {
    displayName: "Marcelle",
    surname: "Arnolds",
    clusterKey: "ls_mfc",
    businessKey: "mfc",
    roleDescription: "Bus Development Manager",
  },
  {
    displayName: "Khathu",
    surname: "Ramoliko",
    clusterKey: "ls_servicing",
    businessKey: "servicing",
    roleDescription: "Head of Customer Proposition",
  },
  {
    displayName: "Abeeda",
    surname: "Hendry",
    clusterKey: "ls_wealth",
    businessKey: "wealth_ba",
    roleDescription: "COO - Local Platforms",
  },
  {
    displayName: "Lourens",
    surname: "Joubert",
    clusterKey: "ls_corporate",
    businessKey: "corporate_ba",
    roleDescription: "Head: Corporate Digital",
  },
  {
    displayName: "Riana",
    surname: "Smit",
    clusterKey: "iwyze",
    businessKey: "iwyze_ba",
    roleDescription: "Chief Growth Officer",
  },
  {
    displayName: "Jaco",
    surname: "Brittz",
    clusterKey: "om_insure",
    businessKey: "ominsure",
    roleDescription: "Strategic Projects & Change",
  },
  {
    displayName: "Irene",
    surname: "Akiy",
    clusterKey: "omar_cluster",
    businessKey: "omar",
    roleDescription: "To be confirmed",
    confidence: Confidence.REQUIRES_VALIDATION,
    participantStatus: ParticipantStatus.TO_BE_CONFIRMED,
  },
];

async function upsertSteercoPerson(
  prisma: PrismaClient,
  member: SteercoMember,
  areaId: string,
  clusterId: string,
  businessId: string,
) {
  let person = await prisma.person.findFirst({
    where: { displayName: member.displayName, surname: member.surname },
  });

  if (!person) {
    const legacy = await prisma.person.findFirst({
      where: {
        displayName: member.displayName,
        surname: null,
        kind: PersonKind.PERSON,
      },
    });
    if (legacy) {
      person = await prisma.person.update({
        where: { id: legacy.id },
        data: { surname: member.surname },
      });
    }
  }

  if (!person) {
    person = await prisma.person.create({
      data: {
        displayName: member.displayName,
        surname: member.surname,
        kind: PersonKind.PERSON,
        confidence: member.confidence ?? Confidence.CONFIRMED,
      },
    });
  } else {
    person = await prisma.person.update({
      where: { id: person.id },
      data: {
        surname: member.surname,
        kind: PersonKind.PERSON,
        confidence: member.confidence ?? Confidence.CONFIRMED,
      },
    });
  }

  await prisma.person.update({
    where: { id: person.id },
    data: {
      roleDescription: member.roleDescription,
      primaryContact: member.primaryContact ?? member.displayName,
      participantStatus: member.participantStatus ?? ParticipantStatus.CONFIRMED,
      areaId,
      clusterId,
      businessId,
    },
  });

  const existingRole = await prisma.stakeholderRole.findFirst({
    where: {
      personId: person.id,
      roleType: StakeholderRoleType.STEERCING_MEMBER,
      scope: "External Steerco",
    },
  });
  if (!existingRole) {
    await prisma.stakeholderRole.create({
      data: {
        personId: person.id,
        roleType: StakeholderRoleType.STEERCING_MEMBER,
        roleLabel: "External Steerco Member",
        scope: "External Steerco",
      },
    });
  } else {
    await prisma.stakeholderRole.update({
      where: { id: existingRole.id },
      data: { roleLabel: "External Steerco Member" },
    });
  }

  return person.id;
}

export async function seedExternalSteerco(prisma: PrismaClient) {
  await prisma.directoryArea.upsert({
    where: { key: EXTERNAL_STEERCO_AREA.key },
    create: EXTERNAL_STEERCO_AREA,
    update: {
      name: EXTERNAL_STEERCO_AREA.name,
      sortOrder: EXTERNAL_STEERCO_AREA.sortOrder,
    },
  });

  for (const cluster of STEERCO_CLUSTERS) {
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

  for (const business of STEERCO_BUSINESSES) {
    await prisma.directoryBusiness.upsert({
      where: { key: business.key },
      create: business,
      update: { name: business.name, sortOrder: business.sortOrder },
    });
  }

  const area = await prisma.directoryArea.findUniqueOrThrow({
    where: { key: EXTERNAL_STEERCO_AREA.key },
  });
  const clusters = await prisma.directoryCluster.findMany({
    where: { key: { in: STEERCO_CLUSTERS.map((c) => c.key) } },
  });
  const businesses = await prisma.directoryBusiness.findMany({
    where: {
      key: {
        in: [...STEERCO_BUSINESSES.map((b) => b.key), "omar"],
      },
    },
  });

  const clusterByKey = new Map(clusters.map((c) => [c.key, c.id]));
  const businessByKey = new Map(businesses.map((b) => [b.key, b.id]));

  for (const member of EXTERNAL_STEERCO_MEMBERS) {
    const clusterId = clusterByKey.get(member.clusterKey);
    const businessId = businessByKey.get(member.businessKey);
    if (!clusterId || !businessId) {
      throw new Error(
        `Missing taxonomy for ${member.displayName} ${member.surname}: cluster=${member.clusterKey} business=${member.businessKey}`,
      );
    }
    await upsertSteercoPerson(prisma, member, area.id, clusterId, businessId);
  }
}
