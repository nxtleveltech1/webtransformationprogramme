import { getSystemPlatforms, groupByCategory } from "@/lib/services/integrations";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { IntegrationsClient } from "./integrations-client";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  let platforms: Awaited<ReturnType<typeof getSystemPlatforms>> = [];
  let loadError = false;
  try {
    platforms = await getSystemPlatforms();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="integration" entityLabel="integrations">
      {loadError ? (
        <ErrorState description="We couldn't load the systems catalogue." />
      ) : (
        <IntegrationsClient groups={groupByCategory(platforms)} total={platforms.length} />
      )}
    </ViewGuard>
  );
}
