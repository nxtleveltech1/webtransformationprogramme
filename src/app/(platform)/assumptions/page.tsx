import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getAssumptions } from "@/lib/services/assumptions";
import { getPeopleOptions } from "@/lib/services/registers";
import { getRelatedLinksMap } from "@/lib/services/register-links";
import { AssumptionsClient } from "./assumptions-client";

export const dynamic = "force-dynamic";

export default async function AssumptionsPage() {
  try {
    const [assumptions, people] = await Promise.all([
      getAssumptions(),
      getPeopleOptions(),
    ]);
    const linksMap = await getRelatedLinksMap(
      "ASSUMPTION",
      assumptions.map((a) => a.externalId),
    );
    return (
      <ViewGuard entity="assumption" entityLabel="the assumptions log">
        <AssumptionsClient assumptions={assumptions} people={people} linksMap={linksMap} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load assumptions"
        description="The assumptions log could not be loaded. Please try again."
      />
    );
  }
}
