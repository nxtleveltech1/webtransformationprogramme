import { prisma } from "@/lib/db";

export async function getSystemPlatforms() {
  return prisma.systemPlatform.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export type SystemPlatformRecord = Awaited<
  ReturnType<typeof getSystemPlatforms>
>[number];

export function groupByCategory(platforms: SystemPlatformRecord[]) {
  const groups = new Map<string, SystemPlatformRecord[]>();
  for (const p of platforms) {
    const key = p.category ?? "Uncategorised";
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }
  return Array.from(groups.entries())
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
