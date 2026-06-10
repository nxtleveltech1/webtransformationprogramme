import { GitBranch, ListChecks, ShieldAlert, Workflow } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgrammeControlTable } from "@/components/shared/programme-control-table";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getWbsControlData, WBS_COLUMNS } from "@/lib/services/programme-controls";

export const dynamic = "force-dynamic";

export default async function WbsPage() {
  let data: Awaited<ReturnType<typeof getWbsControlData>> | null = null;
  let loadError = false;
  try {
    data = await getWbsControlData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="wbs" entityLabel="WBS">
      {loadError || !data ? (
        <ErrorState description="We couldn't load the WBS baseline." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="WBS Baseline"
            description="Full programme work breakdown across phases, workstreams, deliverables, critical-path tasks, owners, dates, RAG and evidence confidence. The visual Gantt is available in Gantt / Roadmap."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="WBS tasks" value={data.summary.total} icon={Workflow} />
            <MetricCard label="Critical path" value={data.summary.critical} icon={GitBranch} tone="warning" />
            <MetricCard label="Blocked" value={data.summary.blocked} icon={ShieldAlert} tone="danger" />
            <MetricCard label="Inferred controls" value={data.summary.inferred} icon={ListChecks} tone="info" />
          </div>
          <ProgrammeControlTable
            rows={data.rows}
            columns={WBS_COLUMNS}
            filename="wbs-gantt-baseline"
            entity="wbs"
            tableKey="wbs"
            searchPlaceholder="Search WBS tasks, owners, phases..."
            emptyTitle="No WBS tasks"
            emptyDescription="Seed the programme controls to populate the WBS baseline."
          />
        </div>
      )}
    </ViewGuard>
  );
}
