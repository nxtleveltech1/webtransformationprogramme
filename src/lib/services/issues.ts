import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type IssueRow = Prisma.IssueGetPayload<{
  include: { ownerPerson: true; project: true };
}>;

export async function getIssues(): Promise<IssueRow[]> {
  return prisma.issue.findMany({
    include: { ownerPerson: true, project: true },
    orderBy: { externalId: "asc" },
  });
}
