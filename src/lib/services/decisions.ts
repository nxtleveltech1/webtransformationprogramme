import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type DecisionRow = Prisma.DecisionGetPayload<{
  include: { ownerPerson: true; workstream: true };
}>;

export async function getDecisions(): Promise<DecisionRow[]> {
  return prisma.decision.findMany({
    include: { ownerPerson: true, workstream: true },
    orderBy: { externalId: "asc" },
  });
}
