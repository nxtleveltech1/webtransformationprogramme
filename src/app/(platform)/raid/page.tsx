import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getRaidData } from "@/lib/services/raid";
import { RaidClient } from "./raid-client";

export const dynamic = "force-dynamic";

export default async function RaidPage() {
  try {
    const data = await getRaidData();
    return (
      <ViewGuard entity="risk" entityLabel="the RAID dashboard">
        <RaidClient data={data} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load RAID dashboard"
        description="The RAID dashboard could not be loaded. Please try again."
      />
    );
  }
}
