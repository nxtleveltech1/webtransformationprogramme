import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AssumptionRow = Prisma.AssumptionGetPayload<{
  include: { validatorPerson: true };
}>;

export async function getAssumptions(): Promise<AssumptionRow[]> {
  return prisma.assumption.findMany({
    include: { validatorPerson: true },
    orderBy: { externalId: "asc" },
  });
}
