import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import {
  getStakeholderDirectory,
  getStakeholderFormOptions,
} from "@/lib/services/stakeholder-directory";
import { StakeholderDirectoryClient } from "./stakeholder-directory-client";

export const dynamic = "force-dynamic";

export default async function StakeholderDirectoryPage() {
  let data: Awaited<ReturnType<typeof getStakeholderDirectory>> | null = null;
  let formOptions: Awaited<ReturnType<typeof getStakeholderFormOptions>> | null = null;

  try {
    [data, formOptions] = await Promise.all([
      getStakeholderDirectory({ activeOnly: true }),
      getStakeholderFormOptions(),
    ]);
  } catch {
    data = null;
    formOptions = null;
  }

  return (
    <ViewGuard entity="people" entityLabel="stakeholder directory">
      <div className="space-y-6">
        <PageHeader
          title="Stakeholder Directory"
          description="Programme phone book — filter by area, business, cluster, and role. Base reference for task allocation and governance."
        />
        {data && formOptions ? (
          <StakeholderDirectoryClient data={data} formOptions={formOptions} />
        ) : (
          <ErrorState description="We couldn't load the stakeholder directory. Please try again." />
        )}
      </div>
    </ViewGuard>
  );
}
