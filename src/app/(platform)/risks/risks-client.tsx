"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Plus, ShieldAlert, Flame, Pencil } from "lucide-react";

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
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { RelatedLinks } from "@/components/shared/related-links";
import type { RelatedLink } from "@/lib/services/register-links";

import { formatOwnerDisplay } from "@/lib/format-person";
import { cn, formatDate, titleCase } from "@/lib/utils";
import {
  RISK_CATEGORY_OPTIONS,
  PROBABILITY_OPTIONS,
  IMPACT_OPTIONS,
  LEVEL_WEIGHT,
  riskScore,
} from "@/lib/enums";
import {
  riskSchema,
  RISK_STATUS_OPTIONS,
  type RiskFormValues,
} from "@/lib/validation/risks";
import type { RiskRow } from "@/lib/services/risks";
import type { PersonOption } from "@/lib/services/registers";
import { createRisk, updateRisk, escalateRisk } from "@/server/actions/risks";

const SCORE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

function scoreTone(score: number): "danger" | "warning" | "info" | "muted" {
  if (score >= 6) return "danger";
  if (score >= 3) return "warning";
  if (score >= 1) return "info";
  return "muted";
}

function ScoreBadge({ score }: { score: number }) {
  const tone = scoreTone(score);
  const cls: Record<typeof tone, string> = {
    danger: "bg-rag-red/10 text-rag-red border-rag-red/30",
    warning: "bg-rag-amber/10 text-rag-amber border-rag-amber/30",
    info: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    muted: "bg-muted text-muted-foreground border-transparent",
  };
  return (
    <Badge className={cn("tabular-nums", cls[tone])}>{score}</Badge>
  );
}

