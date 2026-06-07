"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  CircleCheck,
  Clock,
  History,
  Inbox,
  Plus,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { PRIORITY_OPTIONS } from "@/lib/enums";
import { formatDate, titleCase } from "@/lib/utils";
import type {
  ApprovalWithRelations,
  AuditEntry,
  PersonOption,
} from "@/lib/services/approvals";
import { createApproval, decideApproval } from "@/server/actions/approvals";

const NONE = "__none__";

type TabKey = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export function ApprovalsClient({
  approvals,
  audit,
  approvers,
}: {
  approvals: ApprovalWithRelations[];
  audit: AuditEntry[];
  approvers: PersonOption[];
}) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  const [tab, setTab] = React.useState<TabKey>("PENDING");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  const selected = React.useMemo(
    () => approvals.find((a) => a.id === selectedId) ?? null,
    [approvals, selectedId],
  );

  const metrics = React.useMemo(() => {
    const pending = approvals.filter((a) => a.status === "PENDING").length;
    const approved = approvals.filter((a) => a.status === "APPROVED").length;
    const rejected = approvals.filter((a) => a.status === "REJECTED").length;
    return { total: approvals.length, pending, approved, rejected };
  }, [approvals]);

  const visible = React.useMemo(() => {
    if (tab === "ALL") return approvals;
    return approvals.filter((a) => a.status === tab);
  }, [approvals, tab]);

  const exportRows = React.useMemo(
    () =>
      visible.map((a) => ({
        id: a.externalId,
        title: a.title,
        entityType: a.entityType,
        requestedBy: a.requestedBy ?? "",
        approver: a.approverPerson?.displayName ?? a.approverText ?? "",
        priority: a.priority,
        dueDate: a.dueDate ?? "",
        status: a.status,
      })),
    [visible],
  );

  function openDetail(a: ApprovalWithRelations) {
    setSelectedId(a.id);
    setDrawerOpen(true);
  }

  function decide(
    id: string,
    decision: "APPROVED" | "REJECTED",
    decisionReason: string,
  ) {
    startTransition(async () => {
      const res = await decideApproval({ id, decision, decisionReason });
      if (res.ok) {
        toast.success(res.message ?? "Decision recorded");
        setDrawerOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const columns: ColumnDef<ApprovalWithRelations>[] = [
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
      id: "entityType",
      accessorFn: (r) => r.entityType,
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="whitespace-nowrap">
          {titleCase(row.original.entityType)}
        </Badge>
      ),
    },
    {
      id: "requestedBy",
      accessorFn: (r) => r.requestedBy ?? "",
      header: "Requested by",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.requestedBy ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "approver",
      accessorFn: (r) => r.approverPerson?.displayName ?? r.approverText ?? "",
      header: "Approver",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {row.original.approverPerson?.displayName ??
            row.original.approverText ??
            "\u2014"}
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
      id: "dueDate",
      accessorFn: (r) => r.dueDate ?? "",
      header: "Due",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {row.original.dueDate ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Central approval queue across change requests, documents and delivery items. Review, then approve or reject with a recorded reason."
        actions={
          <div className="flex items-center gap-2">
            <ExportButton rows={exportRows} filename="approvals" entity="approval" />
            <Can action="create" entity="approval">
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                New approval
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={Inbox} />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Approved"
          value={metrics.approved}
          icon={CircleCheck}
          tone="success"
        />
        <MetricCard
          label="Rejected"
          value={metrics.rejected}
          icon={XCircle}
          tone="danger"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending ({metrics.pending})</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved ({metrics.approved})</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected ({metrics.rejected})</TabsTrigger>
          <TabsTrigger value="ALL">All ({metrics.total})</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={visible}
        searchPlaceholder="Search approvals..."
        onRowClick={openDetail}
        emptyTitle="No approvals in this queue"
        emptyDescription="There are no approval items with this status."
      />

      <ApprovalDrawer
        approval={selected}
        audit={audit.filter((a) => a.entityId === selected?.id)}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDecide={decide}
      />

      <ApprovalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        approvers={approvers}
        onSaved={() => {
          setFormOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function ApprovalDrawer({
  approval,
  audit,
  open,
  onOpenChange,
  onDecide,
}: {
  approval: ApprovalWithRelations | null;
  audit: AuditEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecide: (
    id: string,
    decision: "APPROVED" | "REJECTED",
    decisionReason: string,
  ) => void;
}) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    setReason(approval?.decisionReason ?? "");
  }, [approval]);

  if (!approval) return null;
  const isPending = approval.status === "PENDING";

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`${approval.externalId} · ${approval.title}`}
      description={titleCase(approval.entityType)}
    >
      <DetailGrid>
        <DetailField label="Status">
          <StatusBadge status={approval.status} />
        </DetailField>
        <DetailField label="Priority">
          <PriorityBadge priority={approval.priority} />
        </DetailField>
        <DetailField label="Entity type">{titleCase(approval.entityType)}</DetailField>
        <DetailField label="Reference">{approval.entityId ?? "\u2014"}</DetailField>
        <DetailField label="Requested by">{approval.requestedBy ?? "\u2014"}</DetailField>
        <DetailField label="Approver">
          {approval.approverPerson?.displayName ?? approval.approverText ?? "\u2014"}
        </DetailField>
        <DetailField label="Due date">{approval.dueDate ?? "\u2014"}</DetailField>
        <DetailField label="Decided">
          {approval.decidedAt ? formatDate(approval.decidedAt) : "\u2014"}
        </DetailField>
      </DetailGrid>

      {approval.summary && (
        <DetailField label="Summary">
          <p className="whitespace-pre-wrap">{approval.summary}</p>
        </DetailField>
      )}

      {!isPending && approval.decisionReason && (
        <DetailField label="Decision reason">
          <p className="whitespace-pre-wrap">{approval.decisionReason}</p>
        </DetailField>
      )}

      {isPending ? (
        <Can
          action="approve"
          entity="approval"
          fallback={
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              Your role can view this approval but cannot decide it.
            </p>
          }
        >
          <div className="space-y-2 rounded-lg border p-3">
            <Label htmlFor="apr-reason" className="text-sm font-medium">
              Decision reason
            </Label>
            <Textarea
              id="apr-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Capture the rationale for this decision"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Button
                className="flex-1"
                onClick={() => onDecide(approval.id, "APPROVED", reason)}
              >
                <ThumbsUp className="size-4" />
                Approve
              </Button>
              <Can action="reject" entity="approval">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDecide(approval.id, "REJECTED", reason)}
                >
                  <ThumbsDown className="size-4" />
                  Reject
                </Button>
              </Can>
            </div>
          </div>
        </Can>
      ) : (
        <div className="bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-lg border p-3 text-sm">
          <CheckCircle2 className="size-4" />
          This approval was {approval.status.toLowerCase()}
          {approval.decidedAt ? ` on ${formatDate(approval.decidedAt)}` : ""}.
        </div>
      )}

      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-normal uppercase">
          <History className="size-3.5" />
          Approval history
        </div>
        {audit.length === 0 ? (
          <p className="text-muted-foreground text-sm">No history yet.</p>
        ) : (
          <ul className="space-y-2">
            {audit.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
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

function ApprovalFormDialog({
  open,
  onOpenChange,
  approvers,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvers: PersonOption[];
  onSaved: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    entityType: "ChangeRequest",
    entityId: "",
    summary: "",
    priority: "MEDIUM" as string,
    requestedBy: "",
    approverPersonId: NONE,
    approverText: "",
    dueDate: "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
      entityType: "ChangeRequest",
      entityId: "",
      summary: "",
      priority: "MEDIUM",
      requestedBy: "",
      approverPersonId: NONE,
      approverText: "",
      dueDate: "",
    });
  }, [open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.entityType.trim()) {
      toast.error("Title and entity type are required");
      return;
    }
    setPending(true);
    const res = await createApproval({
      title: form.title,
      entityType: form.entityType,
      entityId: form.entityId || undefined,
      summary: form.summary || undefined,
      priority: form.priority,
      requestedBy: form.requestedBy || undefined,
      approverPersonId:
        form.approverPersonId === NONE ? undefined : form.approverPersonId,
      approverText: form.approverText || undefined,
      dueDate: form.dueDate || undefined,
    });
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Approval created");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New approval</DialogTitle>
          <DialogDescription>
            Raise a new item for the approval queue. An APR ID is generated
            automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="apr-title">Title *</Label>
            <Input
              id="apr-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apr-summary">Summary</Label>
            <Textarea
              id="apr-summary"
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apr-entity-type">Entity type *</Label>
              <Input
                id="apr-entity-type"
                value={form.entityType}
                onChange={(e) => set("entityType", e.target.value)}
                placeholder="e.g. ChangeRequest, Document"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apr-entity-id">Reference / entity ID</Label>
              <Input
                id="apr-entity-id"
                value={form.entityId}
                onChange={(e) => set("entityId", e.target.value)}
                placeholder="e.g. CR-001"
              />
            </div>
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
              <Label htmlFor="apr-due">Due date</Label>
              <Input
                id="apr-due"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                placeholder="e.g. 2026-07-01"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apr-requested">Requested by</Label>
              <Input
                id="apr-requested"
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
              {pending ? "Saving..." : "Create approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
