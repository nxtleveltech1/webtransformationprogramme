import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getDependencies } from "@/lib/services/dependencies";
import { getRelatedLinksMap } from "@/lib/services/register-links";
import { DependenciesClient } from "./dependencies-client";

export const dynamic = "force-dynamic";

export default async function DependenciesPage() {
  try {
    const dependencies = await getDependencies();
    const linksMap = await getRelatedLinksMap(
      "DEPENDENCY",
      dependencies.map((d) => d.externalId),
    );
    return (
      <ViewGuard entity="dependency" entityLabel="the dependency register">
        <DependenciesClient dependencies={dependencies} linksMap={linksMap} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load dependencies"
        description="The dependency register could not be loaded. Please try again."
      />
    );
  }
}
