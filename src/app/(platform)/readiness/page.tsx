import { Gauge, ShieldAlert, Target, ThumbsUp } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgrammeControlTable } from "@/components/shared/programme-control-table";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getReadinessControlData,
  READINESS_COLUMNS,
} from "@/lib/services/programme-controls";

export const dynamic = "force-dynamic";

export default async function ReadinessPage() {
  let data: Awaited<ReturnType<typeof getReadinessControlData>> | null = null;
  let loadError = false;
  try {
    data = await getReadinessControlData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="readinessGate" entityLabel="readiness gates">
      {loadError || !data ? (
        <ErrorState description="We couldn't load readiness gates." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Readiness / Go-No-Go"
            description="Launch readiness gates for technical, content, design, publishing, training, contact centre, communications, security, support and hypercare."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Readiness score" value={`${data.summary.score}%`} icon={Gauge} tone="warning" />
            <MetricCard label="Gates" value={data.summary.total} icon={Target} />
            <MetricCard label="Ready / approved" value={data.summary.ready} icon={ThumbsUp} tone="success" />
            <MetricCard label="Blocked" value={data.summary.blocked} icon={ShieldAlert} tone="danger" />
          </div>
          <ProgrammeControlTable
            rows={data.rows}
            columns={READINESS_COLUMNS}
            filename="readiness-go-no-go"
            entity="readinessGate"
            searchPlaceholder="Search gates, blockers, owners..."
            emptyTitle="No readiness gates"
            emptyDescription="Seed readiness controls to populate the go/no-go dashboard."
          />
        </div>
      )}
    </ViewGuard>
  );
}
