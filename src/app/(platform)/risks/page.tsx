import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getRisks } from "@/lib/services/risks";
import { getPeopleOptions } from "@/lib/services/registers";
import { getRelatedLinksMap } from "@/lib/services/register-links";
import { RisksClient } from "./risks-client";

export const dynamic = "force-dynamic";

export default async function RisksPage() {
  try {
    const [risks, people] = await Promise.all([getRisks(), getPeopleOptions()]);
    const linksMap = await getRelatedLinksMap(
      "RISK",
      risks.map((r) => r.externalId),
    );
    return (
      <ViewGuard entity="risk" entityLabel="the risk register">
        <RisksClient risks={risks} people={people} linksMap={linksMap} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load risks"
        description="The risk register could not be loaded. Please try again."
      />
    );
  }
}
