"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ParkingSquare, Plus, Pencil } from "lucide-react";

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
import { PriorityBadge } from "@/components/shared/priority-badge";
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
import { PRIORITY_OPTIONS } from "@/lib/enums";
import {
  parkingLotSchema,
  type ParkingLotFormValues,
} from "@/lib/validation/parking-lot";
import type { ParkingLotRow } from "@/lib/services/parking-lot";
import {
  createParkingLotItem,
  updateParkingLotItem,
} from "@/server/actions/parking-lot";

export function ParkingLotClient({
  items,
  linksMap = {},
}: {
  items: ParkingLotRow[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<ParkingLotRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ParkingLotRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: ParkingLotRow) => {
    setEditing(item);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (item: ParkingLotRow) => {
    setSelected(item);
    setDrawerOpen(true);
  };

  const metrics = React.useMemo(() => {
    const highPriority = items.filter(
      (i) => i.priority === "CRITICAL" || i.priority === "HIGH",
    ).length;
    const withForum = items.filter((i) => !!i.suggestedForum).length;
    return { total: items.length, highPriority, withForum };
  }, [items]);

  const columns = React.useMemo<ColumnDef<ParkingLotRow>[]>(
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
        accessorKey: "topic",
        header: "Topic",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-md text-sm font-medium">
            {row.original.topic}
          </span>
        ),
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        id: "suggestedForum",
        header: "Suggested forum",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.suggestedForum ?? "\u2014"}
          </span>
        ),
      },
    ],
    [],
  );

  const exportRows = React.useMemo(
    () =>
      items.map((i) => ({
        id: i.externalId,
        topic: i.topic,
        whyParked: i.whyParked ?? "",
        followUp: i.followUp ?? "",
        priority: i.priority ?? "",
        suggestedForum: i.suggestedForum ?? "",
      })),
    [items],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parking Lot"
        description="Topics parked for later, why they were deferred, the follow-up and the suggested forum."
        actions={
          <>
            <ExportButton
              rows={exportRows}
              filename="parking-lot"
              entity="parkingLot"
            />
            <Can action="create" entity="parkingLot">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New item
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={ParkingSquare} />
        <MetricCard
          label="High priority"
          value={metrics.highPriority}
          icon={ParkingSquare}
          tone="warning"
        />
        <MetricCard
          label="With suggested forum"
          value={metrics.withForum}
          icon={ParkingSquare}
          tone="info"
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="Search parking lot..."
        onRowClick={openDetail}
        emptyTitle="Parking lot is empty"
        emptyDescription="Park a topic to revisit it in a later session or forum."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Parking lot item"}
        description={selected?.topic}
        footer={
          selected && (
            <div className="flex justify-end">
              <Can action="edit" entity="parkingLot">
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
              <DetailField label="Priority">
                <PriorityBadge priority={selected.priority} />
              </DetailField>
              <DetailField label="Suggested forum">
                {selected.suggestedForum ?? "\u2014"}
              </DetailField>
              <DetailField label="Owner">
                {selected.ownerText ?? "\u2014"}
              </DetailField>
              <DetailField label="Recorded">
                {formatDate(selected.createdAt)}
              </DetailField>
            </DetailGrid>
            <DetailField label="Topic">{selected.topic}</DetailField>
            <DetailField label="Why parked">
              {selected.whyParked ?? "\u2014"}
            </DetailField>
            <DetailField label="Follow-up">
              {selected.followUp ?? "\u2014"}
            </DetailField>
            <RelatedLinks links={linksMap[selected.externalId] ?? []} />
          </div>
        )}
      </DetailDrawer>

      <ParkingLotFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}

function ParkingLotFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ParkingLotRow | null;
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParkingLotFormValues>({
    resolver: zodResolver(parkingLotSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          topic: editing.topic,
          whyParked: editing.whyParked ?? "",
          followUp: editing.followUp ?? "",
          priority: editing.priority ?? undefined,
          suggestedForum: editing.suggestedForum ?? "",
          ownerText: editing.ownerText ?? "",
        }
      : {
          topic: "",
          whyParked: "",
          followUp: "",
          priority: undefined,
          suggestedForum: "",
          ownerText: "",
        },
  });

  const onSubmit = (values: ParkingLotFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateParkingLotItem(values)
        : await createParkingLotItem(values);
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const priorityValue = watch("priority");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit item" : "New parking lot item"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Park a topic for later. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prk-topic">Topic</Label>
            <Textarea
              id="prk-topic"
              rows={2}
              {...register("topic")}
              aria-invalid={!!errors.topic}
            />
            {errors.topic && (
              <p className="text-rag-red text-xs">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priorityValue ?? "none"}
                onValueChange={(v) =>
                  setValue(
                    "priority",
                    v === "none"
                      ? undefined
                      : (v as NonNullable<ParkingLotFormValues["priority"]>),
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unset</SelectItem>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {titleCase(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prk-forum">Suggested forum</Label>
              <Input id="prk-forum" {...register("suggestedForum")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prk-owner">Owner (free text)</Label>
              <Input id="prk-owner" {...register("ownerText")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prk-why">Why parked</Label>
            <Textarea id="prk-why" rows={2} {...register("whyParked")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prk-followup">Follow-up</Label>
            <Textarea id="prk-followup" rows={2} {...register("followUp")} />
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
              {pending ? "Saving..." : editing ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
