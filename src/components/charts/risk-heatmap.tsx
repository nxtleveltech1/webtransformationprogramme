"use client";

import { cn } from "@/lib/utils";
import { LEVEL_WEIGHT } from "@/lib/enums";
import { ChartEmpty } from "@/components/charts/chart-empty";

export interface RiskHeatmapDatum {
  probability: string;
  impact: string;
}

const LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;
type Level = (typeof LEVELS)[number];

function cellTone(score: number): string {
  if (score >= 6) return "bg-rag-red/15 text-rag-red border-rag-red/30";
  if (score >= 3) return "bg-rag-amber/15 text-rag-amber border-rag-amber/30";
  if (score >= 1) return "bg-rag-green/15 text-rag-green border-rag-green/30";
  return "bg-muted text-muted-foreground border-border";
}

/**
 * Probability x Impact risk heatmap. Counts are computed from the supplied
 * risks; UNKNOWN probability/impact values are surfaced separately so they are
 * not silently dropped.
 */
export function RiskHeatmap({
  risks,
  className,
}: {
  risks: RiskHeatmapDatum[];
  className?: string;
}) {
  if (!risks.length) {
    return <ChartEmpty message="No risks to plot" className={className} />;
  }

  const counts = new Map<string, number>();
  let unscored = 0;
  for (const r of risks) {
    const p = r.probability?.toUpperCase();
    const i = r.impact?.toUpperCase();
    if (!LEVELS.includes(p as Level) || !LEVELS.includes(i as Level)) {
      unscored += 1;
      continue;
    }
    const key = `${p}|${i}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5 text-center text-xs">
        <div aria-hidden />
        {LEVELS.map((p) => (
          <div key={p} className="text-muted-foreground pb-1 font-medium capitalize">
            {p.toLowerCase()}
          </div>
        ))}

        {LEVELS.map((impact) => (
          <FragmentRow key={impact} impact={impact} counts={counts} />
        ))}
      </div>
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          Rows: impact &middot; Columns: probability
        </span>
        {unscored > 0 && <span>{unscored} unscored</span>}
      </div>
    </div>
  );
}

function FragmentRow({
  impact,
  counts,
}: {
  impact: Level;
  counts: Map<string, number>;
}) {
  return (
    <>
      <div className="text-muted-foreground flex items-center justify-end pr-2 font-medium capitalize">
        {impact.toLowerCase()}
      </div>
      {LEVELS.map((prob) => {
        const count = counts.get(`${prob}|${impact}`) ?? 0;
        const score = (LEVEL_WEIGHT[prob] ?? 0) * (LEVEL_WEIGHT[impact] ?? 0);
        return (
          <div
            key={prob}
            className={cn(
              "flex aspect-square min-h-[44px] flex-col items-center justify-center rounded-md border",
              cellTone(count > 0 ? score : 0),
            )}
            title={`Probability ${prob.toLowerCase()} / impact ${impact.toLowerCase()}: ${count} risk(s)`}
          >
            <span className="text-base font-semibold tabular-nums">{count}</span>
          </div>
        );
      })}
    </>
  );
}
