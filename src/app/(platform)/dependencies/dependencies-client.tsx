"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { GitBranch, Plus, Pencil, Flame, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { RelatedLinks } from "@/components/shared/related-links";
import type { RelatedLink } from "@/lib/services/register-links";

import { formatDate, titleCase } from "@/lib/utils";
import { DEPENDENCY_STATUS_OPTIONS } from "@/lib/enums";
import {
  dependencySchema,
  type DependencyFormValues,
} from "@/lib/validation/dependencies";
import type { DependencyRow } from "@/lib/services/dependencies";
import {
  createDependency,
  updateDependency,
  escalateDependency,
} from "@/server/actions/dependencies";

export function DependenciesClient({
  dependencies,
  linksMap = {},
}: {
  dependencies: DependencyRow[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<DependencyRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DependencyRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (dep: DependencyRow) => {
    setEditing(dep);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (dep: DependencyRow) => {
    setSelected(dep);
    setDrawerOpen(true);
  };

  const handleEscalate = (dep: DependencyRow) => {
    startTransition(async () => {
      const res = await escalateDependency({ id: dep.id });
      if (res.ok) {
        toast.success(res.message ?? "Dependency escalated");
        setDrawerOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const metrics = React.useMemo(() => {
    const open = dependencies.filter(
      (d) => d.status === "OPEN" || d.status === "IN_PROGRESS",
    ).length;
    const atRisk = dependencies.filter(
      (d) => d.status === "AT_RISK" || d.status === "BLOCKED",
    ).length;
    const met = dependencies.filter((d) => d.status === "MET").length;
    return { total: dependencies.length, open, atRisk, met };
  }, [dependencies]);

  const columns = React.useMemo<ColumnDef<DependencyRow>[]>(
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
        id: "providingTeam",
        header: "Providing",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.providingTeam ?? "\u2014"}</span>
        ),
      },
      {
        id: "receivingTeam",
        header: "Receiving",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.receivingTeam ?? "\u2014"}</span>
        ),
      },
      {
        id: "requiredDate",
        header: "Required",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.requiredDate ?? "\u2014"}</span>
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
      dependencies.map((d) => ({
        id: d.externalId,
        description: d.description,
        providingTeam: d.providingTeam ?? "",
        receivingTeam: d.receivingTeam ?? "",
        requiredDate: d.requiredDate ?? "",
        status: d.status,
        escalation: d.escalation ?? "",
      })),
    [dependencies],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dependency Register"
        description="Cross-team dependencies with providing/receiving teams, required dates and escalation."
        actions={
          <>
            <ExportButton
              rows={exportRows}
              filename="dependencies"
              entity="dependency"
            />
            <Can action="create" entity="dependency">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New dependency
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={GitBranch} />
        <MetricCard label="Open / in progress" value={metrics.open} icon={GitBranch} tone="info" />
        <MetricCard
          label="At risk / blocked"
          value={metrics.atRisk}
          icon={AlertTriangle}
          tone="danger"
        />
        <MetricCard label="Met" value={metrics.met} icon={CheckCircle2} tone="success" />
      </div>

      <DataTable
        columns={columns}
        data={dependencies}
        searchPlaceholder="Search dependencies..."
        onRowClick={openDetail}
        emptyTitle="No dependencies recorded"
        emptyDescription="Add the first cross-team dependency to start tracking handovers."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Dependency"}
        description={selected?.description}
        footer={
          selected && (
            <div className="flex justify-end gap-2">
              <Can action="escalate" entity="dependency">
                <Button
                  variant="outline"
                  onClick={() => handleEscalate(selected)}
                  disabled={pending || selected.status === "AT_RISK"}
                >
                  <Flame className="size-4" />
                  Escalate
                </Button>
              </Can>
              <Can action="edit" entity="dependency">
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
              <DetailField label="Required date">
                {selected.requiredDate ?? "\u2014"}
              </DetailField>
              <DetailField label="Providing team">
                {selected.providingTeam ?? "\u2014"}
              </DetailField>
              <DetailField label="Receiving team">
                {selected.receivingTeam ?? "\u2014"}
              </DetailField>
              <DetailField label="Dependent workstream">
                {selected.dependentWorkstream ??
                  selected.workstream?.name ??
                  "\u2014"}
              </DetailField>
              <DetailField label="Owner">
                {selected.ownerText ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Description">{selected.description}</DetailField>
            <DetailField label="Delay risk">
              {selected.delayRisk ?? "\u2014"}
            </DetailField>
            <DetailField label="Escalation">
              {selected.escalation ?? "\u2014"}
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

      <DependencyFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}

function DependencyFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DependencyRow | null;
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DependencyFormValues>({
    resolver: zodResolver(dependencySchema),
    defaultValues: editing
      ? {
          id: editing.id,
          description: editing.description,
          dependentWorkstream: editing.dependentWorkstream ?? "",
          providingTeam: editing.providingTeam ?? "",
          receivingTeam: editing.receivingTeam ?? "",
          requiredDate: editing.requiredDate ?? "",
          delayRisk: editing.delayRisk ?? "",
          escalation: editing.escalation ?? "",
          status: editing.status,
          ownerText: editing.ownerText ?? "",
        }
      : {
          description: "",
          dependentWorkstream: "",
          providingTeam: "",
          receivingTeam: "",
          requiredDate: "",
          delayRisk: "",
          escalation: "",
          status: "OPEN",
          ownerText: "",
        },
  });

  const onSubmit = (values: DependencyFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateDependency(values)
        : await createDependency(values);
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
          <DialogTitle>
            {editing ? "Edit dependency" : "New dependency"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Record a new cross-team dependency. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dep-description">Description</Label>
            <Textarea
              id="dep-description"
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-rag-red text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dep-providing">Providing team</Label>
              <Input id="dep-providing" {...register("providingTeam")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dep-receiving">Receiving team</Label>
              <Input id="dep-receiving" {...register("receivingTeam")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dep-required">Required date</Label>
              <Input id="dep-required" {...register("requiredDate")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as DependencyFormValues["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {DEPENDENCY_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dep-stream">Dependent workstream</Label>
              <Input id="dep-stream" {...register("dependentWorkstream")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dep-owner">Owner (free text)</Label>
              <Input id="dep-owner" {...register("ownerText")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dep-delay">Delay risk</Label>
            <Textarea id="dep-delay" rows={2} {...register("delayRisk")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-escalation">Escalation</Label>
            <Input id="dep-escalation" {...register("escalation")} />
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
              {pending
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create dependency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
