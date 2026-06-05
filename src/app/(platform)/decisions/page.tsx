import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getDecisions } from "@/lib/services/decisions";
import { getPeopleOptions } from "@/lib/services/registers";
import { DecisionsClient } from "./decisions-client";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  try {
    const [decisions, people] = await Promise.all([
      getDecisions(),
      getPeopleOptions(),
    ]);
    return (
      <ViewGuard entity="decision" entityLabel="the decision log">
        <DecisionsClient decisions={decisions} people={people} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load decisions"
        description="The decision log could not be loaded. Please try again."
      />
    );
  }
}
