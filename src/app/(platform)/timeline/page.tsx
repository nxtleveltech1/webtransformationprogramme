import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getTimelineData } from "@/lib/services/timeline";
import { getPeopleOptions } from "@/lib/services/tasks";
import { getMilestoneFormOptions } from "@/lib/services/milestones";
import { TimelineClient, type TimelineItem } from "./timeline-client";
import type { ScheduleEditData, ScheduleEditOptions } from "./types";

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

  let options: ScheduleEditOptions = { people: [], workstreams: [], projects: [] };

  try {
    const [timeline, people, formOptions] = await Promise.all([
      getTimelineData(),
      getPeopleOptions(),
      getMilestoneFormOptions(),
    ]);
    data = timeline;
    options = {
      people,
      workstreams: formOptions.workstreams,
      projects: formOptions.projects,
    };
  } catch {
    return <ErrorState description="The roadmap could not be loaded. Please try again." />;
  }

  // Full editable records keyed by id, used by the on-Gantt edit drawers.
  const editData: ScheduleEditData = {
    wbs: Object.fromEntries(
      data.tasks.map((t) => [
        t.id,
        {
          id: t.id,
          externalId: t.externalId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          rag: t.rag,
          percentComplete: t.percentComplete,
          baselineStartDate: t.baselineStartDate,
          baselineEndDate: t.baselineEndDate,
          forecastStartDate: t.forecastStartDate,
          forecastEndDate: t.forecastEndDate,
          durationDays: t.durationDays,
          ownerPersonId: t.ownerPersonId,
          ownerText: t.ownerText,
          workstreamId: t.workstreamId,
          blockers: t.blockers,
          acceptanceCriteria: t.acceptanceCriteria,
          criticalPath: t.criticalPath,
        },
      ]),
    ),
    milestone: Object.fromEntries(
      data.milestones.map((m) => [
        m.id,
        {
          id: m.id,
          title: m.title,
          targetDate: m.targetDate,
          piGate: m.piGate,
          status: m.status,
          varianceDays: m.varianceDays,
          notes: m.notes,
          workstreamId: m.workstreamId,
          projectId: m.projectId,
        },
      ]),
    ),
    critical: Object.fromEntries(
      data.criticalPath.map((c) => [
        c.id,
        {
          id: c.id,
          stepNumber: c.stepNumber,
          activity: c.activity,
          ownerText: c.ownerText,
          predecessor: c.predecessor,
          dueDate: c.dueDate,
          status: c.status,
          isCritical: c.isCritical,
        },
      ]),
    ),
    activity: Object.fromEntries(
      data.activities.map((a) => [
        a.id,
        {
          id: a.id,
          workstream: a.workstream,
          activity: a.activity,
          ownerText: a.ownerText,
          startDate: a.startDate,
          endDate: a.endDate,
          dependency: a.dependency,
          status: a.status,
          notes: a.notes,
        },
      ]),
    ),
  };

  // WBS tasks are the authoritative Gantt feed. Roadmap and critical-path rows
  // remain visible as supporting programme views.
  const items: TimelineItem[] = [
    ...data.tasks.map((task) => ({
      id: task.id,
      kind: "wbs" as const,
      code: task.externalId ?? null,
      title: task.title,
      workstream: task.workstream?.name ?? null,
      owner:
        [task.ownerPerson?.displayName, task.ownerPerson?.surname].filter(Boolean).join(" ").trim() ||
        task.ownerText,
      start: task.forecastStartDate ?? task.baselineStartDate,
      end: task.forecastEndDate ?? task.baselineEndDate,
      baselineStart: task.baselineStartDate,
      baselineEnd: task.baselineEndDate,
      status: task.status,
      dependency: task.deliverable
        ? `${task.deliverable.externalId ?? "Deliverable"} ${task.deliverable.name}`
        : null,
      varianceDays: null,
      isCritical: task.criticalPath,
    })),
    ...data.milestones.map((m) => ({
      id: m.id,
      kind: "milestone" as const,
      code: null,
      title: m.piGate ? `${m.title} (${m.piGate})` : m.title,
      workstream: m.workstream?.name ?? m.project?.name ?? null,
      owner: null,
      // targetDate is the agreed baseline; the forecast position is derived from
      // the baseline shifted by the recorded variance (computed in the Gantt).
      start: null,
      end: m.targetDate,
      baselineStart: null,
      baselineEnd: m.targetDate,
      status: m.status,
      dependency: null,
      varianceDays: m.varianceDays,
      isCritical: false,
    })),
    ...data.activities.map((a) => ({
      id: a.id,
      kind: "activity" as const,
      code: null,
      title: a.activity,
      workstream: a.workstream
        ? (ROADMAP_WORKSTREAM[a.workstream] ?? a.workstream)
        : null,
      owner: a.ownerText,
      start: a.startDate,
      end: a.endDate,
      baselineStart: null,
      baselineEnd: null,
      status: a.status,
      dependency: a.dependency,
      varianceDays: null,
      isCritical: false,
    })),
    ...data.criticalPath.map((c) => ({
      id: c.id,
      kind: "critical" as const,
      code: null,
      title: `${c.stepNumber}. ${c.activity}`,
      workstream: "Critical path",
      owner: c.ownerText,
      start: null,
      end: c.dueDate,
      baselineStart: null,
      baselineEnd: null,
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
        <TimelineClient items={items} editData={editData} editOptions={options} />
      </div>
    </ViewGuard>
  );
}
