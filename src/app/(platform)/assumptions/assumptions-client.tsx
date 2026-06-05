"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Lightbulb, Plus, Pencil, ShieldCheck, ShieldAlert } from "lucide-react";

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
import { DataTable } from "@/components/shared/data-table";
import {
  DetailDrawer,
  DetailField,
  DetailGrid,
} from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";

import { formatDate } from "@/lib/utils";
import {
  assumptionSchema,
  type AssumptionFormValues,
} from "@/lib/validation/assumptions";
import type { AssumptionRow } from "@/lib/services/assumptions";
import type { PersonOption } from "@/lib/services/registers";
import {
  createAssumption,
  updateAssumption,
} from "@/server/actions/assumptions";

function validationState(a: AssumptionRow): boolean {
  const v = a.validationRequired?.trim().toLowerCase();
  if (!v) return false;
  return !["no", "none", "n/a", "not required"].includes(v);
}

export function AssumptionsClient({
  assumptions,
  people,
}: {
  assumptions: AssumptionRow[];
  people: PersonOption[];
}) {
  const [selected, setSelected] = React.useState<AssumptionRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AssumptionRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (assumption: AssumptionRow) => {
    setEditing(assumption);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (assumption: AssumptionRow) => {
    setSelected(assumption);
    setDrawerOpen(true);
  };

  const metrics = React.useMemo(() => {
    const needsValidation = assumptions.filter(validationState).length;
    const validated = assumptions.filter(
      (a) => !!a.validatorPerson || !!a.validatorText,
    ).length;
    return {
      total: assumptions.length,
      needsValidation,
      validated,
    };
  }, [assumptions]);

  const columns = React.useMemo<ColumnDef<AssumptionRow>[]>(
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
        id: "areaImpacted",
        header: "Area impacted",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.areaImpacted ?? "\u2014"}</span>
        ),
      },
      {
        id: "validation",
        header: "Validation",
        cell: ({ row }) =>
          validationState(row.original) ? (
            <Badge className="bg-rag-amber/10 text-rag-amber border-rag-amber/30">
              Required
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground border-transparent">
              Not flagged
            </Badge>
          ),
      },
      {
        id: "validator",
        header: "Validator",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.validatorPerson?.displayName ??
              row.original.validatorText ??
              "\u2014"}
          </span>
        ),
      },
    ],
    [],
  );

  const exportRows = React.useMemo(
    () =>
      assumptions.map((a) => ({
        id: a.externalId,
        description: a.description,
        areaImpacted: a.areaImpacted ?? "",
        validationRequired: a.validationRequired ?? "",
        riskIfWrong: a.riskIfWrong ?? "",
        validator: a.validatorPerson?.displayName ?? a.validatorText ?? "",
      })),
    [assumptions],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assumptions Log"
        description="Programme assumptions, the areas they affect, the risk if wrong and validation ownership."
        actions={
          <>
            <ExportButton
              rows={exportRows}
              filename="assumptions"
              entity="assumption"
            />
            <Can action="create" entity="assumption">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New assumption
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={Lightbulb} />
        <MetricCard
          label="Validation required"
          value={metrics.needsValidation}
          icon={ShieldAlert}
          tone="warning"
        />
        <MetricCard
          label="With validator"
          value={metrics.validated}
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <DataTable
        columns={columns}
        data={assumptions}
        searchPlaceholder="Search assumptions..."
        onRowClick={openDetail}
        emptyTitle="No assumptions recorded"
        emptyDescription="Capture the first assumption to track validation needs."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Assumption"}
        description={selected?.description}
        footer={
          selected && (
            <div className="flex justify-end">
              <Can action="edit" entity="assumption">
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
              <DetailField label="Area impacted">
                {selected.areaImpacted ?? "\u2014"}
              </DetailField>
              <DetailField label="Validator">
                {selected.validatorPerson?.displayName ??
                  selected.validatorText ??
                  "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Description">{selected.description}</DetailField>
            <DetailField label="Validation required">
              {selected.validationRequired ?? "\u2014"}
            </DetailField>
            <DetailField label="Risk if wrong">
              {selected.riskIfWrong ?? "\u2014"}
            </DetailField>
            <DetailGrid>
              <DetailField label="Trace">
                {selected.traceRef ?? "\u2014"}
              </DetailField>
              <DetailField label="Recorded">
                {formatDate(selected.createdAt)}
              </DetailField>
            </DetailGrid>
          </div>
        )}
      </DetailDrawer>

      <AssumptionFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        people={people}
      />
    </div>
  );
}

function AssumptionFormDialog({
  open,
  onOpenChange,
  editing,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AssumptionRow | null;
  people: PersonOption[];
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssumptionFormValues>({
    resolver: zodResolver(assumptionSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          description: editing.description,
          areaImpacted: editing.areaImpacted ?? "",
          validationRequired: editing.validationRequired ?? "",
          riskIfWrong: editing.riskIfWrong ?? "",
          validatorPersonId: editing.validatorPersonId ?? "",
          validatorText: editing.validatorText ?? "",
        }
      : {
          description: "",
          areaImpacted: "",
          validationRequired: "",
          riskIfWrong: "",
          validatorPersonId: "",
          validatorText: "",
        },
  });

  const onSubmit = (values: AssumptionFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateAssumption(values)
        : await createAssumption(values);
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
            {editing ? "Edit assumption" : "New assumption"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Record a new assumption. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="asm-description">Description</Label>
            <Textarea
              id="asm-description"
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
              <Label htmlFor="asm-area">Area impacted</Label>
              <Input id="asm-area" {...register("areaImpacted")} />
            </div>
            <div className="space-y-1.5">
              <Label>Validator</Label>
              <Select
                value={watch("validatorPersonId") || "none"}
                onValueChange={(v) =>
                  setValue("validatorPersonId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select validator" />
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="asm-validator-text">Validator (free text)</Label>
              <Input id="asm-validator-text" {...register("validatorText")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asm-validation">Validation required</Label>
            <Textarea id="asm-validation" rows={2} {...register("validationRequired")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asm-risk">Risk if wrong</Label>
            <Textarea id="asm-risk" rows={2} {...register("riskIfWrong")} />
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
                  : "Create assumption"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
