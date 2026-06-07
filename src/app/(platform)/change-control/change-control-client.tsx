"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  ClipboardList,
  FileEdit,
  History,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import {
  DetailDrawer,
  DetailField,
  DetailGrid,
} from "@/components/shared/detail-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { CHANGE_REQUEST_STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/enums";
import { formatDate, titleCase } from "@/lib/utils";
import type {
  AuditEntry,
  ChangeRequestWithRelations,
  PersonOption,
  ProjectOption,
} from "@/lib/services/change-control";
import {
  createChangeRequest,
  decideChangeRequest,
  updateChangeRequest,
  updateChangeRequestStatus,
} from "@/server/actions/change-control";

const NONE = "__none__";
const ALL = "ALL";
const DECIDABLE = ["DRAFT", "SUBMITTED", "IN_REVIEW"];

function requestedByLabel(cr: ChangeRequestWithRelations): string {
  return cr.requestedBy ?? "\u2014";
}

export function ChangeControlClient({
  changeRequests,
  audit,
  projects,
  approvers,
}: {
  changeRequests: ChangeRequestWithRelations[];
  audit: AuditEntry[];
  projects: ProjectOption[];
  approvers: PersonOption[];
}) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [priorityFilter, setPriorityFilter] = React.useState<string>(ALL);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ChangeRequestWithRelations | null>(
    null,
  );

  const selected = React.useMemo(
    () => changeRequests.find((c) => c.id === selectedId) ?? null,
    [changeRequests, selectedId],
  );

  const filtered = React.useMemo(
    () =>
      changeRequests.filter((c) => {
        if (statusFilter !== ALL && c.status !== statusFilter) return false;
        if (priorityFilter !== ALL && c.priority !== priorityFilter) return false;
        return true;
      }),
    [changeRequests, statusFilter, priorityFilter],
  );

  const metrics = React.useMemo(() => {
    const total = changeRequests.length;
    const pending = changeRequests.filter((c) =>
      DECIDABLE.includes(c.status),
    ).length;
    const approved = changeRequests.filter(
      (c) => c.status === "APPROVED" || c.status === "IMPLEMENTED",
    ).length;
    const rejected = changeRequests.filter((c) => c.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [changeRequests]);

  const exportRows = React.useMemo(
    () =>
      filtered.map((c) => ({
        id: c.externalId,
        title: c.title,
        project: c.project?.name ?? "",
        priority: c.priority,
        status: c.status,
        requestedBy: c.requestedBy ?? "",
        approver: c.approverPerson?.displayName ?? "",
      })),
    [filtered],
  );

  function openDetail(cr: ChangeRequestWithRelations) {
    setSelectedId(cr.id);
    setDrawerOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(cr: ChangeRequestWithRelations) {
    setEditing(cr);
    setDrawerOpen(false);
    setFormOpen(true);
  }

  function decide(id: string, decision: "APPROVED" | "REJECTED", outcome: string) {
    startTransition(async () => {
      const res = await decideChangeRequest({ id, decision, outcome });
      if (res.ok) {
        toast.success(res.message ?? "Decision recorded");
        setDrawerOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      const res = await updateChangeRequestStatus({ id, status });
      if (res.ok) {
        toast.success(res.message ?? "Status updated");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const columns: ColumnDef<ChangeRequestWithRelations>[] = [
    {
      id: "externalId",
      accessorFn: (r) => r.externalId,
      header: "ID",
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">{row.original.externalId}</span>
      ),
    },
    {
      id: "title",
      accessorFn: (r) => r.title,
      header: "Title",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-sm text-sm">{row.original.title}</span>
      ),
    },
    {
      id: "project",
      accessorFn: (r) => r.project?.name ?? "",
      header: "Project",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.project?.name ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "priority",
      accessorFn: (r) => r.priority,
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "requestedBy",
      accessorFn: (r) => r.requestedBy ?? "",
      header: "Requested by",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{requestedByLabel(row.original)}</span>
      ),
    },
    {
      id: "approver",
      accessorFn: (r) => r.approverPerson?.displayName ?? "",
      header: "Approver",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.approverPerson?.displayName ?? "\u2014"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Change Control"
        description="Submit, assess and decide change requests across programme projects, with full audit history."
        actions={
          <div className="flex items-center gap-2">
            <ExportButton rows={exportRows} filename="change-requests" entity="changeRequest" />
            <Can action="create" entity="changeRequest">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Submit change
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total requests" value={metrics.total} icon={FileEdit} />
        <MetricCard
          label="Awaiting decision"
          value={metrics.pending}
          icon={ClipboardList}
          tone="warning"
        />
        <MetricCard
          label="Approved"
          value={metrics.approved}
          icon={ThumbsUp}
          tone="success"
        />
        <MetricCard
          label="Rejected"
          value={metrics.rejected}
          icon={ThumbsDown}
          tone="danger"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {CHANGE_REQUEST_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {titleCase(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Priority</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {titleCase(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(statusFilter !== ALL || priorityFilter !== ALL) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter(ALL);
              setPriorityFilter(ALL);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search change requests..."
        onRowClick={openDetail}
        emptyTitle="No change requests match these filters"
        emptyDescription="Adjust the filters above or submit a new change request."
      />

      <ChangeRequestDrawer
        cr={selected}
        audit={audit.filter((a) => a.entityId === selected?.id)}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={openEdit}
        onDecide={decide}
        onSetStatus={setStatus}
      />

      <ChangeRequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cr={editing}
        projects={projects}
        approvers={approvers}
        onSaved={() => {
          setFormOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function ChangeRequestDrawer({
  cr,
  audit,
  open,
  onOpenChange,
  onEdit,
  onDecide,
  onSetStatus,
}: {
  cr: ChangeRequestWithRelations | null;
  audit: AuditEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (cr: ChangeRequestWithRelations) => void;
  onDecide: (id: string, decision: "APPROVED" | "REJECTED", outcome: string) => void;
  onSetStatus: (id: string, status: string) => void;
}) {
  const [outcome, setOutcome] = React.useState("");

  React.useEffect(() => {
    setOutcome(cr?.outcome ?? "");
  }, [cr]);

  if (!cr) return null;
  const canDecide = DECIDABLE.includes(cr.status);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`${cr.externalId} · ${cr.title}`}
      description={cr.project?.name ?? undefined}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Can action="edit" entity="changeRequest">
            <Button variant="outline" onClick={() => onEdit(cr)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          </Can>
        </div>
      }
    >
      <DetailGrid>
        <DetailField label="Status">
          <StatusBadge status={cr.status} />
        </DetailField>
        <DetailField label="Priority">
          <PriorityBadge priority={cr.priority} />
        </DetailField>
        <DetailField label="Requested by">{cr.requestedBy ?? "\u2014"}</DetailField>
        <DetailField label="Approver">
          {cr.approverPerson?.displayName ?? "\u2014"}
        </DetailField>
        <DetailField label="Project">{cr.project?.name ?? "\u2014"}</DetailField>
        <DetailField label="Decided">
          {cr.decidedAt ? formatDate(cr.decidedAt) : "\u2014"}
        </DetailField>
      </DetailGrid>

      <DetailField label="Description">
        <p className="whitespace-pre-wrap">{cr.description}</p>
      </DetailField>

      <DetailField label="Impact assessment">
        <p className="whitespace-pre-wrap">
          {cr.impactAssessment ?? "No impact assessment recorded."}
        </p>
      </DetailField>

      <DetailField label="Implementation status">
        {cr.implementationStatus ?? "\u2014"}
      </DetailField>

      {cr.outcome && (
        <DetailField label="Decision outcome">
          <p className="whitespace-pre-wrap">{cr.outcome}</p>
        </DetailField>
      )}

      <Can action="edit" entity="changeRequest">
        <div className="space-y-2">
          <Separator />
          <Label className="text-muted-foreground text-xs">Set status</Label>
          <Select value={cr.status} onValueChange={(v) => onSetStatus(cr.id, v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANGE_REQUEST_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {titleCase(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Can>

      <Can action="approve" entity="changeRequest">
        {canDecide && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label htmlFor="cr-outcome" className="text-sm font-medium">
              Decision
            </Label>
            <Textarea
              id="cr-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Optional outcome / rationale for the decision"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Button
                className="flex-1"
                onClick={() => onDecide(cr.id, "APPROVED", outcome)}
              >
                <ThumbsUp className="size-4" />
                Approve
              </Button>
              <Can action="reject" entity="changeRequest">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDecide(cr.id, "REJECTED", outcome)}
                >
                  <ThumbsDown className="size-4" />
                  Reject
                </Button>
              </Can>
            </div>
          </div>
        )}
      </Can>

      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-normal uppercase">
          <History className="size-3.5" />
          Audit history
        </div>
        {audit.length === 0 ? (
          <p className="text-muted-foreground text-sm">No audit events yet.</p>
        ) : (
          <ul className="space-y-2">
            {audit.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <div>
                  <span className="font-medium">{titleCase(a.action)}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    by {a.actorName ?? "system"} · {formatDate(a.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailDrawer>
  );
}

function ChangeRequestFormDialog({
  open,
  onOpenChange,
  cr,
  projects,
  approvers,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cr: ChangeRequestWithRelations | null;
  projects: ProjectOption[];
  approvers: PersonOption[];
  onSaved: () => void;
}) {
  const isEdit = Boolean(cr);
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    projectId: NONE,
    impactAssessment: "",
    priority: "MEDIUM" as string,
    requestedBy: "",
    approverPersonId: NONE,
    implementationStatus: "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      title: cr?.title ?? "",
      description: cr?.description ?? "",
      projectId: cr?.projectId ?? NONE,
      impactAssessment: cr?.impactAssessment ?? "",
      priority: cr?.priority ?? "MEDIUM",
      requestedBy: cr?.requestedBy ?? "",
      approverPersonId: cr?.approverPersonId ?? NONE,
      implementationStatus: cr?.implementationStatus ?? "",
    });
  }, [open, cr]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setPending(true);
    const payload = {
      title: form.title,
      description: form.description,
      projectId: form.projectId === NONE ? undefined : form.projectId,
      impactAssessment: form.impactAssessment || undefined,
      priority: form.priority,
      requestedBy: form.requestedBy || undefined,
      approverPersonId:
        form.approverPersonId === NONE ? undefined : form.approverPersonId,
      implementationStatus: form.implementationStatus || undefined,
    };
    const res = isEdit
      ? await updateChangeRequest({ id: cr!.id, ...payload })
      : await createChangeRequest(payload);
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Saved");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${cr?.externalId}` : "Submit change request"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the change request details below."
              : "Raise a new change request. A CR ID will be generated automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cr-title">Title *</Label>
            <Input
              id="cr-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cr-description">Description *</Label>
            <Textarea
              id="cr-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cr-impact">Impact assessment</Label>
            <Textarea
              id="cr-impact"
              value={form.impactAssessment}
              onChange={(e) => set("impactAssessment", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {titleCase(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => set("projectId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-requested">Requested by</Label>
              <Input
                id="cr-requested"
                value={form.requestedBy}
                onChange={(e) => set("requestedBy", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Approver</Label>
              <Select
                value={form.approverPersonId}
                onValueChange={(v) => set("approverPersonId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {approvers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-impl">Implementation status</Label>
            <Input
              id="cr-impl"
              value={form.implementationStatus}
              onChange={(e) => set("implementationStatus", e.target.value)}
              placeholder="e.g. Not started, Scheduled, Done"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
