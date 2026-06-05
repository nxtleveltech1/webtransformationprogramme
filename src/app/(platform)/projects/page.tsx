import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  listProjects,
  getProgrammeOptions,
  getWorkstreamOptions,
} from "@/lib/services/projects";
import { getPeopleOptions } from "@/lib/services/programme";
import { ProjectsClient, type ProjectRow } from "./projects-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  let people: { id: string; displayName: string }[] = [];
  let workstreams: { id: string; code: string; name: string }[] = [];
  let programmes: { id: string; name: string }[] = [];

  try {
    [projects, people, workstreams, programmes] = await Promise.all([
      listProjects(),
      getPeopleOptions(),
      getWorkstreamOptions(),
      getProgrammeOptions(),
    ]);
  } catch {
    return <ErrorState description="Projects could not be loaded. Please try again." />;
  }

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    status: p.status,
    priority: p.priority,
    rag: p.rag,
    ownerPersonId: p.ownerPersonId,
    ownerName: p.ownerPerson?.displayName ?? null,
    ownerText: p.ownerText,
    sponsor: p.sponsor,
    startDate: p.startDate,
    endDate: p.endDate,
    budgetNote: p.budgetNote,
    workstreamId: p.workstreamId,
    workstreamCode: p.workstream?.code ?? null,
    programmeId: p.programmeId,
  }));

  return (
    <ViewGuard entity="project" entityLabel="projects">
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Delivery projects across the programme, derived from workstreams."
        />
        <ProjectsClient
          projects={rows}
          people={people.map((p) => ({ id: p.id, name: p.displayName }))}
          workstreams={workstreams}
          programmes={programmes}
        />
      </div>
    </ViewGuard>
  );
}
