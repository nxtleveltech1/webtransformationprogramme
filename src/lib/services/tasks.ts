import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const taskInclude = {
  ownerPerson: true,
  workstream: true,
  project: true,
} satisfies Prisma.ActionInclude;

export type TaskWithRelations = Prisma.ActionGetPayload<{
  include: typeof taskInclude;
}>;

export type PersonOption = { id: string; displayName: string };
export type WorkstreamOption = { id: string; code: string; name: string };

export function getTasks(): Promise<TaskWithRelations[]> {
  return prisma.action.findMany({
    include: taskInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export function getPeopleOptions(): Promise<PersonOption[]> {
  return prisma.person.findMany({
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}

export function getWorkstreamOptions(): Promise<WorkstreamOption[]> {
  return prisma.workstream.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { sortOrder: "asc" },
  });
}
