import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getSteeringPackData, type SteeringPackData } from "@/lib/export/steering-pack";
import { SteeringPackClient } from "./steering-pack-client";

export const dynamic = "force-dynamic";

export default async function SteeringPackPage() {
  let data: SteeringPackData | null = null;
  try {
    data = await getSteeringPackData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="report" entityLabel="the steering pack">
      <div className="space-y-6">
        <PageHeader
          title="Steering Pack"
          description="Branded, print-ready steering committee pack — executive summary, programme RAG, top risks, RAID, readiness and milestone delivery. Export to PDF or Excel."
        />
        {data ? (
          <SteeringPackClient data={data} />
        ) : (
          <ErrorState description="We couldn't assemble the steering pack. Please try again." />
        )}
      </div>
    </ViewGuard>
  );
}