export function RisksClient({
  risks,
  people,
  linksMap = {},
}: {
  risks: RiskRow[];
  people: PersonOption[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<RiskRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RiskRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (risk: RiskRow) => {
    setEditing(risk);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (risk: RiskRow) => {
    setSelected(risk);
    setDrawerOpen(true);
  };

  const handleEscalate = (risk: RiskRow) => {
    startTransition(async () => {
      const res = await escalateRisk({ id: risk.id });
      if (res.ok) {
        toast.success(res.message ?? "Risk escalated");
        setDrawerOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const metrics = React.useMemo(() => {
    const open = risks.filter(
      (r) => !/closed/i.test(r.status),
    ).length;
    const high = risks.filter(
      (r) => riskScore(r.probability, r.impact) >= 6,
    ).length;
    const escalated = risks.filter((r) => /escal/i.test(r.status)).length;
    return { total: risks.length, open, high, escalated };
  }, [risks]);

  const heatmap = React.useMemo(() => {
    const grid: Record<string, RiskRow[]> = {};
    for (const p of SCORE_LEVELS) {
      for (const i of SCORE_LEVELS) grid[`${p}-${i}`] = [];
    }
    for (const r of risks) {
      const key = `${r.probability}-${r.impact}`;
      if (grid[key]) grid[key].push(r);
    }
    return grid;
  }, [risks]);

  const columns = React.useMemo<ColumnDef<RiskRow>[]>(
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
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm">{titleCase(row.original.category)}</span>
        ),
      },
      {
        id: "score",
        header: "Score",
        accessorFn: (r) => riskScore(r.probability, r.impact),
        cell: ({ row }) => (
          <ScoreBadge
            score={riskScore(row.original.probability, row.original.impact)}
          />
        ),
        sortingFn: (a, b) =>
          riskScore(a.original.probability, a.original.impact) -
          riskScore(b.original.probability, b.original.impact),
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
      risks.map((r) => ({
        id: r.externalId,
        description: r.description,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        score: riskScore(r.probability, r.impact),
        owner: formatOwnerDisplay(r.ownerText, r.ownerPerson),
        status: r.status,
        dueDate: r.dueDate ?? "",
      })),
    [risks],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Register"
        description="Programme risks scored by probability x impact, with owners, mitigation and escalation."
        actions={
          <>
            <ExportButton rows={exportRows} filename="risks" entity="risk" />
            <Can action="create" entity="risk">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New risk
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total risks" value={metrics.total} icon={ShieldAlert} />
        <MetricCard label="Open" value={metrics.open} icon={AlertTriangle} tone="info" />
        <MetricCard
          label="High severity (score >= 6)"
          value={metrics.high}
          icon={Flame}
          tone="danger"
        />
        <MetricCard
          label="Escalated"
          value={metrics.escalated}
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <RiskHeatmap grid={heatmap} onSelect={openDetail} />

      <DataTable
        columns={columns}
        data={risks}
        mappingColumns
        tableKey="risks"
        searchPlaceholder="Search risks..."
        onRowClick={openDetail}
        emptyTitle="No risks recorded"
        emptyDescription="Create the first risk to start tracking programme exposure."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Risk"}
        description={selected?.description}
        footer={
          selected && (
            <div className="flex justify-end gap-2">
              <Can action="escalate" entity="risk">
                <Button
                  variant="outline"
                  onClick={() => handleEscalate(selected)}
                  disabled={pending || /escal/i.test(selected.status)}
                >
                  <Flame className="size-4" />
                  Escalate
                </Button>
              </Can>
              <Can action="edit" entity="risk">
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
              <DetailField label="Category">
                {titleCase(selected.category)}
              </DetailField>
              <DetailField label="Status">
                <StatusBadge status={selected.status} />
              </DetailField>
              <DetailField label="Probability">
                {titleCase(selected.probability)}
              </DetailField>
              <DetailField label="Impact">
                {titleCase(selected.impact)}
              </DetailField>
              <DetailField label="Risk score">
                <ScoreBadge
                  score={riskScore(selected.probability, selected.impact)}
                />
              </DetailField>
              <DetailField label="Owner">
                {formatOwnerDisplay(selected.ownerText, selected.ownerPerson)}
              </DetailField>
              <DetailField label="Workstream">
                {selected.workstream?.name ?? "\u2014"}
              </DetailField>
              <DetailField label="Due date">
                {selected.dueDate ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Description">{selected.description}</DetailField>
            <DetailField label="Mitigation discussed">
              {selected.mitigationDiscussed ?? "\u2014"}
            </DetailField>
            <DetailField label="Mitigation required">
              {selected.mitigationRequired ?? "\u2014"}
            </DetailField>
            <DetailField label="Escalation required">
              {selected.escalationRequired ?? "\u2014"}
            </DetailField>
            <DetailGrid>
              <DetailField label="Source / trace">
                {selected.traceRef ?? "\u2014"}
              </DetailField>
              <DetailField label="Recorded">
                {formatDate(selected.createdAt)}
              </DetailField>
            </DetailGrid>
            <RelatedLinks links={linksMap[selected.externalId] ?? []} />
          </div>
        )}
      </DetailDrawer>

      <RiskFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        people={people}
      />
    </div>
  );
}

function RiskHeatmap({
  grid,
  onSelect,
}: {
  grid: Record<string, RiskRow[]>;
  onSelect: (risk: RiskRow) => void;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-base font-semibold">Risk heatmap</h2>
      <div className="flex gap-3">
        <div className="flex flex-col justify-around py-6 text-xs font-medium">
          <span className="text-muted-foreground -rotate-90 whitespace-nowrap">
            Impact
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1">
            <div />
            {SCORE_LEVELS.map((p) => (
              <div
                key={p}
                className="text-muted-foreground pb-1 text-center text-xs font-medium"
              >
                {titleCase(p)}
              </div>
            ))}
            {SCORE_LEVELS.map((impact) => (
              <React.Fragment key={impact}>
                <div className="text-muted-foreground flex items-center pr-2 text-xs font-medium">
                  {titleCase(impact)}
                </div>
                {SCORE_LEVELS.map((prob) => {
                  const items = grid[`${prob}-${impact}`] ?? [];
                  const score =
                    (LEVEL_WEIGHT[prob] ?? 0) * (LEVEL_WEIGHT[impact] ?? 0);
                  const tone = scoreTone(score);
                  const bg: Record<typeof tone, string> = {
                    danger: "bg-rag-red/15 hover:bg-rag-red/25",
                    warning: "bg-rag-amber/15 hover:bg-rag-amber/25",
                    info: "bg-chart-3/15 hover:bg-chart-3/25",
                    muted: "bg-muted hover:bg-muted/80",
                  };
                  return (
                    <div
                      key={`${prob}-${impact}`}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center rounded-md p-2 text-center transition-colors",
                        bg[tone],
                      )}
                    >
                      <span className="text-lg font-semibold tabular-nums">
                        {items.length}
                      </span>
                      <div className="mt-1 flex flex-wrap justify-center gap-1">
                        {items.slice(0, 4).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => onSelect(r)}
                            className="bg-background/70 hover:bg-background rounded px-1 font-mono text-[10px]"
                            aria-label={`Open ${r.externalId}`}
                          >
                            {r.externalId}
                          </button>
                        ))}
                        {items.length > 4 && (
                          <span className="text-muted-foreground text-[10px]">
                            +{items.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Probability
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskFormDialog({
  open,
  onOpenChange,
  editing,
  people,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: RiskRow | null;
  people: PersonOption[];
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RiskFormValues>({
    resolver: zodResolver(riskSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          description: editing.description,
          category: editing.category,
          probability: editing.probability,
          impact: editing.impact,
          status: editing.status,
          ownerPersonId: editing.ownerPersonId ?? "",
          ownerText: editing.ownerText ?? "",
          mitigationDiscussed: editing.mitigationDiscussed ?? "",
          mitigationRequired: editing.mitigationRequired ?? "",
          escalationRequired: editing.escalationRequired ?? "",
          dueDate: editing.dueDate ?? "",
        }
      : {
          description: "",
          category: "BUSINESS",
          probability: "MEDIUM",
          impact: "MEDIUM",
          status: "Open",
          ownerPersonId: "",
          ownerText: "",
          mitigationDiscussed: "",
          mitigationRequired: "",
          escalationRequired: "",
          dueDate: "",
        },
  });

  const onSubmit = (values: RiskFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateRisk(values)
        : await createRisk(values);
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
          <DialogTitle>{editing ? "Edit risk" : "New risk"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Record a new programme risk. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="risk-description">Description</Label>
            <Textarea
              id="risk-description"
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
              <Label>Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) =>
                  setValue("category", v as RiskFormValues["category"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {titleCase(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Probability</Label>
              <Select
                value={watch("probability")}
                onValueChange={(v) =>
                  setValue("probability", v as RiskFormValues["probability"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select probability" />
                </SelectTrigger>
                <SelectContent>
                  {PROBABILITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {titleCase(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Impact</Label>
              <Select
                value={watch("impact")}
                onValueChange={(v) =>
                  setValue("impact", v as RiskFormValues["impact"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  {IMPACT_OPTIONS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {titleCase(i)}
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
              <Label htmlFor="risk-due">Due date</Label>
              <Input id="risk-due" {...register("dueDate")} placeholder="e.g. Day 2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="risk-owner-text">Owner (free text, optional)</Label>
            <Input
              id="risk-owner-text"
              {...register("ownerText")}
              placeholder="Used when owner is not a listed person"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="risk-mit-discussed">Mitigation discussed</Label>
            <Textarea id="risk-mit-discussed" rows={2} {...register("mitigationDiscussed")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-mit-required">Mitigation required</Label>
            <Textarea id="risk-mit-required" rows={2} {...register("mitigationRequired")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-escalation">Escalation required</Label>
            <Input id="risk-escalation" {...register("escalationRequired")} />
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
              {pending ? "Saving..." : editing ? "Save changes" : "Create risk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
