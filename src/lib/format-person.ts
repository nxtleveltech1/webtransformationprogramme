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
  const text = ownerText?.trim();
  if (text && (text.includes("/") || text.includes(",") || text.includes(";"))) return text;
  if (text && !person) return text;
  return formatPersonName(person, text);
}

export function formatWorkstreamLead(
  leadText: string | null | undefined,
  person: PersonNameFields | null | undefined
): string {
  const text = leadText?.trim();
  if (text) return text;
  return formatPersonName(person, null);
}
