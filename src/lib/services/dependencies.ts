import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type DependencyRow = Prisma.DependencyGetPayload<{
  include: { workstream: true; project: true };
}>;

export async function getDependencies(): Promise<DependencyRow[]> {
  return prisma.dependency.findMany({
    include: { workstream: true, project: true },
    orderBy: { externalId: "asc" },
  });
}
