"use client";

function fmt(n: number): string {
  return n.toLocaleString();
}

function share(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

const SEGMENTS = [
  {
    key: "moved" as const,
    label: "Migrated",
    bar: "bg-rag-green",
    dot: "bg-rag-green",
  },
  {
    key: "inScopeRemaining" as const,
    label: "In-scope remaining",
    bar: "bg-rag-amber",
    dot: "bg-rag-amber",
  },
  {
    key: "outOfScope" as const,
    label: "Out of scope",
    bar: "bg-muted-foreground/40",
    dot: "bg-muted-foreground/40",
  },
];

export function MigrationCompositionBar({
  moved,
  inScopeRemaining,
  outOfScope,
  totalPages,
}: {
  moved: number;
  inScopeRemaining: number;
  outOfScope: number;
  totalPages: number;
}) {
  const values: Record<string, number> = {
    moved,
    inScopeRemaining,
    outOfScope,
  };

  return (
    <div className="space-y-4">
      <div
        className="bg-muted flex h-5 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Migration composition of ${fmt(totalPages)} baseline pages`}
      >
        {SEGMENTS.map((seg) => {
          const value = values[seg.key];
          const width = share(value, totalPages);
          if (width <= 0) return null;
          return (
            <div
              key={seg.key}
              className={seg.bar}
              style={{ width: `${width}%` }}
              title={`${seg.label}: ${fmt(value)} pages (${width}%)`}
            />
          );
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {SEGMENTS.map((seg) => {
          const value = values[seg.key];
          const width = share(value, totalPages);
          return (
            <li
              key={seg.key}
              className="flex items-start gap-2.5 rounded-lg border p-3"
            >
              <span
                className={`mt-1 size-3 shrink-0 rounded-full ${seg.dot}`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium tracking-normal uppercase">
                  {seg.label}
                </p>
                <p className="text-foreground text-lg font-semibold tabular-nums">
                  {fmt(value)}
                  <span className="text-muted-foreground ml-1.5 text-sm font-normal">
                    {width}%
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
