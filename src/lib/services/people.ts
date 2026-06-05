import { prisma } from "@/lib/db";

export async function getPeople() {
  return prisma.person.findMany({
    orderBy: { displayName: "asc" },
    include: {
      teamAssignments: {
        include: { team: { select: { id: true, name: true } } },
      },
      stakeholderRoles: true,
    },
  });
}

export type PersonWithRelations = Awaited<ReturnType<typeof getPeople>>[number];

export async function getTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      members: {
        include: {
          person: { select: { id: true, displayName: true, roleDescription: true } },
        },
      },
    },
  });
}

export type TeamWithMembers = Awaited<ReturnType<typeof getTeams>>[number];

export async function getPeopleData() {
  const [people, teams] = await Promise.all([getPeople(), getTeams()]);
  return { people, teams };
}
