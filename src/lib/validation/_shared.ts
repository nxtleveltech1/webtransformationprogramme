import { z } from "zod";

/**
 * Coerces empty / whitespace-only strings to `null` so optional text inputs and
 * un-set selects map cleanly onto nullable Prisma columns. Returns
 * `string | null | undefined` — `undefined` leaves the column untouched on update.
 */
export const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().trim().nullish(),
);

/** Optional enum select that treats "" as "unset" (null). */
export function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.enum(values).nullish(),
  );
}

/** Required, trimmed, non-empty string. */
export const requiredText = z.string().trim().min(1, "Required");
