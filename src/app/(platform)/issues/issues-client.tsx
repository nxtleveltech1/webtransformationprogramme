"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Bug, Plus, CheckCircle2, Clock, Pencil, AlertOctagon } from "lucide-react";

import { formatOwnerDisplay } from "@/lib/format-person";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import {
  DetailDrawer,
  DetailField,
  DetailGrid,
} from "@/components/shared/detail-drawer";
import { RelatedLinks } from "@/components/shared/related-links";
import type { RelatedLink } from "@/lib/services/register-links";
import { ExportButton } from "@/components/shared/export-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Can } from "@/components/shared/can";

import { cn, formatDate, relativeDays, titleCase } from "@/lib/utils";
import { ISSUE_STATUS_OPTIONS } from "@/lib/enums";
import { issueSchema, type IssueFormValues } from "@/lib/validation/issues";
import type { IssueRow } from "@/lib/services/issues";
import type { PersonOption } from "@/lib/services/registers";
import { createIssue, updateIssue, closeIssue } from "@/server/actions/issues";

function AgeBadge({ createdAt }: { createdAt: Date | string }) {
  const days = relativeDays(createdAt) ?? 0;
  const tone =
    days >= 30
      ? "bg-rag-red/10 text-rag-red border-rag-red/30"
      : days >= 14
        ? "bg-rag-amber/10 text-rag-amber border-rag-amber/30"
        : "bg-muted text-muted-foreground border-transparent";
  return (
    <Badge className={cn("tabular-nums", tone)}>
      {days}d
    </Badge>
  );
}

