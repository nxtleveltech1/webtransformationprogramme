import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getScenarios, getScenarioTargets } from "@/lib/services/scenarios";
import { ScenariosClient } from "./scenarios-client";

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  let scenarios: Awaited<ReturnType<typeof getScenarios>> = [];
  let targets: Awaited<ReturnType<typeof getScenarioTargets>> = { tasks: [], milestones: [] };
  let loadError = false;

  try {
    [scenarios, targets] = await Promise.all([getScenarios(), getScenarioTargets()]);
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="scenario" entityLabel="schedule scenarios">
      <div className="space-y-6">
        <PageHeader
          title="Scenario / What-if Modelling"
          description="Model schedule changes against the live baseline and see the recomputed programme end date — without touching real task data."
        />
        {loadError ? (
          <ErrorState description="We couldn't load schedule scenarios. Please try again." />
        ) : (
          <ScenariosClient scenarios={scenarios} targets={targets} />
        )}
      </div>
    </ViewGuard>
  );
}
