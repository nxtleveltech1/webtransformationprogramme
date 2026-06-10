import { AlertTriangle, CheckCircle2, PackageCheck, Route } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgrammeControlTable } from "@/components/shared/programme-control-table";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  DELIVERABLE_COLUMNS,
  getDeliverablesControlData,
} from "@/lib/services/programme-controls";

export const dynamic = "force-dynamic";

export default async function DeliverablesPage() {
  let data: Awaited<ReturnType<typeof getDeliverablesControlData>> | null = null;
  let loadError = false;
  try {
    data = await getDeliverablesControlData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="deliverable" entityLabel="deliverables">
      {loadError || !data ? (
        <ErrorState description="We couldn't load deliverables." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Deliverables Register"
            description="Programme deliverables with workstream ownership, dates, RAG, acceptance criteria, approval needs and evidence requirements."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Deliverables" value={data.summary.total} icon={PackageCheck} />
            <MetricCard label="At risk / watch" value={data.summary.atRisk} icon={AlertTriangle} tone="warning" />
            <MetricCard label="Complete" value={data.summary.complete} icon={CheckCircle2} tone="success" />
            <MetricCard label="Inferred" value={data.summary.inferred} icon={Route} tone="info" />
          </div>
          <ProgrammeControlTable
            rows={data.rows}
            columns={DELIVERABLE_COLUMNS}
            filename="deliverables-register"
            entity="deliverable"
            tableKey="deliverables"
            searchPlaceholder="Search deliverables, owners, workstreams..."
            emptyTitle="No deliverables"
            emptyDescription="Seed the delivery baseline to populate deliverables."
          />
        </div>
      )}
    </ViewGuard>
  );
}
