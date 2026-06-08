import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getParkingLot } from "@/lib/services/parking-lot";
import { getRelatedLinksMap } from "@/lib/services/register-links";
import { ParkingLotClient } from "./parking-lot-client";

export const dynamic = "force-dynamic";

export default async function ParkingLotPage() {
  try {
    const items = await getParkingLot();
    const linksMap = await getRelatedLinksMap(
      "PARKING_LOT",
      items.map((i) => i.externalId),
    );
    return (
      <ViewGuard entity="parkingLot" entityLabel="the parking lot">
        <ParkingLotClient items={items} linksMap={linksMap} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load parking lot"
        description="The parking lot could not be loaded. Please try again."
      />
    );
  }
}
