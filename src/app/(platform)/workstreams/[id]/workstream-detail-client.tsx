"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/states";
import { Can } from "@/components/shared/can";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { deleteWorkstream } from "@/server/actions/workstreams";
import {
  WorkstreamFormDialog,
  type Option,
  type WorkstreamFormValues,
} from "../workstream-form";

interface ProjectLite {
  id: string;
  code: string | null;
  name: string;
  status: string;
  rag: "RED" | "AMBER" | "GREEN" | null;
  ownerName: string | null;
}
interface ActionLite {
  id: string;
  externalId: string;
  description: string;
  priority: string;
  status: string;
  ownerName: string | null;
  dueDate: string | null;
}
interface RiskLite {
  id: string;
  externalId: string;
  description: string;
  status: string;
  ownerName: string | null;
}
interface DependencyLite {
  id: string;
  externalId: string;
  description: string;
  status: string;
  requiredDate: string | null;
}
interface MilestoneLite {
  id: string;
  title: string;
  targetDate: string | null;
  status: string | null;
  varianceDays: number | null;
}

export interface WorkstreamDetail extends WorkstreamFormValues {
  id: string;
  programmeName: string | null;
  leadName: string | null;
  projects: ProjectLite[];
  actions: ActionLite[];
  risks: RiskLite[];
  dependencies: DependencyLite[];
  milestones: MilestoneLite[];
}

export function WorkstreamDetailClient({
  workstream,
  people,
  programmes,
}: {
  workstream: WorkstreamDetail;
  people: Option[];
  programmes: Option[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const openActions = workstream.actions.filter((a) => a.status !== "DONE");

  const linkedCount =
    workstream.projects.length +
    workstream.actions.length +
    workstream.risks.length +
    workstream.dependencies.length +
    workstream.milestones.length;

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteWorkstream({ id: workstream.id });
    setDeleting(false);
    setConfirmDelete(false);
    if (result.ok) {
      toast.success(result.message ?? "Workstream deleted");
      router.push("/workstreams");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal">
              <span className="text-muted-foreground mr-2 font-mono text-base">{workstream.code}</span>
              {workstream.name}
            </h1>
            <RagIndicator value={workstream.rag as "RED" | "AMBER" | "GREEN" | null} />
          </div>
          <p className="text-muted-foreground text-sm">
            Lead: {workstream.leadName ?? "Unassigned"}
            {workstream.programmeName ? ` · ${workstream.programmeName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Can action="edit" entity="workstream">
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit workstream
            </Button>
          </Can>
          <Can action="delete" entity="workstream">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </Can>
        </div>
      </div>

      {workstream.oneLineStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{workstream.oneLineStatus}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Projects" value={workstream.projects.length} />
        <MetricCard label="Open actions" value={openActions.length} tone="info" />
        <MetricCard label="Risks" value={workstream.risks.length} tone="danger" />
        <MetricCard label="Dependencies" value={workstream.dependencies.length} tone="warning" />
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="projects">Projects ({workstream.projects.length})</TabsTrigger>
          <TabsTrigger value="actions">Open actions ({openActions.length})</TabsTrigger>
          <TabsTrigger value="risks">Risks ({workstream.risks.length})</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies ({workstream.dependencies.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({workstream.milestones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <SimpleTable
            head={["Code", "Project", "Owner", "RAG", "Status"]}
            empty="No projects in this workstream."
            rows={workstream.projects.map((p) => [
              <a key="c" href={`/projects/${p.id}`} className="hover:underline font-mono text-xs">{p.code ?? "—"}</a>,
              <a key="n" href={`/projects/${p.id}`} className="hover:underline font-medium">{p.name}</a>,
              p.ownerName ?? "—",
              <RagIndicator key="r" value={p.rag} showLabel={false} />,
              <StatusBadge key="s" status={p.status} />,
            ])}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Priority", "Status", "Owner", "Due"]}
            empty="No open actions."
            rows={openActions.map((a) => [
              <span key="r" className="font-mono text-xs">{a.externalId}</span>,
              <span key="d" className="line-clamp-2">{a.description}</span>,
              <PriorityBadge key="p" priority={a.priority} />,
              <StatusBadge key="s" status={a.status} />,
              a.ownerName ?? "—",
              formatDate(a.dueDate),
            ])}
          />
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Status", "Owner"]}
            empty="No risks for this workstream."
            rows={workstream.risks.map((r) => [
              <span key="r" className="font-mono text-xs">{r.externalId}</span>,
              <span key="d" className="line-clamp-2">{r.description}</span>,
              <StatusBadge key="s" status={r.status} />,
              r.ownerName ?? "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Required", "Status"]}
            empty="No dependencies for this workstream."
            rows={workstream.dependencies.map((d) => [
              <span key="r" className="font-mono text-xs">{d.externalId}</span>,
              <span key="de" className="line-clamp-2">{d.description}</span>,
              formatDate(d.requiredDate),
              <StatusBadge key="s" status={d.status} />,
            ])}
          />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <SimpleTable
            head={["Title", "Target", "Status", "Variance"]}
            empty="No milestones for this workstream."
            rows={workstream.milestones.map((m) => [
              m.title,
              formatDate(m.targetDate),
              <StatusBadge key="s" status={m.status} />,
              <VarianceCell key="v" days={m.varianceDays} />,
            ])}
          />
        </TabsContent>
      </Tabs>

      <WorkstreamFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={workstream}
        people={people}
        programmes={programmes}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete workstream?"
        description={
          linkedCount > 0
            ? `${workstream.code} still has ${linkedCount} linked item(s) (projects, actions, risks, dependencies or milestones). Reassign or remove them first — the delete will be blocked otherwise.`
            : `${workstream.code} — ${workstream.name} will be permanently removed.`
        }
        confirmLabel="Delete workstream"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function VarianceCell({ days }: { days: number | null }) {
  if (days === null || days === undefined) return <span className="text-muted-foreground">—</span>;
  if (days > 0) return <span className="text-rag-red font-medium">+{days}d late</span>;
  if (days < 0) return <span className="text-rag-green font-medium">{days}d early</span>;
  return <span className="text-muted-foreground">On track</span>;
}

function SimpleTable({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title="Nothing here yet" description={empty} />;
  }
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {head.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cells, i) => (
            <TableRow key={i}>
              {cells.map((c, j) => (
                <TableCell key={j} className="align-top">{c}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
