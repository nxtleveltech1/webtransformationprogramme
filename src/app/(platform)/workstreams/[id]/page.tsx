import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { formatOwnerDisplay, formatWorkstreamLead } from "@/lib/format-person";
import { getWorkstream } from "@/lib/services/workstreams";
import { getProgrammeOptions } from "@/lib/services/projects";
import { getPeopleOptions } from "@/lib/services/programme";
import { WorkstreamDetailClient, type WorkstreamDetail } from "./workstream-detail-client";

export const dynamic = "force-dynamic";

export default async function WorkstreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let workstream: Awaited<ReturnType<typeof getWorkstream>> = null;
  let people: { id: string; displayName: string }[] = [];
  let programmes: { id: string; name: string }[] = [];

  try {
    [workstream, people, programmes] = await Promise.all([
      getWorkstream(id),
      getPeopleOptions(),
      getProgrammeOptions(),
    ]);
  } catch {
    return <ErrorState description="This workstream could not be loaded. Please try again." />;
  }

  if (!workstream) notFound();

  const detail: WorkstreamDetail = {
    id: workstream.id,
    code: workstream.code,
    name: workstream.name,
    oneLineStatus: workstream.oneLineStatus,
    rag: workstream.rag,
    leadPersonId: workstream.leadPersonId,
    leadText: workstream.leadText,
    leadName: formatWorkstreamLead(workstream.leadText, workstream.leadPerson),
    programmeId: workstream.programmeId,
    programmeName: workstream.programme?.name ?? null,
    projects: workstream.projects.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      status: p.status,
      rag: p.rag,
      ownerName: formatOwnerDisplay(p.ownerText, p.ownerPerson),
    })),
    actions: workstream.actions.map((a) => ({
      id: a.id,
      externalId: a.externalId,
      description: a.description,
      priority: a.priority,
      status: a.status,
      ownerName: formatOwnerDisplay(a.ownerText, a.ownerPerson),
      dueDate: a.dueDate,
    })),
    risks: workstream.risks.map((r) => ({
      id: r.id,
      externalId: r.externalId,
      description: r.description,
      status: r.status,
      ownerName: formatOwnerDisplay(r.ownerText, r.ownerPerson),
    })),
    dependencies: workstream.dependencies.map((d) => ({
      id: d.id,
      externalId: d.externalId,
      description: d.description,
      status: d.status,
      requiredDate: d.requiredDate,
    })),
    milestones: workstream.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      targetDate: m.targetDate,
      status: m.status,
      varianceDays: m.varianceDays,
    })),
  };

  return (
    <ViewGuard entity="workstream" entityLabel="workstreams">
      <div className="space-y-4">
        <Link
          href="/workstreams"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          Back to workstreams
        </Link>
        <WorkstreamDetailClient
          workstream={detail}
          people={people.map((p) => ({ id: p.id, name: p.displayName }))}
          programmes={programmes}
        />
      </div>
    </ViewGuard>
  );
}
