"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportButton } from "@/components/shared/export-button";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { Can } from "@/components/shared/can";
import { formatDate } from "@/lib/utils";
import { createMilestone, updateMilestone } from "@/server/actions/milestones";

const UNSET = "__unset__";

export interface MilestoneRow {
  id: string;
  title: string;
  targetDate: string | null;
  piGate: string | null;
  status: string | null;
  varianceDays: number | null;
  notes: string | null;
  workstreamId: string | null;
  workstreamLabel: string | null;
  projectId: string | null;
  projectLabel: string | null;
}

type WsOpt = { id: string; code: string; name: string };
type PrjOpt = { id: string; code: string | null; name: string };

export function MilestonesClient({
  milestones,
  workstreams,
  projects,
}: {
  milestones: MilestoneRow[];
  workstreams: WsOpt[];
  projects: PrjOpt[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MilestoneRow | null>(null);
  const [viewing, setViewing] = React.useState<MilestoneRow | null>(null);

  const columns = React.useMemo<ColumnDef<MilestoneRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Milestone",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "targetDate",
        header: "Target date",
        cell: ({ row }) => <span>{formatDate(row.original.targetDate)}</span>,
      },
      {
        accessorKey: "piGate",
        header: "PI gate",
        cell: ({ row }) => <span>{row.original.piGate ?? "—"}</span>,
      },
      {
        id: "context",
        header: "Workstream / Project",
        accessorFn: (r) => r.workstreamLabel ?? r.projectLabel ?? "",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.workstreamLabel ?? row.original.projectLabel ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "varianceDays",
        header: "Variance",
        cell: ({ row }) => <VarianceCell days={row.original.varianceDays} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Can action="edit" entity="milestone">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit milestone"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row.original);
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </Can>
        ),
      },
    ],
    [],
  );

  const exportRows = milestones.map((m) => ({
    title: m.title,
    targetDate: m.targetDate ?? "",
    piGate: m.piGate ?? "",
    context: m.workstreamLabel ?? m.projectLabel ?? "",
    status: m.status ?? "",
    varianceDays: m.varianceDays ?? "",
  }));

  return (
    <>
      <DataTable
        columns={columns}
        data={milestones}
        mappingColumns
        tableKey="milestones"
        searchPlaceholder="Search milestones..."
        onRowClick={(row) => setViewing(row)}
        emptyTitle="No milestones"
        emptyDescription="Programme and project milestones will appear here."
        toolbar={
          <>
            <ExportButton rows={exportRows} filename="milestones" entity="milestone" />
            <Can action="create" entity="milestone">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New milestone
              </Button>
            </Can>
          </>
        }
      />

      <MilestoneFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        workstreams={workstreams}
        projects={projects}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />

      <MilestoneFormDialog
        mode="edit"
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing ?? undefined}
        workstreams={workstreams}
        projects={projects}
        onSuccess={(msg) => {
          toast.success(msg);
          setEditing(null);
          router.refresh();
        }}
      />

      <DetailDrawer
        open={viewing !== null}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing?.title ?? "Milestone"}
        description={viewing?.piGate ? `PI gate: ${viewing.piGate}` : undefined}
        footer={
          viewing ? (
            <Can action="edit" entity="milestone">
              <Button
                onClick={() => {
                  setEditing(viewing);
                  setViewing(null);
                }}
              >
                <Pencil className="size-4" />
                Edit milestone
              </Button>
            </Can>
          ) : undefined
        }
      >
        {viewing && (
          <>
            <DetailGrid>
              <DetailField label="Target date">{formatDate(viewing.targetDate)}</DetailField>
              <DetailField label="Status">
                <StatusBadge status={viewing.status} />
              </DetailField>
              <DetailField label="PI gate">{viewing.piGate ?? "—"}</DetailField>
              <DetailField label="Variance">
                <VarianceCell days={viewing.varianceDays} />
              </DetailField>
              <DetailField label="Workstream">{viewing.workstreamLabel ?? "—"}</DetailField>
              <DetailField label="Project">{viewing.projectLabel ?? "—"}</DetailField>
            </DetailGrid>
            {viewing.notes && (
              <DetailField label="Notes">
                <span className="whitespace-pre-wrap">{viewing.notes}</span>
              </DetailField>
            )}
          </>
        )}
      </DetailDrawer>
    </>
  );
}

function VarianceCell({ days }: { days: number | null }) {
  if (days === null || days === undefined) return <span className="text-muted-foreground">—</span>;
  if (days > 0) return <span className="text-rag-red font-medium">+{days}d late</span>;
  if (days < 0) return <span className="text-rag-green font-medium">{days}d early</span>;
  return <span className="text-rag-green font-medium">On track</span>;
}

function MilestoneFormDialog({
  mode,
  open,
  onOpenChange,
  initial,
  workstreams,
  projects,
  onSuccess,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MilestoneRow;
  workstreams: WsOpt[];
  projects: PrjOpt[];
  onSuccess?: (message: string) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = String(fd.get(k) ?? "");
      return v === UNSET ? "" : v;
    };

    const payload: Record<string, unknown> = {
      title: get("title"),
      targetDate: get("targetDate"),
      piGate: get("piGate"),
      status: get("status"),
      varianceDays: get("varianceDays"),
      notes: get("notes"),
      workstreamId: get("workstreamId"),
      projectId: get("projectId"),
    };
    if (mode === "edit" && initial?.id) payload.id = initial.id;

    const result =
      mode === "create" ? await createMilestone(payload) : await updateMilestone(payload);
    setPending(false);

    if (result.ok) {
      onOpenChange(false);
      onSuccess?.(result.message ?? "Saved");
    } else {
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
      if ("error" in result) setErrors((p) => ({ ...p, _form: [result.error] }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New milestone" : "Edit milestone"}</DialogTitle>
          <DialogDescription>
            Track a delivery milestone against a workstream or project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {errors._form && <p className="text-rag-red text-sm">{errors._form[0]}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="m-title">Title</Label>
            <Input id="m-title" name="title" defaultValue={initial?.title} required />
            {errors.title && <p className="text-rag-red text-xs">{errors.title[0]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-target">Target date</Label>
              <Input id="m-target" name="targetDate" defaultValue={initial?.targetDate ?? ""} placeholder="2026-09-30" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-pi">PI gate</Label>
              <Input id="m-pi" name="piGate" defaultValue={initial?.piGate ?? ""} placeholder="PI-3" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-var">Variance (days)</Label>
              <Input id="m-var" name="varianceDays" type="number" defaultValue={initial?.varianceDays ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-status">Status</Label>
            <Input id="m-status" name="status" defaultValue={initial?.status ?? ""} placeholder="e.g. On track, At risk, Complete" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-ws">Workstream</Label>
              <Select name="workstreamId" defaultValue={initial?.workstreamId ?? UNSET}>
                <SelectTrigger id="m-ws" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>None</SelectItem>
                  {workstreams.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.code} · {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-prj">Project</Label>
              <Select name="projectId" defaultValue={initial?.projectId ?? UNSET}>
                <SelectTrigger id="m-prj" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code ? `${p.code} · ` : ""}{p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-notes">Notes</Label>
            <Textarea id="m-notes" name="notes" defaultValue={initial?.notes ?? ""} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create milestone" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
