import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { getGlossaryData } from "@/lib/services/glossary";
import { GlossaryClient } from "./glossary-client";

export const dynamic = "force-dynamic";

export default async function GlossaryPage() {
  let data: Awaited<ReturnType<typeof getGlossaryData>> | null = null;
  try {
    data = await getGlossaryData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="glossary" entityLabel="glossary">
      <div className="space-y-6">
        <PageHeader
          title="Glossary & Definitions"
          description="Shared definitions for programme terms, acronyms, systems, processes, and geographies referenced across the workshop pack."
        />
        {data ? (
          <GlossaryClient data={data} />
        ) : (
          <ErrorState description="We couldn't load the glossary. Please try again." />
        )}
      </div>
    </ViewGuard>
  );
}
