export type PersonNameFields = {
  displayName: string;
  surname?: string | null;
};

export function formatPersonName(
  person: PersonNameFields | null | undefined,
  fallback?: string | null
): string {
  if (!person) return fallback?.trim() || "Unassigned";
  const full = [person.displayName, person.surname].filter(Boolean).join(" ").trim();
  return full || person.displayName || fallback?.trim() || "Unassigned";
}

export function formatOwnerDisplay(
  ownerText: string | null | undefined,
  person: PersonNameFields | null | undefined
): string {
  // A structured Person is the source of truth — prefer it over any denormalised
  // free-text copy, which can go stale when the owner is reassigned. Free-text is
  // only used (e.g. for multi-owner teams) when no Person is assigned.
  if (person) return formatPersonName(person, ownerText);
  return ownerText?.trim() || "Unassigned";
}

export function formatWorkstreamLead(
  leadText: string | null | undefined,
  person: PersonNameFields | null | undefined
): string {
  if (person) return formatPersonName(person, leadText);
  return leadText?.trim() || "Unassigned";
}
