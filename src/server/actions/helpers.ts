import { z } from "zod";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Parses input against a zod schema and returns a normalised result so callers
 * can surface field-level validation errors in the UI.
 */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
):
  | { success: true; data: z.infer<S> }
  | { success: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  const flattened = parsed.error.flatten();
  return {
    success: false,
    result: {
      ok: false,
      error: "Validation failed. Please check the highlighted fields.",
      fieldErrors: flattened.fieldErrors as Record<string, string[]>,
    },
  };
}

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
