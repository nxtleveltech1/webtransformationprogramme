import { Flag } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listMilestones, getMilestoneFormOptions } from "@/lib/services/milestones";
import { MilestonesClient, type MilestoneRow } from "./milestones-client";

const MILESTONE_DONE = /complete|done|met|achieved|delivered|closed/i;
const MILESTONE_SLIP = /slip|delay|late|at[\s-]?risk|behind|blocked|red|overdue|miss/i;

function PiGateBand({ rows }: { rows: MilestoneRow[] }) {
  const groups = new Map<string, MilestoneRow[]>();
  for (const r of rows) {
    const key = r.piGate?.trim() || "Unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const ordered = Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === "Unassigned") return 1;
    if (b[0] === "Unassigned") return -1;
    return a[0].localeCompare(b[0], undefined, { numeric: true });
  });
  if (ordered.length <= 1 && ordered[0]?.[0] === "Unassigned") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="size-4" /> PI gates
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ordered.map(([gate, items]) => {
          const done = items.filter((m) => MILESTONE_DONE.test(m.status ?? "")).length;
          const slipping = items.filter(
            (m) => (m.varianceDays != null && m.varianceDays > 0) || MILESTONE_SLIP.test(m.status ?? ""),
          ).length;
          const pct = items.length ? Math.round((done / items.length) * 100) : 0;
          return (
            <div key={gate} className="bg-card rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">
                  {gate === "Unassigned" ? "No gate assigned" : `Gate ${gate}`}
                </p>
                <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
              </div>
              <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-rag-green h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                <span className="text-rag-green">{done} done</span>
                {slipping > 0 && <span className="text-rag-red">{slipping} slipping</span>}
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const dynamic = "force-dynamic";

export default async function MilestonesPage() {
  let milestones: Awaited<ReturnType<typeof listMilestones>> = [];
  let options: Awaited<ReturnType<typeof getMilestoneFormOptions>> = {
    workstreams: [],
    projects: [],
  };

  try {
    [milestones, options] = await Promise.all([listMilestones(), getMilestoneFormOptions()]);
  } catch {
    return <ErrorState description="Milestones could not be loaded. Please try again." />;
  }

  const rows: MilestoneRow[] = milestones.map((m) => ({
    id: m.id,
    title: m.title,
    targetDate: m.targetDate,
    piGate: m.piGate,
    status: m.status,
    varianceDays: m.varianceDays,
    notes: m.notes,
    workstreamId: m.workstreamId,
    workstreamLabel: m.workstream ? `${m.workstream.code} · ${m.workstream.name}` : null,
    projectId: m.projectId,
    projectLabel: m.project
      ? `${m.project.code ? `${m.project.code} · ` : ""}${m.project.name}`
      : null,
  }));

  return (
    <ViewGuard entity="milestone" entityLabel="milestones">
      <div className="space-y-6">
        <PageHeader
          title="Milestones"
          description="Delivery milestones with PI gates and schedule variance."
        />
        <PiGateBand rows={rows} />
        <MilestonesClient
          milestones={rows}
          workstreams={options.workstreams}
          projects={options.projects}
        />
      </div>
    </ViewGuard>
  );
}
