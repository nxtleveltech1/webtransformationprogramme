"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import { Users2, AlertTriangle, TrendingDown, Gauge, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type {
  ResourceWithWorkload,
  ResourceConstraintRecord,
  WorkloadFlag,
} from "@/lib/services/resources";
import { upsertResource } from "@/server/actions/resources";

const FLAG_META: Record<WorkloadFlag, { label: string; className: string; bar: string }> = {
  OVERLOADED: {
    label: "Overloaded",
    className: "bg-rag-red/10 text-rag-red border-rag-red/30",
    bar: "var(--rag-red)",
  },
  UNDERALLOCATED: {
    label: "Under-allocated",
    className: "bg-rag-amber/10 text-rag-amber border-rag-amber/30",
    bar: "var(--rag-amber)",
  },
  BALANCED: {
    label: "Balanced",
    className: "bg-rag-green/10 text-rag-green border-rag-green/30",
    bar: "var(--rag-green)",
  },
};

function WorkloadBadge({ flag }: { flag: WorkloadFlag }) {
  return <Badge className={FLAG_META[flag].className}>{FLAG_META[flag].label}</Badge>;
}

function WorkloadBar({ value }: { value: number }) {
  const tone =
    value > 100 ? "[&_[data-slot=progress-indicator]]:bg-rag-red"
    : value < 50 ? "[&_[data-slot=progress-indicator]]:bg-rag-amber"
    : "[&_[data-slot=progress-indicator]]:bg-rag-green";
  return (
    <div className="flex items-center gap-2">
      <Progress value={Math.min(value, 100)} className={cn("w-28", tone)} />
      <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">{value}%</span>
    </div>
  );
}

type AllocationRow = ResourceWithWorkload["allocations"][number] & {
  resourceName: string;
};

