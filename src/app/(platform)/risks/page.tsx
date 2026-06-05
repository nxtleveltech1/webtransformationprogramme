import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getRisks } from "@/lib/services/risks";
import { getPeopleOptions } from "@/lib/services/registers";
import { RisksClient } from "./risks-client";

export const dynamic = "force-dynamic";

export default async function RisksPage() {
  try {
    const [risks, people] = await Promise.all([getRisks(), getPeopleOptions()]);
    return (
      <ViewGuard entity="risk" entityLabel="the risk register">
        <RisksClient risks={risks} people={people} />
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
