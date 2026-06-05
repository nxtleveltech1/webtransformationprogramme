import { prisma } from "@/lib/db";

const DONE_RE = /complete|done|met|achieved|delivered/i;
const SLIP_RE = /slip|delay|late|at[\s-]?risk|behind|blocked|red|overdue/i;

/**
 * Loads the ordered critical-path steps that gate programme delivery, plus
 * summary counts used for the KPI tiles. All date columns are free-text in the
 * schema, so no parsing happens here.
 */
export async function getCriticalPath() {
  const steps = await prisma.criticalPathStep.findMany({
    orderBy: { stepNumber: "asc" },
  });

  const summary = {
    total: steps.length,
    critical: steps.filter((s) => s.isCritical).length,
    completed: steps.filter((s) => DONE_RE.test(s.status ?? "")).length,
    slipping: steps.filter((s) => SLIP_RE.test(s.status ?? "")).length,
  };

  return { steps, summary };
}

/** Returns true when a step's status indicates slippage / risk. */
export function isSlipping(status: string | null | undefined): boolean {
  return SLIP_RE.test(status ?? "");
}
