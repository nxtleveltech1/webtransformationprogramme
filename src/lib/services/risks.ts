import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type RiskRow = Prisma.RiskGetPayload<{
  include: { ownerPerson: true; workstream: true };
}>;

export async function getRisks(): Promise<RiskRow[]> {
  return prisma.risk.findMany({
    include: { ownerPerson: true, workstream: true },
    orderBy: { externalId: "asc" },
  });
}
