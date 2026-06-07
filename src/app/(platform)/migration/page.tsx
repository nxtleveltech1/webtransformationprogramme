import { Files, CheckCircle2, Clock, Archive } from "lucide-react";
import { PageTreatment } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportButton } from "@/components/shared/export-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getMigrationData,
  pageCount,
  type MigrationData,
} from "@/lib/services/migration";
import { MigrationCompositionBar } from "./migration-client";

export const dynamic = "force-dynamic";

const TREATMENT_LABEL: Record<PageTreatment, string> = {
  AS_IS: "As-is",
  NEW_TEMPLATE: "New template",
  RESTYLE: "Restyle",
  CONSOLIDATE: "Consolidate",
  RETIRE: "Retire",
};

const TREATMENT_BADGE: Record<PageTreatment, string> = {
  AS_IS: "bg-muted text-muted-foreground border-transparent",
  NEW_TEMPLATE: "bg-rag-green/10 text-rag-green border-rag-green/30",
  RESTYLE: "bg-brand-future/15 text-brand-heritage border-brand-heritage/30",
  CONSOLIDATE: "bg-rag-amber/10 text-rag-amber border-rag-amber/30",
  RETIRE: "bg-muted-foreground/15 text-muted-foreground border-transparent",
};

function humanizeTreatment(treatment: PageTreatment | null): string {
  return treatment ? TREATMENT_LABEL[treatment] : "—";
}

function share(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

const fmt = (n: number) => n.toLocaleString();

export default async function MigrationPage() {
  let data: MigrationData | null = null;
  try {
    data = await getMigrationData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="report" entityLabel="the migration tracker">
      <div className="space-y-6">
        <PageHeader
          title="Migration Tracker"
          description="Page-migration baseline, in-flight and out-of-scope composition across the site inventory."
          actions={
            data && data.items.length > 0 ? (
              <ExportButton
                rows={data.items.map((item) => ({
                  section: item.url ?? "",
                  treatment: humanizeTreatment(item.treatment),
                  owner: item.ownerName ?? "",
                  pages: pageCount(item),
                  status: item.status ?? "",
                  notes: item.notes ?? "",
                }))}
                filename="migration"
                entity="report"
              />
            ) : undefined
          }
        />

        {!data ? (
          <ErrorState description="We couldn't load migration data. Please try again." />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No migration data"
            description="Page migration items have not been seeded yet."
          />
        ) : (
          <MigrationContent data={data} />
        )}
      </div>
    </ViewGuard>
  );
}

function MigrationContent({ data }: { data: MigrationData }) {
  const {
    items,
    totalPages,
    moved,
    inScopeRemaining,
    outOfScope,
    movedPct,
    byTreatment,
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Baseline pages"
          value={fmt(totalPages)}
          icon={Files}
          tone="default"
          hint="Total inventory in scope of assessment"
        />
        <MetricCard
          label="Migrated"
          value={fmt(moved)}
          icon={CheckCircle2}
          tone="success"
          hint={`${movedPct}% of baseline`}
        />
        <MetricCard
          label="In-scope remaining"
          value={fmt(inScopeRemaining)}
          icon={Clock}
          tone="warning"
          hint="Awaiting migration or in flight"
        />
        <MetricCard
          label="Out of scope"
          value={fmt(outOfScope)}
          icon={Archive}
          tone="default"
          hint="Consolidate, retire or excluded"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration composition</CardTitle>
          <CardDescription>
            Lifecycle split of the {fmt(totalPages)} baseline pages across migrated,
            in-scope remaining and out-of-scope buckets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MigrationCompositionBar
            moved={moved}
            inScopeRemaining={inScopeRemaining}
            outOfScope={outOfScope}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown by treatment</CardTitle>
          <CardDescription>
            Page volume and item count grouped by the planned migration treatment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs tracking-normal uppercase">
                  <th className="px-3 py-2 font-medium">Treatment</th>
                  <th className="px-3 py-2 text-right font-medium">Items</th>
                  <th className="px-3 py-2 text-right font-medium">Pages</th>
                  <th className="px-3 py-2 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {byTreatment.map((row) => {
                  const pct = share(row.pages, totalPages);
                  return (
                    <tr key={row.treatment} className="border-b last:border-0">
                      <td className="px-3 py-2.5">
                        <Badge
                          className={cn(TREATMENT_BADGE[row.treatment])}
                        >
                          {humanizeTreatment(row.treatment)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {fmt(row.items)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {fmt(row.pages)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted h-2 w-full max-w-40 overflow-hidden rounded-full">
                            <div
                              className="bg-brand-fresh h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory detail</CardTitle>
          <CardDescription>
            Section-level migration items across the site inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs tracking-normal uppercase">
                  <th className="px-3 py-2 font-medium">Section</th>
                  <th className="px-3 py-2 font-medium">Treatment</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 text-right font-medium">Pages</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="text-foreground px-3 py-2.5 font-medium">
                      {item.url ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {item.treatment ? (
                        <Badge
                          className={cn(TREATMENT_BADGE[item.treatment])}
                        >
                          {humanizeTreatment(item.treatment)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5">
                      {item.ownerName ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {fmt(pageCount(item))}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
