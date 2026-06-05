import { getGovernanceForums } from "@/lib/services/governance";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { GovernanceClient } from "./governance-client";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  let forums: Awaited<ReturnType<typeof getGovernanceForums>> = [];
  let loadError = false;
  try {
    forums = await getGovernanceForums();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="governance" entityLabel="governance">
      {loadError ? (
        <ErrorState description="We couldn't load governance forums." />
      ) : (
        <GovernanceClient forums={forums} />
      )}
    </ViewGuard>
  );
}
