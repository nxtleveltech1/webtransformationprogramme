import { prisma } from "@/lib/db";

/**
 * Person option used to populate owner/validator select inputs across the
 * RAID & governance registers.
 */
export type PersonOption = {
  id: string;
  displayName: string;
};

/**
 * Returns the list of people for owner/validator dropdowns, ordered by name.
 */
export async function getPeopleOptions(): Promise<PersonOption[]> {
  const people = await prisma.person.findMany({
    where: { kind: "PERSON" },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
  return people;
}

/**
 * Computes the next sequential externalId for a register given the prefix and
 * the set of existing ids (e.g. "RSK" -> "RSK-023"). Robust to gaps and to the
 * RegisterSequence table being out of sync because it derives from live data.
 */
export function computeNextExternalId(prefix: string, existingIds: string[]): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, "i");
  let highest = 0;
  for (const id of existingIds) {
    const match = id.match(pattern);
    if (match) {
      highest = Math.max(highest, Number.parseInt(match[1], 10));
    }
  }
  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
}

/**
 * Converts empty/blank strings in an object to null at runtime so optional text
 * fields are stored cleanly. The static type is preserved: required, enum and
 * validated non-empty fields keep their original types (they are never blank),
 * while nullable Prisma columns accept the null produced for empty inputs.
 */
export function blankToNull<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return out as T;
}