export function IssuesClient({
  issues,
  people,
  linksMap = {},
}: {
  issues: IssueRow[];
  people: PersonOption[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<IssueRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<IssueRow | null>(null);
  const [closeTarget, setCloseTarget] = React.useState<IssueRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (issue: IssueRow) => {
    setEditing(issue);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (issue: IssueRow) => {
    setSelected(issue);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    if (!closeTarget) return;
    startTransition(async () => {
      const res = await closeIssue({ id: closeTarget.id });
      if (res.ok) {
        toast.success(res.message ?? "Issue closed");
        setCloseTarget(null);
        setDrawerOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const metrics = React.useMemo(() => {
    const open = issues.filter((i) => i.status !== "CLOSED").length;
    const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
    const aged = issues.filter(
      (i) => i.status !== "CLOSED" && (relativeDays(i.createdAt) ?? 0) >= 14,
    ).length;
    return { total: issues.length, open, inProgress, aged };
  }, [issues]);

  const columns = React.useMemo<ColumnDef<IssueRow>[]>(
    () => [
      {
        accessorKey: "externalId",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            {row.original.externalId}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-md text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "age",
        header: "Age",
        accessorFn: (i) => relativeDays(i.createdAt) ?? 0,
        cell: ({ row }) => <AgeBadge createdAt={row.original.createdAt} />,
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-sm">
            {formatOwnerDisplay(row.original.ownerText, row.original.ownerPerson)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const exportRows = React.useMemo(
    () =>
      issues.map((i) => ({
        id: i.externalId,
        description: i.description,
        impact: i.currentImpact ?? "",
        affectedTeams: i.affectedTeams ?? "",
        ageDays: relativeDays(i.createdAt) ?? 0,
        owner: formatOwnerDisplay(i.ownerText, i.ownerPerson),
        status: i.status,
        resolution: i.resolutionRequired ?? "",
      })),
    [issues],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Register"
        description="Active issues with ageing, impact, ownership and a resolution / closure workflow."
        actions={
          <>
            <ExportButton rows={exportRows} filename="issues" entity="issue" />
            <Can action="create" entity="issue">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New issue
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total issues" value={metrics.total} icon={Bug} />
        <MetricCard label="Open" value={metrics.open} icon={AlertOctagon} tone="info" />
        <MetricCard
          label="In progress"
          value={metrics.inProgress}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Ageing (>= 14d)"
          value={metrics.aged}
          icon={Clock}
          tone="danger"
        />
      </div>

      <DataTable
        columns={columns}
        data={issues}
        mappingColumns
        tableKey="issues"
        searchPlaceholder="Search issues..."
        onRowClick={openDetail}
        emptyTitle="No issues recorded"
        emptyDescription="Log the first issue to start tracking blockers and impact."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Issue"}
        description={selected?.description}
        footer={
          selected && (
            <div className="flex justify-end gap-2">
              {selected.status !== "CLOSED" && (
                <Can action="edit" entity="issue">
                  <Button
                    variant="outline"
                    onClick={() => setCloseTarget(selected)}
                    disabled={pending}
                  >
                    <CheckCircle2 className="size-4" />
                    Close issue
                  </Button>
                </Can>
              )}
              <Can action="edit" entity="issue">
                <Button onClick={() => openEdit(selected)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Can>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Status">
                <StatusBadge status={selected.status} />
              </DetailField>
              <DetailField label="Age">
                {relativeDays(selected.createdAt) ?? 0} days
              </DetailField>
              <DetailField label="Owner">
                {formatOwnerDisplay(selected.ownerText, selected.ownerPerson)}
              </DetailField>
              <DetailField label="Affected teams">
                {selected.affectedTeams ?? "\u2014"}
              </DetailField>
              <DetailField label="Target resolution">
                {selected.targetResolutionDate ?? "\u2014"}
              </DetailField>
              <DetailField label="Blocked workstream">
                {selected.blockedWorkstream ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Description">{selected.description}</DetailField>
            <DetailField label="Current impact">
              {selected.currentImpact ?? "\u2014"}
            </DetailField>
            <DetailField label="Resolution required">
              {selected.resolutionRequired ?? "\u2014"}
            </DetailField>
            <DetailGrid>
              <DetailField label="Project">
                {selected.project?.name ?? "\u2014"}
              </DetailField>
              <DetailField label="Recorded">
                {formatDate(selected.createdAt)}
              </DetailField>
            </DetailGrid>
            <RelatedLinks links={linksMap[selected.externalId] ?? []} />
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={!!closeTarget}
        onOpenChange={(o) => !o && setCloseTarget(null)}
        title="Close this issue?"
        description={
          closeTarget
            ? `${closeTarget.externalId} will be marked as CLOSED.`
            : undefined
        }
        confirmLabel="Close issue"
        onConfirm={handleClose}
        loading={pending}
      />

      <IssueFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        people={people}
      />
    </div>
  );
}

function IssueFormDialog({
  open,
  onOpenChange,
  editing,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IssueRow | null;
  people: PersonOption[];
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          description: editing.description,
          currentImpact: editing.currentImpact ?? "",
          affectedTeams: editing.affectedTeams ?? "",
          status: editing.status,
          ownerPersonId: editing.ownerPersonId ?? "",
          ownerText: editing.ownerText ?? "",
          resolutionRequired: editing.resolutionRequired ?? "",
          targetResolutionDate: editing.targetResolutionDate ?? "",
          blockedWorkstream: editing.blockedWorkstream ?? "",
        }
      : {
          description: "",
          currentImpact: "",
          affectedTeams: "",
          status: "OPEN",
          ownerPersonId: "",
          ownerText: "",
          resolutionRequired: "",
          targetResolutionDate: "",
          blockedWorkstream: "",
        },
  });

  const onSubmit = (values: IssueFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateIssue(values)
        : await createIssue(values);
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit issue" : "New issue"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Log a new issue. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="issue-description">Description</Label>
            <Textarea
              id="issue-description"
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-rag-red text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="issue-impact">Current impact</Label>
            <Textarea id="issue-impact" rows={2} {...register("currentImpact")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as IssueFormValues["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select
                value={watch("ownerPersonId") || "none"}
                onValueChange={(v) =>
                  setValue("ownerPersonId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-teams">Affected teams</Label>
              <Input id="issue-teams" {...register("affectedTeams")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-target">Target resolution date</Label>
              <Input id="issue-target" {...register("targetResolutionDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-blocked">Blocked workstream</Label>
              <Input id="issue-blocked" {...register("blockedWorkstream")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue-owner-text">Owner (free text)</Label>
              <Input id="issue-owner-text" {...register("ownerText")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="issue-resolution">Resolution required</Label>
            <Textarea id="issue-resolution" rows={2} {...register("resolutionRequired")} />
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
              {pending ? "Saving..." : editing ? "Save changes" : "Create issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