export function ResourcesClient({
  resources,
  summary,
  constraints = [],
}: {
  resources: ResourceWithWorkload[];
  summary: { total: number; overloaded: number; underallocated: number; avgAllocation: number };
  constraints?: ResourceConstraintRecord[];
}) {
  const [selected, setSelected] = React.useState<ResourceWithWorkload | null>(null);
  const [editing, setEditing] = React.useState<ResourceWithWorkload | null>(null);
  const [creating, setCreating] = React.useState(false);

  const allocationRows: AllocationRow[] = React.useMemo(
    () =>
      resources.flatMap((r) =>
        r.allocations.map((a) => ({ ...a, resourceName: r.displayName })),
      ),
    [resources],
  );

  const chartData = React.useMemo(
    () =>
      [...resources]
        .sort((a, b) => b.totalAllocationPct - a.totalAllocationPct)
        .slice(0, 12)
        .map((r) => ({
          id: r.id,
          name: r.displayName,
          allocation: r.totalAllocationPct,
          flag: r.flag,
        })),
    [resources],
  );

  const chartConfig: ChartConfig = {
    allocation: { label: "Allocation %" },
  };

  const resourceColumns: ColumnDef<ResourceWithWorkload>[] = [
    {
      accessorKey: "displayName",
      header: "Resource",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.displayName}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role ?? "\u2014",
    },
    {
      accessorKey: "team",
      header: "Team",
      cell: ({ row }) => row.original.team ?? "\u2014",
    },
    {
      accessorKey: "capacityHours",
      header: "Capacity (h)",
      cell: ({ row }) => row.original.capacityHours ?? "\u2014",
    },
    {
      id: "workload",
      accessorFn: (r) => r.totalAllocationPct,
      header: "Workload",
      cell: ({ row }) => <WorkloadBar value={row.original.totalAllocationPct} />,
    },
    {
      id: "flag",
      header: "Status",
      accessorFn: (r) => r.flag,
      cell: ({ row }) => <WorkloadBadge flag={row.original.flag} />,
    },
  ];

  const allocationColumns: ColumnDef<AllocationRow>[] = [
    {
      accessorKey: "resourceName",
      header: "Resource",
      cell: ({ row }) => <span className="font-medium">{row.original.resourceName}</span>,
    },
    {
      accessorKey: "projectName",
      header: "Project",
      cell: ({ row }) =>
        row.original.projectName ?? row.original.projectId ?? "\u2014",
    },
    {
      accessorKey: "workstreamCode",
      header: "Workstream",
      cell: ({ row }) => row.original.workstreamCode ?? "\u2014",
    },
    {
      accessorKey: "roleOnWork",
      header: "Role on work",
      cell: ({ row }) => row.original.roleOnWork ?? "\u2014",
    },
    {
      accessorKey: "allocationPct",
      header: "Allocation",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.allocationPct}%</span>
      ),
    },
  ];

  const exportRows = resources.map((r) => ({
    name: r.displayName,
    role: r.role ?? "",
    team: r.team ?? "",
    capacityHours: r.capacityHours ?? "",
    totalAllocationPct: r.totalAllocationPct,
    status: FLAG_META[r.flag].label,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Resource capacity and workload across the programme. Workload sums allocation across all assignments."
        actions={
          <>
            <ExportButton rows={exportRows} filename="resources" entity="resource" />
            <Can action="create" entity="resource">
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                New resource
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Resources" value={summary.total} icon={Users2} />
        <MetricCard
          label="Overloaded"
          value={summary.overloaded}
          icon={AlertTriangle}
          tone="danger"
          hint=">100% allocated"
        />
        <MetricCard
          label="Under-allocated"
          value={summary.underallocated}
          icon={TrendingDown}
          tone="warning"
          hint="<50% allocated"
        />
        <MetricCard
          label="Avg allocation"
          value={`${summary.avgAllocation}%`}
          icon={Gauge}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workload by resource</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length ? (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} width={40} unit="%" />
                <ReferenceLine y={100} stroke="var(--rag-red)" strokeDasharray="4 4" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="allocation" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={FLAG_META[entry.flag].bar} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No workload data available.
            </p>
          )}
        </CardContent>
      </Card>

      {constraints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="text-muted-foreground size-4" />
              Capacity &amp; throughput signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {constraints.map((c) => {
                const heading = c.role ?? c.namedResource ?? "Unspecified";
                const showSub = Boolean(c.role && c.namedResource);
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2 rounded-lg border px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{heading}</p>
                        {showSub && (
                          <p className="text-muted-foreground truncate text-xs">
                            {c.namedResource}
                          </p>
                        )}
                      </div>
                      {c.confirmedVsSuggested && (
                        <Badge variant="outline" className="shrink-0">
                          {c.confirmedVsSuggested}
                        </Badge>
                      )}
                    </div>
                    {c.capacityConcern && (
                      <p className="text-muted-foreground text-sm">{c.capacityConcern}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>
        <TabsContent value="resources" className="pt-4">
          <DataTable
            columns={resourceColumns}
            data={resources}
            searchPlaceholder="Search resources..."
            onRowClick={(r) => setSelected(r)}
            emptyTitle="No resources"
            emptyDescription="No resources have been added to the programme yet."
          />
        </TabsContent>
        <TabsContent value="allocations" className="pt-4">
          <DataTable
            columns={allocationColumns}
            data={allocationRows}
            searchPlaceholder="Search allocations..."
            emptyTitle="No allocations"
            emptyDescription="No resource allocations recorded yet."
          />
        </TabsContent>
      </Tabs>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.displayName ?? "Resource"}
        description={selected?.role ?? undefined}
        footer={
          selected ? (
            <Can action="edit" entity="resource">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
              >
                <Pencil className="size-4" />
                Edit resource
              </Button>
            </Can>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Team">{selected.team ?? "\u2014"}</DetailField>
              <DetailField label="Capacity (hours)">
                {selected.capacityHours ?? "\u2014"}
              </DetailField>
              <DetailField label="Total allocation">
                {selected.totalAllocationPct}%
              </DetailField>
              <DetailField label="Status">
                <WorkloadBadge flag={selected.flag} />
              </DetailField>
              <DetailField label="Linked person">
                {selected.person?.displayName ?? "\u2014"}
              </DetailField>
              <DetailField label="Assignments">
                {selected.allocations.length}
              </DetailField>
            </DetailGrid>
            {selected.notes && (
              <DetailField label="Notes">{selected.notes}</DetailField>
            )}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Allocations</h3>
              {selected.allocations.length ? (
                <ul className="space-y-2">
                  {selected.allocations.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {a.projectName ?? a.workstreamCode ?? "Unassigned"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {a.roleOnWork ?? "\u2014"}
                        </p>
                      </div>
                      <span className="shrink-0 tabular-nums">{a.allocationPct}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No allocations recorded.</p>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <ResourceFormDialog
        open={creating || !!editing}
        resource={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function ResourceFormDialog({
  open,
  resource,
  onClose,
}: {
  open: boolean;
  resource: ResourceWithWorkload | null;
  onClose: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const isEdit = !!resource;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: resource?.id,
      displayName: String(fd.get("displayName") ?? ""),
      role: String(fd.get("role") ?? ""),
      team: String(fd.get("team") ?? ""),
      capacityHours: fd.get("capacityHours") ? Number(fd.get("capacityHours")) : null,
      notes: String(fd.get("notes") ?? ""),
    };
    const result = await upsertResource(payload);
    setPending(false);
    if (result.ok) {
      toast.success(result.message ?? "Saved");
      onClose();
    } else {
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit resource" : "New resource"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update resource details and capacity."
                : "Add a new resource to the programme."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={resource?.displayName ?? ""}
                required
              />
              {errors.displayName && (
                <p className="text-rag-red text-xs">{errors.displayName[0]}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue={resource?.role ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Team</Label>
                <Input id="team" name="team" defaultValue={resource?.team ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacityHours">Capacity (hours)</Label>
              <Input
                id="capacityHours"
                name="capacityHours"
                type="number"
                min={0}
                defaultValue={resource?.capacityHours ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={resource?.notes ?? ""} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
