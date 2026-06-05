import type {
  ContactVisibility,
  ProgrammeRoleType,
  StakeholderRoleType,
} from "@prisma/client";

import { getCurrentActor } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewContactDetails } from "@/lib/rbac/server-guard";

const personInclude = {
  area: { select: { id: true, key: true, name: true } },
  business: { select: { id: true, key: true, name: true } },
  cluster: { select: { id: true, key: true, name: true, audienceLabel: true } },
  primaryWorkstream: { select: { id: true, code: true, name: true } },
  dataOwner: { select: { id: true, displayName: true } },
  teamAssignments: {
    include: { team: { select: { id: true, name: true } } },
  },
  stakeholderRoles: true,
  programmeRoles: {
    include: {
      workstream: { select: { id: true, code: true, name: true } },
    },
  },
} as const;

export type StakeholderRecord = Awaited<
  ReturnType<typeof getStakeholderDirectory>
>["people"][number];

export interface StakeholderDirectoryFilters {
  areaId?: string;
  businessId?: string;
  clusterId?: string;
  teamId?: string;
  programmeRole?: ProgrammeRoleType;
  stakeholderRole?: StakeholderRoleType;
  workstreamId?: string;
  activeOnly?: boolean;
  query?: string;
}

function redactContact<T extends {
  email: string | null;
  phone: string | null;
  mobile: string | null;
  contactVisibility: ContactVisibility;
}>(
  person: T,
  canViewPii: boolean,
): T {
  if (canViewPii && person.contactVisibility !== "NAME_ONLY") {
    if (person.contactVisibility === "RESTRICTED") {
      return { ...person, phone: null, mobile: null, email: null };
    }
    return person;
  }
  return { ...person, phone: null, mobile: null, email: null };
}

export async function getStakeholderDirectory(
  filters: StakeholderDirectoryFilters = {},
) {
  const actor = await getCurrentActor();
  const canViewPii = canViewContactDetails(actor.role);

  const where = {
    ...(filters.activeOnly !== false ? { active: true } : {}),
    ...(filters.areaId ? { areaId: filters.areaId } : {}),
    ...(filters.businessId ? { businessId: filters.businessId } : {}),
    ...(filters.clusterId ? { clusterId: filters.clusterId } : {}),
    ...(filters.workstreamId ? { primaryWorkstreamId: filters.workstreamId } : {}),
    ...(filters.teamId
      ? { teamAssignments: { some: { teamId: filters.teamId } } }
      : {}),
    ...(filters.programmeRole
      ? { programmeRoles: { some: { roleType: filters.programmeRole } } }
      : {}),
    ...(filters.stakeholderRole
      ? { stakeholderRoles: { some: { roleType: filters.stakeholderRole } } }
      : {}),
    ...(filters.query
      ? {
          OR: [
            { displayName: { contains: filters.query, mode: "insensitive" as const } },
            { surname: { contains: filters.query, mode: "insensitive" as const } },
            { roleDescription: { contains: filters.query, mode: "insensitive" as const } },
            { department: { contains: filters.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [people, areas, businesses, clusters, teams, workstreams] =
    await Promise.all([
      prisma.person.findMany({
        where,
        orderBy: [{ displayName: "asc" }],
        include: personInclude,
      }),
      prisma.directoryArea.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.directoryBusiness.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.directoryCluster.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.team.findMany({ orderBy: { name: "asc" } }),
      prisma.workstream.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, code: true, name: true },
      }),
    ]);

  const redactedPeople = people.map((p) => redactContact(p, canViewPii));

  return {
    people: redactedPeople,
    areas,
    businesses,
    clusters,
    teams,
    workstreams,
    canViewPii,
    summary: {
      total: people.length,
      withProgrammeRoles: people.filter((p) => p.programmeRoles.length > 0).length,
      withStakeholderRoles: people.filter((p) => p.stakeholderRoles.length > 0).length,
      restrictedContact: people.filter(
        (p) =>
          p.contactVisibility !== "PUBLIC_INTERNAL" ||
          !canViewPii,
      ).length,
      byCluster: clusters.map((c) => ({
        id: c.id,
        name: c.name,
        count: people.filter((p) => p.clusterId === c.id).length,
      })),
    },
  };
}

export async function getStakeholderDirectorySummary() {
  const data = await getStakeholderDirectory({ activeOnly: true });
  const memberships = await prisma.personTeam.findMany({
    include: {
      person: {
        select: { id: true, displayName: true, roleDescription: true, active: true },
      },
      team: { select: { id: true, name: true, functionDescription: true } },
    },
  });

  const teams = data.teams.map((team) => ({
    ...team,
    members: memberships
      .filter((m) => m.teamId === team.id && m.person.active)
      .map((m) => ({
        id: m.id,
        isPrimary: m.isPrimary,
        person: m.person,
      })),
  }));

  return { people: data.people, teams };
}

export async function getStakeholderFormOptions() {
  const [areas, businesses, clusters, teams, workstreams, people] =
    await Promise.all([
      prisma.directoryArea.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.directoryBusiness.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.directoryCluster.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.team.findMany({ orderBy: { name: "asc" } }),
      prisma.workstream.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, code: true, name: true },
      }),
      prisma.person.findMany({
        where: { active: true },
        orderBy: { displayName: "asc" },
        select: { id: true, displayName: true },
      }),
    ]);

  return { areas, businesses, clusters, teams, workstreams, people };
}
