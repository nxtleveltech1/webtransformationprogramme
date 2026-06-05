import { prisma } from "@/lib/db";

export async function getGovernanceForums() {
  return prisma.governanceForum.findMany({
    orderBy: { name: "asc" },
  });
}

export type GovernanceForumRecord = Awaited<
  ReturnType<typeof getGovernanceForums>
>[number];

/** Splits a comma/newline-delimited members string into a clean list. */
export function parseMembers(members: string | null | undefined): string[] {
  if (!members) return [];
  return members
    .split(/[,\n;]+/)
    .map((m) => m.trim())
    .filter(Boolean);
}
