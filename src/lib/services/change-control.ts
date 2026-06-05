import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const changeRequestInclude = {
  project: { select: { id: true, name: true, code: true } },
  approverPerson: { select: { id: true, displayName: true } },
} satisfies Prisma.ChangeRequestInclude;

export type ChangeRequestWithRelations = Prisma.ChangeRequestGetPayload<{
  include: typeof changeRequestInclude;
}>;

export type AuditEntry = {
  id: string;
  action: string;
  actorName: string | null;
  actorRole: string | null;
  payload: Prisma.JsonValue;
  createdAt: Date;
  entityId: string;
};

export type ProjectOption = { id: string; name: string; code: string | null };
export type PersonOption = { id: string; displayName: string };

export function getChangeRequests(): Promise<ChangeRequestWithRelations[]> {
  return prisma.changeRequest.findMany({
    include: changeRequestInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getChangeRequestAudit(): Promise<AuditEntry[]> {
  const events = await prisma.auditEvent.findMany({
    where: { entityType: "ChangeRequest" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      actorName: true,
      actorRole: true,
      payload: true,
      createdAt: true,
      entityId: true,
    },
  });
  return events;
}

export function getProjectOptions(): Promise<ProjectOption[]> {
  return prisma.project.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
}

export function getApproverOptions(): Promise<PersonOption[]> {
  return prisma.person.findMany({
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}
