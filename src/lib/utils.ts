import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strict ISO date matcher. Workshop data mixes real ISO dates ("2026-06-30")
 * with free-text labels ("Day 2", "End June", "Not confirmed"). The native
 * `Date` parser coerces some of those labels into bogus dates (e.g. "Day 2"
 * becomes 01 Feb 2001), so we only ever treat a string as a date when it is a
 * genuine ISO date/datetime. Everything else is returned verbatim.
 */
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/** Parse a value to epoch ms only if it is a real Date or ISO date string. */
export function parseDateMs(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }
  const trimmed = value.trim();
  if (!ISO_DATE.test(trimmed)) return null;
  const t = new Date(trimmed).getTime();
  return Number.isNaN(t) ? null : t;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "\u2014";
  // Free-text labels (e.g. "Day 2", "Not confirmed") are shown as-is.
  if (typeof value === "string" && !ISO_DATE.test(value.trim())) return value;
  const ms = parseDateMs(value);
  if (ms === null) return typeof value === "string" ? value : "\u2014";
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function relativeDays(value: Date | string | null | undefined): number | null {
  const ms = parseDateMs(value);
  if (ms === null) return null;
  const diff = Date.now() - ms;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return "\u2014";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** Join a person's display name and surname into a full name. */
export function fullName(
  person: { displayName: string; surname?: string | null } | null | undefined,
): string {
  if (!person) return "\u2014";
  const full = [person.displayName, person.surname].filter(Boolean).join(" ").trim();
  return full || person.displayName || "\u2014";
}

/** Strip basic markdown emphasis/code markers and collapse whitespace. */
export function stripMarkdown(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/\*\*|__|`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Produce a short, table-friendly role title: strip markdown, then take the
 * text before the first sentence/clause break (`;`, ` — `, `.`, `(`).
 * The full narrative remains available in the detail drawer / tooltip.
 */
export function conciseRole(value: string | null | undefined): string {
  const clean = stripMarkdown(value);
  if (!clean) return "\u2014";
  const cut = clean.split(/\s+—\s+|[;.(]/)[0]?.trim();
  return cut || clean;
}
