"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { EmptyState } from "@/components/shared/states";
import { Can } from "@/components/shared/can";
import { formatDate, titleCase } from "@/lib/utils";
import {
  ProjectFormDialog,
  type Option,
  type WsOption,
  type ProjectFormValues,
} from "../project-form";

export interface MilestoneLite {
  id: string;
  title: string;
  targetDate: string | null;
  piGate: string | null;
  status: string | null;
  varianceDays: number | null;
}
export interface DeliverableLite {
  id: string;
  name: string;
  status: string;
  dueDate: string | null;
  ownerName: string | null;
}
export interface ActionLite {
  id: string;
  externalId: string;
  description: string;
  priority: string;
  status: string;
  ownerName: string | null;
  dueDate: string | null;
}
export interface RiskLite {
  id: string;
  externalId: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  status: string;
  ownerName: string | null;
}
export interface IssueLite {
  id: string;
  externalId: string;
  description: string;
  status: string;
  currentImpact: string | null;
  ownerName: string | null;
}
export interface DependencyLite {
  id: string;
  externalId: string;
  description: string;
  status: string;
  requiredDate: string | null;
  providingTeam: string | null;
  receivingTeam: string | null;
}
export interface DocumentLite {
  id: string;
  name: string;
  status: string;
  version: string | null;
  ownerName: string | null;
  updatedAt: string;
}
export interface ActivityLite {
  id: string;
  action: string;
  actorName: string | null;
  actorRole: string | null;
  createdAt: string;
}

export interface ProjectDetail extends ProjectFormValues {
  id: string;
  workstreamCode: string | null;
  workstreamName: string | null;
  programmeName: string | null;
  ownerName: string | null;
  milestones: MilestoneLite[];
  deliverables: DeliverableLite[];
  actions: ActionLite[];
  risks: RiskLite[];
  issues: IssueLite[];
  dependencies: DependencyLite[];
  documents: DocumentLite[];
}

export function ProjectDetailClient({
  project,
  activity,
  people,
  workstreams,
  programmes,
}: {
  project: ProjectDetail;
  activity: ActivityLite[];
  people: Option[];
  workstreams: WsOption[];
  programmes: Option[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);

  const counts = {
    milestones: project.milestones.length,
    actions: project.actions.length,
    risks: project.risks.length,
    issues: project.issues.length,
    dependencies: project.dependencies.length,
    deliverables: project.deliverables.length,
    documents: project.documents.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal">{project.name}</h1>
            <RagIndicator value={project.rag as "RED" | "AMBER" | "GREEN" | null} />
          </div>
          <p className="text-muted-foreground text-sm">
            {project.code ? `${project.code} · ` : ""}
            <StatusBadgeInline status={project.status} /> · <PriorityBadge priority={project.priority} />
          </p>
        </div>
        <Can action="edit" entity="project">
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit project
          </Button>
        </Can>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({counts.milestones})</TabsTrigger>
          <TabsTrigger value="actions">Tasks / Actions ({counts.actions})</TabsTrigger>
          <TabsTrigger value="risks">Risks ({counts.risks})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({counts.issues})</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies ({counts.dependencies})</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables ({counts.deliverables})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({counts.documents})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <Card className="lg:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{project.description ?? "No description provided."}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Detail label="Owner">{project.ownerName ?? project.ownerText ?? "—"}</Detail>
                <Detail label="Sponsor">{project.sponsor ?? "—"}</Detail>
                <Detail label="Workstream">
                  {project.workstreamCode ? `${project.workstreamCode} · ${project.workstreamName}` : "—"}
                </Detail>
                <Detail label="Programme">{project.programmeName ?? "—"}</Detail>
                <Detail label="Start">{formatDate(project.startDate)}</Detail>
                <Detail label="End">{formatDate(project.endDate)}</Detail>
                <Detail label="Budget note">{project.budgetNote ?? "—"}</Detail>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <SimpleTable
            head={["Title", "Target", "PI gate", "Status", "Variance"]}
            empty="No milestones linked to this project."
            rows={project.milestones.map((m) => [
              m.title,
              formatDate(m.targetDate),
              m.piGate ?? "—",
              <StatusBadge key="s" status={m.status} />,
              <VarianceCell key="v" days={m.varianceDays} />,
            ])}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Priority", "Status", "Owner", "Due"]}
            empty="No tasks or actions for this project."
            rows={project.actions.map((a) => [
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
            head={["Ref", "Description", "Category", "P × I", "Status", "Owner"]}
            empty="No risks for this project."
            rows={project.risks.map((r) => [
              <span key="r" className="font-mono text-xs">{r.externalId}</span>,
              <span key="d" className="line-clamp-2">{r.description}</span>,
              titleCase(r.category),
              `${titleCase(r.probability)} × ${titleCase(r.impact)}`,
              <StatusBadge key="s" status={r.status} />,
              r.ownerName ?? "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Impact", "Status", "Owner"]}
            empty="No issues for this project."
            rows={project.issues.map((i) => [
              <span key="r" className="font-mono text-xs">{i.externalId}</span>,
              <span key="d" className="line-clamp-2">{i.description}</span>,
              <span key="im" className="line-clamp-2">{i.currentImpact ?? "—"}</span>,
              <StatusBadge key="s" status={i.status} />,
              i.ownerName ?? "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
          <SimpleTable
            head={["Ref", "Description", "Providing", "Receiving", "Required", "Status"]}
            empty="No dependencies for this project."
            rows={project.dependencies.map((d) => [
              <span key="r" className="font-mono text-xs">{d.externalId}</span>,
              <span key="de" className="line-clamp-2">{d.description}</span>,
              d.providingTeam ?? "—",
              d.receivingTeam ?? "—",
              formatDate(d.requiredDate),
              <StatusBadge key="s" status={d.status} />,
            ])}
          />
        </TabsContent>

        <TabsContent value="deliverables" className="mt-4">
          <SimpleTable
            head={["Name", "Status", "Due", "Owner"]}
            empty="No deliverables for this project."
            rows={project.deliverables.map((d) => [
              d.name,
              <StatusBadge key="s" status={d.status} />,
              formatDate(d.dueDate),
              d.ownerName ?? "—",
            ])}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SimpleTable
            head={["Name", "Version", "Status", "Owner", "Updated"]}
            empty="No documents for this project."
            rows={project.documents.map((d) => [
              d.name,
              d.version ?? "—",
              <StatusBadge key="s" status={d.status} />,
              d.ownerName ?? "—",
              formatDate(d.updatedAt),
            ])}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <SimpleTable
            head={["Action", "Actor", "Role", "When"]}
            empty="No activity recorded for this project yet."
            rows={activity.map((a) => [
              titleCase(a.action),
              a.actorName ?? "system",
              a.actorRole ?? "—",
              formatDate(a.createdAt),
            ])}
          />
        </TabsContent>
      </Tabs>

      <ProjectFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={project}
        people={people}
        workstreams={workstreams}
        programmes={programmes}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

function StatusBadgeInline({ status }: { status: string }) {
  return <StatusBadge status={status} />;
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
