"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Gavel, Plus, Pencil, CheckCircle2, Clock } from "lucide-react";

import { formatOwnerDisplay } from "@/lib/format-person";
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
import { DECISION_STATUS_OPTIONS } from "@/lib/enums";
import {
  decisionSchema,
  type DecisionFormValues,
} from "@/lib/validation/decisions";
import type { DecisionRow } from "@/lib/services/decisions";
import type { PersonOption } from "@/lib/services/registers";
import { createDecision, updateDecision } from "@/server/actions/decisions";

export function DecisionsClient({
  decisions,
  people,
  linksMap = {},
}: {
  decisions: DecisionRow[];
  people: PersonOption[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<DecisionRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DecisionRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (decision: DecisionRow) => {
    setEditing(decision);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (decision: DecisionRow) => {
    setSelected(decision);
    setDrawerOpen(true);
  };

  const metrics = React.useMemo(() => {
    const confirmed = decisions.filter((d) => d.status === "CONFIRMED").length;
    const proposed = decisions.filter((d) => d.status === "PROPOSED").length;
    const deferred = decisions.filter((d) => d.status === "DEFERRED").length;
    return { total: decisions.length, confirmed, proposed, deferred };
  }, [decisions]);

  const columns = React.useMemo<ColumnDef<DecisionRow>[]>(
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
        id: "title",
        header: "Title",
        accessorFn: (d) => d.title ?? d.description,
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-md text-sm font-medium">
            {row.original.title ?? row.original.description}
          </span>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.category ?? "\u2014"}</span>
        ),
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
      decisions.map((d) => ({
        id: d.externalId,
        title: d.title ?? "",
        category: d.category ?? "",
        description: d.description,
        status: d.status,
        owner: formatOwnerDisplay(d.ownerText, d.ownerPerson),
        dueDate: d.dueDate ?? "",
      })),
    [decisions],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Log"
        description="Programme decisions with status, owner, rationale, options considered and trade-offs."
        actions={
          <>
            <ExportButton
              rows={exportRows}
              filename="decisions"
              entity="decision"
            />
            <Can action="create" entity="decision">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New decision
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={Gavel} />
        <MetricCard label="Confirmed" value={metrics.confirmed} icon={CheckCircle2} tone="success" />
        <MetricCard label="Proposed" value={metrics.proposed} icon={Clock} tone="info" />
        <MetricCard label="Deferred" value={metrics.deferred} icon={Clock} tone="warning" />
      </div>

      <DataTable
        columns={columns}
        data={decisions}
        mappingColumns
        tableKey="decisions"
        searchPlaceholder="Search decisions..."
        onRowClick={openDetail}
        emptyTitle="No decisions recorded"
        emptyDescription="Record the first decision to build the programme decision log."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Decision"}
        description={selected?.title ?? selected?.description}
        footer={
          selected && (
            <div className="flex justify-end">
              <Can action="edit" entity="decision">
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
              <DetailField label="Category">
                {selected.category ?? "\u2014"}
              </DetailField>
              <DetailField label="Owner">
                {formatOwnerDisplay(selected.ownerText, selected.ownerPerson)}
              </DetailField>
              <DetailField label="Approver">
                {selected.approver ?? "\u2014"}
              </DetailField>
              <DetailField label="Required decision">
                {selected.requiredDecision ?? "\u2014"}
              </DetailField>
              <DetailField label="Due date">
                {selected.dueDate ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Description">{selected.description}</DetailField>
            <DetailField label="Rationale">
              {selected.rationale ?? "\u2014"}
            </DetailField>
            <DetailField label="Options considered">
              {selected.optionsConsidered ?? "\u2014"}
            </DetailField>
            <DetailField label="Trade-offs">
              {selected.tradeoffs ?? "\u2014"}
            </DetailField>
            <DetailField label="Follow-up">
              {selected.followUp ?? "\u2014"}
            </DetailField>
            <DetailGrid>
              <DetailField label="Workstream">
                {selected.workstream?.name ?? "\u2014"}
              </DetailField>
              <DetailField label="Recorded">
                {formatDate(selected.createdAt)}
              </DetailField>
            </DetailGrid>
            <RelatedLinks links={linksMap[selected.externalId] ?? []} />
          </div>
        )}
      </DetailDrawer>

      <DecisionFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        people={people}
      />
    </div>
  );
}

function DecisionFormDialog({
  open,
  onOpenChange,
  editing,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DecisionRow | null;
  people: PersonOption[];
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          title: editing.title ?? "",
          category: editing.category ?? "",
          description: editing.description,
          status: editing.status,
          ownerPersonId: editing.ownerPersonId ?? "",
          ownerText: editing.ownerText ?? "",
          approver: editing.approver ?? "",
          requiredDecision: editing.requiredDecision ?? "",
          dueDate: editing.dueDate ?? "",
          rationale: editing.rationale ?? "",
          optionsConsidered: editing.optionsConsidered ?? "",
          tradeoffs: editing.tradeoffs ?? "",
          followUp: editing.followUp ?? "",
        }
      : {
          title: "",
          category: "",
          description: "",
          status: "PROPOSED",
          ownerPersonId: "",
          ownerText: "",
          approver: "",
          requiredDecision: "",
          dueDate: "",
          rationale: "",
          optionsConsidered: "",
          tradeoffs: "",
          followUp: "",
        },
  });

  const onSubmit = (values: DecisionFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateDecision(values)
        : await createDecision(values);
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
          <DialogTitle>{editing ? "Edit decision" : "New decision"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Record a new decision. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dec-title">Title</Label>
              <Input id="dec-title" {...register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dec-category">Category</Label>
              <Input id="dec-category" {...register("category")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dec-description">Description</Label>
            <Textarea
              id="dec-description"
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
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as DecisionFormValues["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_STATUS_OPTIONS.map((s) => (
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
              <Label htmlFor="dec-approver">Approver</Label>
              <Input id="dec-approver" {...register("approver")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dec-due">Due date</Label>
              <Input id="dec-due" {...register("dueDate")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="dec-required">Required decision</Label>
              <Input id="dec-required" {...register("requiredDecision")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="dec-owner-text">Owner (free text)</Label>
              <Input id="dec-owner-text" {...register("ownerText")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dec-rationale">Rationale</Label>
            <Textarea id="dec-rationale" rows={2} {...register("rationale")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-options">Options considered</Label>
            <Textarea id="dec-options" rows={2} {...register("optionsConsidered")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-tradeoffs">Trade-offs</Label>
            <Textarea id="dec-tradeoffs" rows={2} {...register("tradeoffs")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-followup">Follow-up</Label>
            <Textarea id="dec-followup" rows={2} {...register("followUp")} />
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
                  : "Create decision"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
