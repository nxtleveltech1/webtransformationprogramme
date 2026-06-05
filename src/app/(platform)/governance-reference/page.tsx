import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { getGovernanceReferenceData } from "@/lib/services/governance-reference";
import { GovernanceReferenceClient } from "./governance-reference-client";

export const dynamic = "force-dynamic";

export default async function GovernanceReferencePage() {
  let data: Awaited<ReturnType<typeof getGovernanceReferenceData>> | null = null;
  try {
    data = await getGovernanceReferenceData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="governance" entityLabel="governance reference">
      <div className="space-y-6">
        <PageHeader
          title="Governance Reference"
          description="Terms of Reference, glossary, and reference mappings — common definitions for programme concepts and data fields."
        />
        {data ? (
          <GovernanceReferenceClient data={data} />
        ) : (
          <ErrorState description="We couldn't load governance reference data. Please try again." />
        )}
      </div>
    </ViewGuard>
  );
}
