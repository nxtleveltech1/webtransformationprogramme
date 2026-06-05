import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getReportsData, type ReportsData } from "@/lib/services/reports";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let data: ReportsData | null = null;
  try {
    data = await getReportsData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="report" entityLabel="reports & analytics">
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Cross-programme reporting for steering committee, RAID governance, and resourcing — filter, visualise, and export."
        />
        {data ? (
          <ReportsClient data={data} />
        ) : (
          <ErrorState description="We couldn't load reporting data. Please try again." />
        )}
      </div>
    </ViewGuard>
  );
}
