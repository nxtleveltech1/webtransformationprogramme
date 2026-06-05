/**
 * Canonical people — single source of truth for the Stakeholder Directory.
 *
 * Derived from the workshop SSOT:
 *   - WorkshopPack/01_Context/people-and-teams.md  (named individuals, Day 1 + Day 2)
 *   - WorkshopPack/01_Context/workshop-deck-ownership.md  (full names for stream leads)
 *
 * This module is used by BOTH the seeder (prisma/seed/*) and the one-time
 * correction script (prisma/fix-directory-data.ts) so that:
 *   - first-name-only mentions and transcript aliases collapse onto one Person,
 *   - groups / functions are never minted as people (kept as kind=GROUP if they exist),
 *   - parser fragments (e.g. "Gareth (GB", "Design (Seba", "Gareth + stream leads")
 *     resolve to the correct canonical person instead of becoming junk rows.
 *
 * It is deliberately an explicit allowlist (small, reviewable dataset). Any token
 * that does not resolve to a canonical person returns `null` — the caller then
 * falls back to the existing `ownerText` columns rather than minting a Person.
 */

export type CanonicalPerson = {
  /** Stable key for grouping/merging (lowercased canonical full name). */
  key: string;
  displayName: string;
  surname: string | null;
  /** First-name-only mentions, transcript variants, and initials. */
  aliases: string[];
};

/**
 * Real, named individuals evidenced in the workshop sources.
 * Full names come from the deck ownership SSOT where available; single-name
 * entries are individuals for whom no surname is evidenced.
 */
export const CANONICAL_PEOPLE: CanonicalPerson[] = [
  { key: "gareth bew", displayName: "Gareth", surname: "Bew", aliases: ["gareth", "gb"] },
  { key: "keshvi singh", displayName: "Keshvi", surname: "Singh", aliases: ["keshvi"] },
  { key: "bertus goosen", displayName: "Bertus", surname: "Goosen", aliases: ["bertus"] },
  { key: "nithin ramsaroop", displayName: "Nithin", surname: "Ramsaroop", aliases: ["nithin"] },
  { key: "wayne moodley", displayName: "Wayne", surname: "Moodley", aliases: ["wayne"] },
  {
    key: "tebogo segoje",
    displayName: "Tebogo",
    surname: "Segoje",
    aliases: ["tebogo", "toboco"],
  },
  {
    key: "brent van ziller",
    displayName: "Brent",
    surname: "Van Ziller",
    aliases: ["brent", "brent von zitters", "brent von zitter", "brent van ziller"],
  },
  {
    key: "bernice bryce",
    displayName: "Bernice",
    surname: "Bryce",
    aliases: ["bernice", "baxis"],
  },
  { key: "natalie patel", displayName: "Natalie", surname: "Patel", aliases: ["natalie"] },
  {
    key: "luvuyo mkumatela",
    displayName: "Luvuyo",
    surname: "Mkumatela",
    aliases: ["luvuyo"],
  },
  {
    key: "sebabatso mtimkulu",
    displayName: "Sebabatso",
    surname: "Mtimkulu",
    aliases: ["seba", "sebastian"],
  },
  { key: "justin evans", displayName: "Justin", surname: "Evans", aliases: ["justin"] },
  {
    key: "zethembiso msomi",
    displayName: "Zethembiso",
    surname: "Msomi",
    aliases: ["zee", "zethembiso"],
  },
  {
    key: "kameshnee chetty",
    displayName: "Kameshnee",
    surname: "Chetty",
    aliases: ["kameshnee"],
  },
  // Individuals without an evidenced surname (canonical = single name).
  { key: "daniel", displayName: "Daniel", surname: null, aliases: [] },
  { key: "megan", displayName: "Megan", surname: null, aliases: [] },
  { key: "marlana", displayName: "Marlana", surname: null, aliases: [] },
  { key: "joanne", displayName: "Joanne", surname: null, aliases: [] },
  { key: "nthabi", displayName: "Nthabi", surname: null, aliases: [] },
  { key: "orisha", displayName: "Orisha", surname: null, aliases: [] },
  { key: "debs", displayName: "Debs", surname: null, aliases: [] },
  { key: "andre", displayName: "André", surname: null, aliases: ["andre"] },
  { key: "rey", displayName: "Rey", surname: null, aliases: [] },
  { key: "tsoaeli", displayName: "Tsoaeli", surname: null, aliases: [] },
  { key: "reza", displayName: "Reza", surname: null, aliases: [] },
  { key: "nzama", displayName: "Nzama", surname: null, aliases: [] },
  { key: "vallabh", displayName: "Vallabh", surname: null, aliases: [] },
  { key: "loza", displayName: "Loza", surname: null, aliases: [] },
  { key: "elise", displayName: "Elise", surname: null, aliases: [] },
  { key: "nodalo", displayName: "Nodalo", surname: null, aliases: [] },
  { key: "boyer", displayName: "Boyer", surname: null, aliases: [] },
  { key: "edinah", displayName: "Edinah", surname: null, aliases: [] },
  { key: "siva", displayName: "Siva", surname: null, aliases: [] },
];

