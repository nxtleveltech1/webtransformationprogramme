import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { formatWorkstreamLead } from "@/lib/format-person";
import { listWorkstreams } from "@/lib/services/workstreams";
import { getProgrammeOptions } from "@/lib/services/projects";
import { getPeopleOptions } from "@/lib/services/programme";
import { WorkstreamsClient, type WorkstreamRow } from "./workstreams-client";

export const dynamic = "force-dynamic";

export default async function WorkstreamsPage() {
  let workstreams: Awaited<ReturnType<typeof listWorkstreams>> = [];
  let people: { id: string; displayName: string }[] = [];
  let programmes: { id: string; name: string }[] = [];

  try {
    [workstreams, people, programmes] = await Promise.all([
      listWorkstreams(),
      getPeopleOptions(),
      getProgrammeOptions(),
    ]);
  } catch {
    return <ErrorState description="Workstreams could not be loaded. Please try again." />;
  }

  const rows: WorkstreamRow[] = workstreams.map((w) => ({
    id: w.id,
    code: w.code,
    name: w.name,
    oneLineStatus: w.oneLineStatus,
    rag: w.rag,
    leadPersonId: w.leadPersonId,
    leadName: formatWorkstreamLead(w.leadText, w.leadPerson),
    programmeId: w.programmeId,
    projects: w._count.projects,
    actions: w._count.actions,
    risks: w._count.risks,
    dependencies: w._count.dependencies,
    milestones: w._count.milestones,
  }));

  return (
    <ViewGuard entity="workstream" entityLabel="workstreams">
      <div className="space-y-6">
        <PageHeader
          title="Workstreams"
          description="Delivery workstreams, their leads and current status."
        />
        <WorkstreamsClient
          workstreams={rows}
          people={people.map((p) => ({ id: p.id, name: p.displayName }))}
          programmes={programmes}
        />
      </div>
    </ViewGuard>
  );
}
