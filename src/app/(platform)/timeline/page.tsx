import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getTimelineData } from "@/lib/services/timeline";
import { TimelineClient, type TimelineItem } from "./timeline-client";

export const dynamic = "force-dynamic";

/**
 * The roadmap rows carry ad-hoc swimlane labels ("Hong Kong", "SEO Workshop",
 * ...) — mostly one row each. For the timeline we roll them up into the real
 * programme workstreams so the gantt/list group by the same 10 workstreams used
 * everywhere else, instead of 16 single-row lanes.
 */
const ROADMAP_WORKSTREAM: Record<string, string> = {
  "Scope Definition": "Programme / Delivery",
  "Resourcing": "Programme / Delivery",
  "Resource Roll-off": "Programme / Delivery",
  "Design Foundations": "Design & Content",
  "Design Systems": "Design System (OMDS)",
  "Execution / Engineering": "Execution / Engineering",
  "DevOps Quality Gates": "Execution / Engineering",
  "URL Audit": "Publishing",
  "Publishing": "Publishing",
  "Personal Section": "Publishing",
  "SEO Engagement": "SEO",
  "SEO Workshop": "SEO",
  "Hong Kong": "Regional / Country",
  "OMAR Engagement": "Regional / Country",
  "Audience Rollout": "Go-Live Readiness",
  "Go Live Readiness": "Go-Live Readiness",
  "Go-Live": "Go-Live Readiness",
};

export default async function TimelinePage() {
  let data: Awaited<ReturnType<typeof getTimelineData>> = {
    activities: [],
    criticalPath: [],
    milestones: [],
    tasks: [],
  };

  try {
    data = await getTimelineData();
  } catch {
    return <ErrorState description="The roadmap could not be loaded. Please try again." />;
  }

  // WBS tasks are the authoritative Gantt feed. Roadmap and critical-path rows
  // remain visible as supporting programme views.
  const items: TimelineItem[] = [
    ...data.tasks.map((task) => ({
      id: task.id,
      kind: "wbs" as const,
      title: `${task.externalId ?? "WBS"} ${task.title}`,
      workstream: task.workstream?.name ?? null,
      owner:
        [task.ownerPerson?.displayName, task.ownerPerson?.surname].filter(Boolean).join(" ").trim() ||
        task.ownerText,
      start: task.forecastStartDate ?? task.baselineStartDate,
      end: task.forecastEndDate ?? task.baselineEndDate,
      status: task.status,
      dependency: task.deliverable
        ? `${task.deliverable.externalId ?? "Deliverable"} ${task.deliverable.name}`
        : null,
      varianceDays: null,
      isCritical: task.criticalPath,
    })),
    ...data.activities.map((a) => ({
      id: a.id,
      kind: "activity" as const,
      title: a.activity,
      workstream: a.workstream
        ? (ROADMAP_WORKSTREAM[a.workstream] ?? a.workstream)
        : null,
      owner: a.ownerText,
      start: a.startDate,
      end: a.endDate,
      status: a.status,
      dependency: a.dependency,
      varianceDays: null,
      isCritical: false,
    })),
    ...data.criticalPath.map((c) => ({
      id: c.id,
      kind: "critical" as const,
      title: `${c.stepNumber}. ${c.activity}`,
      workstream: "Critical path",
      owner: c.ownerText,
      start: null,
      end: c.dueDate,
      status: c.status,
      dependency: c.predecessor,
      varianceDays: null,
      isCritical: c.isCritical,
    })),
  ];

  return (
    <ViewGuard entity="milestone" entityLabel="the timeline">
      <div className="space-y-6">
        <PageHeader
          title="Gantt & Roadmap"
          description="Seeded WBS tasks plotted as the programme Gantt, with roadmap and critical-path views retained for context."
        />
        <TimelineClient items={items} />
      </div>
    </ViewGuard>
  );
}
