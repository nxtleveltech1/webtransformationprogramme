import {
  getResources,
  getResourceConstraints,
  summariseResources,
} from "@/lib/services/resources";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { ResourcesClient } from "./resources-client";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  let resources: Awaited<ReturnType<typeof getResources>> = [];
  let constraints: Awaited<ReturnType<typeof getResourceConstraints>> = [];
  let loadError = false;
  try {
    [resources, constraints] = await Promise.all([
      getResources(),
      getResourceConstraints(),
    ]);
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="resource" entityLabel="resources">
      {loadError ? (
        <ErrorState description="We couldn't load resources from the database." />
      ) : (
        <ResourcesClient
          resources={resources}
          summary={summariseResources(resources)}
          constraints={constraints}
        />
      )}
    </ViewGuard>
  );
}