/**
 * Groups, functions, teams, and titles that must never be minted as a Person.
 * Existing rows matching these are reclassified to `kind = GROUP` (retained for
 * owner/audit integrity) and hidden from the Stakeholder Directory.
 */
export const NON_PERSON_TOKENS = new Set<string>([
  "business",
  "business teams",
  "comms",
  "communications",
  "compliance",
  "marketing",
  "group marketing",
  "brand",
  "brand / ci",
  "ci",
  "security",
  "security team",
  "support",
  "training",
  "sponsor",
  "steering",
  "steering committee",
  "workstream leads",
  "workstream lead",
  "stream leads",
  "stream lead",
  "content leads",
  "secure web",
  "web platform",
  "web",
  "platform",
  "e-commerce",
  "e-commerce team",
  "ecommerce",
  "cross channels solutions",
  "cross channel solutions",
  "cross channels",
  "cross channel",
  "cc",
  "design system",
  "design systems",
  "design & content",
  "design and content",
  "design team",
  "design delivery",
  "design standards",
  "omds",
  "feature teams",
  "content",
  "publishing",
  "execution",
  "engineering",
  "automation",
  "observability",
  "programme",
  "programme / delivery",
  "programme leadership",
  "programme support",
  "delivery",
  "product",
  "product smes",
  "product sme",
  "clusters",
  "clusters / product smes",
  "call centre",
  "call center",
  "ia",
  "seo",
  "faoli bank",
  "all participants",
  "participants",
  "senior team",
  "senior leadership",
  "leadership",
  "service team",
  "regional",
  "regional / country",
  "regional / country teams",
  "country teams",
  "technical teams",
  "tooling",
  "partnership",
  "finance",
  "finance / sponsor",
  "exec",
  "executive",
  "cfo",
  "omar",
  "omar team",
  "omi",
  "group",
  "tbc",
  "unassigned",
  "n/a",
  "na",
]);

/** Normalize a token: lowercase, strip diacritics, collapse whitespace. */
export function normalizePersonToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Build the alias → canonical lookup once.
const ALIAS_TO_CANONICAL = new Map<string, CanonicalPerson>();
for (const person of CANONICAL_PEOPLE) {
  const full = [person.displayName, person.surname].filter(Boolean).join(" ");
  const keys = new Set<string>([
    person.key,
    normalizePersonToken(full),
    normalizePersonToken(person.displayName),
    ...person.aliases.map(normalizePersonToken),
  ]);
  for (const k of keys) {
    if (k) ALIAS_TO_CANONICAL.set(k, person);
  }
}

/** Public, read-only view of the alias map (normalized alias → canonical). */
export const aliases: ReadonlyMap<string, CanonicalPerson> = ALIAS_TO_CANONICAL;

/** True if the (normalized) token is a known group / function / title. */
export function isNonPersonToken(value: string): boolean {
  return NON_PERSON_TOKENS.has(normalizePersonToken(value));
}

/**
 * Split a raw owner/name string into candidate name tokens, breaking on the
 * separators that produced parser fragments: `/  +  &  ,  ;  (  )` and "and".
 */
function candidateTokens(raw: string): string[] {
  return raw
    .split(/\s*(?:\/|\+|&|,|;|\(|\)|\band\b)\s*/i)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Resolve a raw token to its canonical person identity, or `null` if it is a
 * group, function, title, or unresolvable fragment.
 *
 * Resolution order:
 *   1. Try the whole normalized token as an alias/full name.
 *   2. Otherwise split on fragment separators and return the first candidate
 *      that maps to a canonical person (so "Design (Seba" → Sebabatso Mtimkulu,
 *      "Gareth + stream leads" → Gareth Bew, "Content (GB" → Gareth Bew).
 *   3. If no candidate resolves, return null (caller falls back to ownerText).
 */
export function resolveCanonical(
  name: string | null | undefined,
): { key: string; displayName: string; surname: string | null } | null {
  if (!name) return null;
  const whole = normalizePersonToken(name);
  if (!whole || whole === "-" || whole === "unassigned") return null;

  const direct = ALIAS_TO_CANONICAL.get(whole);
  if (direct) {
    return { key: direct.key, displayName: direct.displayName, surname: direct.surname };
  }

  for (const candidate of candidateTokens(name)) {
    const norm = normalizePersonToken(candidate);
    const match = ALIAS_TO_CANONICAL.get(norm);
    if (match) {
      return { key: match.key, displayName: match.displayName, surname: match.surname };
    }
  }
  return null;
}
