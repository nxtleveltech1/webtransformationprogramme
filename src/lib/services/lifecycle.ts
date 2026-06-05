import { prisma } from "@/lib/db";

/**
 * Loads the delivery process pipeline (ProcessWorkflow) and design-system
 * component readiness (ComponentTemplate) for the delivery lifecycle view.
 */
export async function getLifecycleData() {
  const [workflows, components] = await Promise.all([
    prisma.processWorkflow.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.componentTemplate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { workflows, components };
}

/**
 * Splits a serialised pipeline string into ordered, trimmed steps.
 * Accepts both "→" and "->" separators (with optional surrounding spaces).
 */
export function splitSteps(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\s*→\s*|\s*->\s*/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0);
}
