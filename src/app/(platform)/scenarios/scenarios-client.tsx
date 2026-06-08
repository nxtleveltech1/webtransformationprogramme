"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, GitBranch, Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Can } from "@/components/shared/can";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MetricCard } from "@/components/shared/metric-card";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EmptyState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type {
  ScenarioChangeRow,
  ScenarioDetail,
  ScenarioTargetOption,
} from "@/lib/services/scenarios";
import {
  addScenarioChange,
  deleteScenario,
  deleteScenarioChange,
  upsertScenario,
} from "@/server/actions/scenarios";

type Targets = { tasks: ScenarioTargetOption[]; milestones: ScenarioTargetOption[] };

export function ScenariosClient({
  scenarios,
  targets,
}: {
  scenarios: ScenarioDetail[];
  targets: Targets;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ScenarioDetail | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<ScenarioDetail | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const selected = scenarios.find((s) => s.id === selectedId) ?? null;

  const activeCount = scenarios.filter((s) => s.status === "ACTIVE").length;
  const worstSlip = scenarios.reduce((max, s) => Math.max(max, s.impact.deltaDays), 0);

  function refresh() {
    router.refresh();
  }

  async function handleDeleteScenario() {
    if (!confirmDelete) return;
    setDeleting(true);
    const result = await deleteScenario({ id: confirmDelete.id });
    setDeleting(false);
    setConfirmDelete(null);
    if (result.ok) {
      toast.success(result.message ?? "Scenario deleted");
      if (selectedId === confirmDelete.id) setSelectedId(null);
      refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Scenarios" value={scenarios.length} icon={GitBranch} />
        <MetricCard label="Active" value={activeCount} icon={CalendarClock} tone="info" />
        <MetricCard
          label="Worst end-date slip"
          value={worstSlip > 0 ? `+${worstSlip}d` : "0d"}
          icon={TrendingUp}
          tone={worstSlip > 0 ? "danger" : "success"}
        />
      </div>

      <div className="flex justify-end">
        <Can action="create" entity="scenario">
          <Button
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="size-4" />
            New scenario
          </Button>
        </Can>
      </div>

      {scenarios.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No scenarios yet"
          description="Create a what-if scenario to model schedule changes against the live baseline."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <button key={s.id} type="button" className="text-left" onClick={() => setSelectedId(s.id)}>
              <Card className="hover:border-primary/40 h-full gap-3 transition-colors">
                <CardHeader className="gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">{s.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <ImpactPill impact={s.impact} />
                  <p className="text-muted-foreground text-xs">
                    {s.changeCount} what-if change{s.changeCount === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <ScenarioFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={editing}
        onSuccess={(msg) => {
          toast.success(msg);
          refresh();
        }}
      />

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.name ?? "Scenario"}
        description={selected?.description ?? undefined}
      >
        {selected && (
          <ScenarioDetailBody
            scenario={selected}
            targets={targets}
            onEdit={() => {
              setEditing(selected);
              setCreateOpen(true);
            }}
            onDelete={() => setConfirmDelete(selected)}
            onChanged={refresh}
          />
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete scenario?"
        description={
          confirmDelete
            ? `"${confirmDelete.name}" and its what-if changes will be permanently removed. Live task data is never affected.`
            : undefined
        }
        confirmLabel="Delete scenario"
        destructive
        loading={deleting}
        onConfirm={handleDeleteScenario}
      />
    </div>
  );
}

function ImpactPill({ impact }: { impact: ScenarioDetail["impact"] }) {
  if (!impact.computable) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Baseline not schedulable
      </Badge>
    );
  }
  const delta = impact.deltaDays;
  if (delta === 0) {
    return (
      <Badge variant="outline" className="text-rag-green border-rag-green/30">
        No end-date change
      </Badge>
    );
  }
  const slip = delta > 0;
  const Icon = slip ? TrendingUp : TrendingDown;
  return (
    <Badge
      className={
        slip
          ? "bg-rag-red/10 text-rag-red border-rag-red/30"
          : "bg-rag-green/10 text-rag-green border-rag-green/30"
      }
    >
      <Icon className="size-3.5" />
      {slip ? `+${delta}d later` : `${delta}d earlier`}
    </Badge>
  );
}

function ScenarioDetailBody({
  scenario,
  targets,
  onEdit,
  onDelete,
  onChanged,
}: {
  scenario: ScenarioDetail;
  targets: Targets;
  onEdit: () => void;
  onDelete: () => void;
  onChanged: () => void;
}) {
  // The drawer renders from the list snapshot; changes are fetched via the
  // detail summary embedded on the card. We re-read the live changes here by
  // reusing the summary impact, and manage add/remove through server actions.
  const [adding, setAdding] = React.useState(false);
  const [targetType, setTargetType] = React.useState<"TASK" | "MILESTONE">("TASK");
  const [targetId, setTargetId] = React.useState("");
  const [deltaDays, setDeltaDays] = React.useState("5");
  const [note, setNote] = React.useState("");
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const options = targetType === "TASK" ? targets.tasks : targets.milestones;

  async function handleAdd() {
    if (!targetId) {
      toast.error("Pick a task or milestone to adjust.");
      return;
    }
    const label = options.find((o) => o.id === targetId)?.label ?? null;
    setAdding(true);
    const result = await addScenarioChange({
      scenarioId: scenario.id,
      targetType,
      targetId,
      targetLabel: label,
      deltaDays,
      note,
    });
    setAdding(false);
    if (result.ok) {
      toast.success(result.message ?? "Change added");
      setTargetId("");
      setNote("");
      setDeltaDays("5");
      onChanged();
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    const result = await deleteScenarioChange({ id });
    setRemovingId(null);
    if (result.ok) {
      toast.success(result.message ?? "Change removed");
      onChanged();
    } else {
      toast.error(result.error);
    }
  }

  const impact = scenario.impact;

  return (
    <div className="space-y-6">
      {/* Impact summary */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium uppercase">
            Programme end date
          </span>
          <ImpactPill impact={impact} />
        </div>
        {impact.computable ? (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Baseline duration</p>
              <p className="text-lg font-semibold tabular-nums">{impact.baselineDays}d</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Scenario duration</p>
              <p className="text-lg font-semibold tabular-nums">{impact.scenarioDays}d</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mt-2 text-sm">
            The live baseline has no usable task durations to schedule, so an end-date impact can&apos;t be
            computed yet.
          </p>
        )}
        {impact.milestoneChanges > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            {impact.milestoneChanges} milestone change(s) are tracked for reference but sit outside the task
            dependency graph, so they don&apos;t move the computed critical path.
          </p>
        )}
      </div>

      {/* Existing changes */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">What-if changes ({scenario.changeCount})</h3>
        <ChangeList changes={scenario.changes} onRemove={handleRemove} removingId={removingId} />
      </div>

      {/* Add change */}
      <Can action="edit" entity="scenario">
        <div className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Add a what-if change</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Target type</Label>
              <Select
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as "TASK" | "MILESTONE");
                  setTargetId("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="MILESTONE">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="delta">Shift (days)</Label>
              <Input
                id="delta"
                type="number"
                value={deltaDays}
                onChange={(e) => setDeltaDays(e.target.value)}
                placeholder="+5 = extend, -5 = pull in"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>{targetType === "TASK" ? "Task" : "Milestone"}</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select a ${targetType.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {options.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    None available
                  </SelectItem>
                ) : (
                  options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                      {o.meta ? ` — ${o.meta}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Why this change is being modelled..."
            />
          </div>
          <Button onClick={handleAdd} disabled={adding}>
            <Plus className="size-4" />
            {adding ? "Adding..." : "Add change"}
          </Button>
        </div>
      </Can>

      {/* Scenario actions */}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Can action="edit" entity="scenario">
          <Button variant="outline" onClick={onEdit}>
            Edit scenario
          </Button>
        </Can>
        <Can action="delete" entity="scenario">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </Can>
      </div>
    </div>
  );
}

function ChangeList({
  changes,
  onRemove,
  removingId,
}: {
  changes: ScenarioChangeRow[];
  onRemove: (id: string) => void;
  removingId: string | null;
}) {
  if (changes.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No changes yet — add one below to model an impact.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {changes.map((c) => (
        <li key={c.id} className="flex items-start justify-between gap-3 rounded-md border px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {c.targetType === "TASK" ? "Task" : "Milestone"}
              </Badge>
              <span
                className={
                  "text-sm font-medium tabular-nums " +
                  (c.deltaDays > 0 ? "text-rag-red" : c.deltaDays < 0 ? "text-rag-green" : "")
                }
              >
                {c.deltaDays > 0 ? `+${c.deltaDays}` : c.deltaDays}d
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm">{c.targetLabel ?? c.targetId}</p>
            {c.note && <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{c.note}</p>}
          </div>
          <Can action="edit" entity="scenario">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove change"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => onRemove(c.id)}
              disabled={removingId === c.id}
            >
              <Trash2 className="size-4" />
            </Button>
          </Can>
        </li>
      ))}
    </ul>
  );
}

function ScenarioFormDialog({
  open,
  onOpenChange,
  initial,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ScenarioDetail | null;
  onSuccess: (message: string) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const mode = initial ? "edit" : "create";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await upsertScenario({
      id: initial?.id,
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      status: String(fd.get("status") ?? "DRAFT"),
    });
    setPending(false);
    if (result.ok) {
      onOpenChange(false);
      onSuccess(result.message ?? "Saved");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-om-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New scenario" : "Edit scenario"}</DialogTitle>
          <DialogDescription>
            A scenario groups what-if schedule changes modelled against the live baseline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="sc-name">Name</Label>
            <Input id="sc-name" name="name" defaultValue={initial?.name ?? ""} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-desc">Description</Label>
            <Textarea
              id="sc-desc"
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-status">Status</Label>
            <select
              id="sc-status"
              name="status"
              defaultValue={initial?.status ?? "DRAFT"}
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
            >
              {["DRAFT", "ACTIVE", "ARCHIVED"].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create scenario" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
