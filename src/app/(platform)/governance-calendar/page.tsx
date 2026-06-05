import { CalendarClock, CheckSquare, HeartPulse, Landmark } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgrammeControlTable } from "@/components/shared/programme-control-table";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getGovernanceCalendarControlData,
  GOVERNANCE_CALENDAR_COLUMNS,
} from "@/lib/services/programme-controls";

export const dynamic = "force-dynamic";

export default async function GovernanceCalendarPage() {
  let data: Awaited<ReturnType<typeof getGovernanceCalendarControlData>> | null = null;
  let loadError = false;
  try {
    data = await getGovernanceCalendarControlData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="governanceMeeting" entityLabel="governance calendar">
      {loadError || !data ? (
        <ErrorState description="We couldn't load governance calendar events." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Governance Calendar"
            description="Steering committees, planning check-ins, playbacks, SME workshops, sign-offs, go/no-go forums, hypercare stand-ups and workstream checkpoints."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Governance events" value={data.summary.total} icon={CalendarClock} />
            <MetricCard label="Go/no-go forums" value={data.summary.goNoGo} icon={CheckSquare} tone="warning" />
            <MetricCard label="Hypercare cadence" value={data.summary.hypercare} icon={HeartPulse} tone="info" />
            <MetricCard label="Inferred" value={data.summary.inferred} icon={Landmark} tone="warning" />
          </div>
          <ProgrammeControlTable
            rows={data.rows}
            columns={GOVERNANCE_CALENDAR_COLUMNS}
            filename="governance-calendar"
            entity="governanceMeeting"
            searchPlaceholder="Search governance forums, cadence, owners..."
            emptyTitle="No governance events"
            emptyDescription="Seed governance meetings to populate the calendar."
          />
        </div>
      )}
    </ViewGuard>
  );
}
