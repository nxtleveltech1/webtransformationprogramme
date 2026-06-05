import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getProject,
  getProjectActivity,
  getProgrammeOptions,
  getWorkstreamOptions,
} from "@/lib/services/projects";
import { getPeopleOptions } from "@/lib/services/programme";
import { ProjectDetailClient, type ProjectDetail } from "./project-detail-client";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project: Awaited<ReturnType<typeof getProject>> = null;
  let activity: Awaited<ReturnType<typeof getProjectActivity>> = [];
  let people: { id: string; displayName: string }[] = [];
  let workstreams: { id: string; code: string; name: string }[] = [];
  let programmes: { id: string; name: string }[] = [];

  try {
    [project, activity, people, workstreams, programmes] = await Promise.all([
      getProject(id),
      getProjectActivity(id),
      getPeopleOptions(),
      getWorkstreamOptions(),
      getProgrammeOptions(),
    ]);
  } catch {
    return <ErrorState description="This project could not be loaded. Please try again." />;
  }

  if (!project) notFound();

  const detail: ProjectDetail = {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    rag: project.rag,
    ownerPersonId: project.ownerPersonId,
    ownerName: project.ownerPerson?.displayName ?? null,
    ownerText: project.ownerText,
    sponsor: project.sponsor,
    startDate: project.startDate,
    endDate: project.endDate,
    budgetNote: project.budgetNote,
    workstreamId: project.workstreamId,
    workstreamCode: project.workstream?.code ?? null,
    workstreamName: project.workstream?.name ?? null,
    programmeId: project.programmeId,
    programmeName: project.programme?.name ?? null,
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      targetDate: m.targetDate,
      piGate: m.piGate,
      status: m.status,
      varianceDays: m.varianceDays,
    })),
    deliverables: project.deliverables.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      dueDate: d.dueDate,
      ownerName: d.ownerPerson?.displayName ?? d.ownerText ?? null,
    })),
    actions: project.actions.map((a) => ({
      id: a.id,
      externalId: a.externalId,
      description: a.description,
      priority: a.priority,
      status: a.status,
      ownerName: a.ownerPerson?.displayName ?? a.ownerText ?? null,
      dueDate: a.dueDate,
    })),
    risks: project.risks.map((r) => ({
      id: r.id,
      externalId: r.externalId,
      description: r.description,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      status: r.status,
      ownerName: r.ownerPerson?.displayName ?? r.ownerText ?? null,
    })),
    issues: project.issues.map((i) => ({
      id: i.id,
      externalId: i.externalId,
      description: i.description,
      status: i.status,
      currentImpact: i.currentImpact,
      ownerName: i.ownerPerson?.displayName ?? i.ownerText ?? null,
    })),
    dependencies: project.dependencies.map((d) => ({
      id: d.id,
      externalId: d.externalId,
      description: d.description,
      status: d.status,
      requiredDate: d.requiredDate,
      providingTeam: d.providingTeam,
      receivingTeam: d.receivingTeam,
    })),
    documents: project.documents.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      version: d.version,
      ownerName: d.ownerPerson?.displayName ?? d.ownerText ?? null,
      updatedAt: d.updatedAt.toISOString(),
    })),
  };

  const activityRows = activity.map((a) => ({
    id: a.id,
    action: a.action,
    actorName: a.actorName,
    actorRole: a.actorRole,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <ViewGuard entity="project" entityLabel="projects">
      <div className="space-y-4">
        <Link
          href="/projects"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          Back to projects
        </Link>
        <ProjectDetailClient
          project={detail}
          activity={activityRows}
          people={people.map((p) => ({ id: p.id, name: p.displayName }))}
          workstreams={workstreams}
          programmes={programmes}
        />
      </div>
    </ViewGuard>
  );
}
