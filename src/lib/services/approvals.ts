import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const approvalInclude = {
  approverPerson: { select: { id: true, displayName: true } },
} satisfies Prisma.ApprovalInclude;

export type ApprovalWithRelations = Prisma.ApprovalGetPayload<{
  include: typeof approvalInclude;
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

export type PersonOption = { id: string; displayName: string };

export function getApprovals(): Promise<ApprovalWithRelations[]> {
  return prisma.approval.findMany({
    include: approvalInclude,
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getApprovalAudit(): Promise<AuditEntry[]> {
  return prisma.auditEvent.findMany({
    where: { entityType: "Approval" },
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
}

export function getApproverOptions(): Promise<PersonOption[]> {
  return prisma.person.findMany({
    where: { kind: "PERSON" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}
