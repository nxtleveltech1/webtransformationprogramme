import { Grid3x3, AlertTriangle } from "lucide-react";

import { getRaciRows, RACI_COLUMNS, hasAccountable } from "@/lib/services/raci";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ExportButton } from "@/components/shared/export-button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LETTER_BADGE: Record<string, string> = {
  A: "bg-rag-green/15 text-rag-green",
  R: "bg-brand-heritage/15 text-brand-heritage",
  C: "bg-rag-amber/15 text-rag-amber",
  I: "bg-muted text-muted-foreground",
};

function isEmptyCell(value: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "-" || trimmed === "—";
}

function RaciCell({ value }: { value: string | null }) {
  if (isEmptyCell(value)) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  const tokens = value!
    .split(/[/,\s|&+]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tokens.map((token, i) => {
        const letter = token.charAt(0).toUpperCase();
        const badge = LETTER_BADGE[letter];
        return (
          <span
            key={`${token}-${i}`}
            className={cn(
              "inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold",
              badge ?? "bg-muted text-muted-foreground",
            )}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}

export default async function RaciPage() {
  let data: Awaited<ReturnType<typeof getRaciRows>> | null = null;
  let loadError = false;
  try {
    data = await getRaciRows();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="governance" entityLabel="the RACI matrix">
      {loadError || !data ? (
        <ErrorState description="We couldn't load the RACI matrix." />
      ) : data.rows.length === 0 ? (
        <EmptyState
          title="No RACI matrix defined"
          description="RACI rows have not been seeded yet."
        />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="RACI Matrix"
            description="Responsibility assignment across delivery functions, with ownership-gap flags."
            actions={
              <ExportButton
                rows={data.rows.map((row) => ({
                  area: row.area,
                  programme: row.programme ?? "",
                  product: row.product ?? "",
                  design: row.design ?? "",
                  execution: row.execution ?? "",
                  publishing: row.publishing ?? "",
                  crossChannels: row.crossChannels ?? "",
                  seo: row.seo ?? "",
                  regional: row.regional ?? "",
                  accountableOwner: hasAccountable(row) ? "Yes" : "No",
                  notes: row.notes ?? "",
                }))}
                filename="raci"
                entity="governance"
              />
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Areas"
              value={data.summary.total}
              icon={Grid3x3}
              hint="Delivery areas mapped"
            />
            <MetricCard
              label="Ownership gaps"
              value={data.summary.withGap}
              icon={AlertTriangle}
              tone={data.summary.withGap > 0 ? "danger" : "success"}
              hint={
                data.summary.withGap > 0
                  ? "Rows with no Accountable owner"
                  : "Every area has an owner"
              }
            />
          </div>

          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="bg-card sticky left-0 z-10 px-4 py-3 text-left text-xs font-medium tracking-normal text-muted-foreground uppercase">
                      Area
                    </th>
                    {RACI_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium tracking-normal text-muted-foreground uppercase whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => {
                    const gap = !hasAccountable(row);
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b last:border-0 transition-colors",
                          gap ? "bg-rag-red/5 hover:bg-rag-red/10" : "hover:bg-muted/40",
                        )}
                      >
                        <td
                          className={cn(
                            "sticky left-0 z-10 px-4 py-3 align-top font-medium",
                            gap ? "bg-rag-red/5" : "bg-card",
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <span>{row.area}</span>
                            {gap && (
                              <span className="bg-rag-red/10 text-rag-red inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                                <AlertTriangle className="size-3" />
                                No owner
                              </span>
                            )}
                          </div>
                        </td>
                        {RACI_COLUMNS.map((col) => (
                          <td key={col.key} className="px-4 py-3 align-top">
                            <RaciCell value={row[col.key] as string | null} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </ViewGuard>
  );
}
