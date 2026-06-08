"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PRIORITY_OPTIONS, RAG_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/enums";
import { titleCase } from "@/lib/utils";
import {
  updateCriticalPathStep,
  updateRoadmapActivity,
  updateWbsTask,
} from "@/server/actions/schedule";
import { updateMilestone } from "@/server/actions/milestones";
import type {
  ActivityEditable,
  CriticalEditable,
  MilestoneEditable,
  ScheduleEditData,
  ScheduleEditOptions,
  WbsEditable,
} from "./types";

const NONE = "__none__";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function runSave(promise: Promise<ActionResult>, onSaved: () => void) {
  const res = await promise;
  if (res.ok) {
    toast.success(res.message ?? "Saved");
    onSaved();
  } else {
    toast.error(res.error);
  }
}

/** Field wrapper. */
function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

// --------------------------------------------------------------------------
// WBS task
// --------------------------------------------------------------------------
function WbsTaskFormDialog({
  open,
  onOpenChange,
  record,
  options,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  record: WbsEditable | null;
  options: ScheduleEditOptions;
  onSaved: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    rag: NONE,
    percentComplete: "0",
    forecastStartDate: "",
    forecastEndDate: "",
    baselineStartDate: "",
    baselineEndDate: "",
    durationDays: "",
    ownerPersonId: NONE,
    ownerText: "",
    workstreamId: NONE,
    blockers: "",
    acceptanceCriteria: "",
    criticalPath: false,
  });

  React.useEffect(() => {
    if (!open || !record) return;
    setForm({
      title: record.title,
      description: record.description ?? "",
      status: record.status,
      priority: record.priority,
      rag: record.rag ?? NONE,
      percentComplete: String(record.percentComplete ?? 0),
      forecastStartDate: record.forecastStartDate ?? "",
      forecastEndDate: record.forecastEndDate ?? "",
      baselineStartDate: record.baselineStartDate ?? "",
      baselineEndDate: record.baselineEndDate ?? "",
      durationDays: record.durationDays != null ? String(record.durationDays) : "",
      ownerPersonId: record.ownerPersonId ?? NONE,
      ownerText: record.ownerText ?? "",
      workstreamId: record.workstreamId ?? NONE,
      blockers: record.blockers ?? "",
      acceptanceCriteria: record.acceptanceCriteria ?? "",
      criticalPath: record.criticalPath,
    });
  }, [open, record]);

  if (!record) return null;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setPending(true);
    await runSave(
      updateWbsTask({
        id: record!.id,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        rag: form.rag === NONE ? "" : form.rag,
        percentComplete: form.percentComplete,
        forecastStartDate: form.forecastStartDate,
        forecastEndDate: form.forecastEndDate,
        baselineStartDate: form.baselineStartDate,
        baselineEndDate: form.baselineEndDate,
        durationDays: form.durationDays,
        ownerPersonId: form.ownerPersonId === NONE ? "" : form.ownerPersonId,
        ownerText: form.ownerText,
        workstreamId: form.workstreamId === NONE ? "" : form.workstreamId,
        blockers: form.blockers,
        acceptanceCriteria: form.acceptanceCriteria,
        criticalPath: form.criticalPath,
      }) as Promise<ActionResult>,
      onSaved,
    );
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {record.externalId}</DialogTitle>
          <DialogDescription>Update this WBS task.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" htmlFor="w-title">
            <Input
              id="w-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>
          <Field label="Description" htmlFor="w-desc">
            <Textarea
              id="w-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
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
            </Field>
            <Field label="RAG">
              <Select value={form.rag} onValueChange={(v) => set("rag", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {RAG_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {titleCase(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Forecast start" htmlFor="w-fs">
              <Input
                id="w-fs"
                value={form.forecastStartDate}
                onChange={(e) => set("forecastStartDate", e.target.value)}
                placeholder="2026-07-01"
              />
            </Field>
            <Field label="Forecast end" htmlFor="w-fe">
              <Input
                id="w-fe"
                value={form.forecastEndDate}
                onChange={(e) => set("forecastEndDate", e.target.value)}
                placeholder="2026-08-01"
              />
            </Field>
            <Field label="% complete" htmlFor="w-pct">
              <Input
                id="w-pct"
                type="number"
                min={0}
                max={100}
                value={form.percentComplete}
                onChange={(e) => set("percentComplete", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Baseline start" htmlFor="w-bs">
              <Input
                id="w-bs"
                value={form.baselineStartDate}
                onChange={(e) => set("baselineStartDate", e.target.value)}
              />
            </Field>
            <Field label="Baseline end" htmlFor="w-be">
              <Input
                id="w-be"
                value={form.baselineEndDate}
                onChange={(e) => set("baselineEndDate", e.target.value)}
              />
            </Field>
            <Field label="Duration (days)" htmlFor="w-dur">
              <Input
                id="w-dur"
                type="number"
                value={form.durationDays}
                onChange={(e) => set("durationDays", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <Select
                value={form.ownerPersonId}
                onValueChange={(v) => set("ownerPersonId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {options.people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Workstream">
              <Select
                value={form.workstreamId}
                onValueChange={(v) => set("workstreamId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.workstreams.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.code} · {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Owner (free text)" htmlFor="w-owner-text">
            <Input
              id="w-owner-text"
              value={form.ownerText}
              onChange={(e) => set("ownerText", e.target.value)}
              placeholder="Used when no person is selected"
            />
          </Field>
          <Field label="Blockers" htmlFor="w-blockers">
            <Textarea
              id="w-blockers"
              value={form.blockers}
              onChange={(e) => set("blockers", e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Acceptance criteria" htmlFor="w-accept">
            <Textarea
              id="w-accept"
              value={form.acceptanceCriteria}
              onChange={(e) => set("acceptanceCriteria", e.target.value)}
              rows={2}
            />
          </Field>

          <div className="flex items-center gap-2">
            <Switch
              id="w-critical"
              checked={form.criticalPath}
              onCheckedChange={(v) => set("criticalPath", v)}
            />
            <Label htmlFor="w-critical">On the critical path</Label>
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
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------
// Milestone
// --------------------------------------------------------------------------
function MilestoneFormDialog({
  open,
  onOpenChange,
  record,
  options,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  record: MilestoneEditable | null;
  options: ScheduleEditOptions;
  onSaved: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    targetDate: "",
    piGate: "",
    varianceDays: "",
    status: "",
    workstreamId: NONE,
    projectId: NONE,
    notes: "",
  });

  React.useEffect(() => {
    if (!open || !record) return;
    setForm({
      title: record.title,
      targetDate: record.targetDate ?? "",
      piGate: record.piGate ?? "",
      varianceDays: record.varianceDays != null ? String(record.varianceDays) : "",
      status: record.status ?? "",
      workstreamId: record.workstreamId ?? NONE,
      projectId: record.projectId ?? NONE,
      notes: record.notes ?? "",
    });
  }, [open, record]);

  if (!record) return null;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setPending(true);
    await runSave(
      updateMilestone({
        id: record!.id,
        title: form.title,
        targetDate: form.targetDate,
        piGate: form.piGate,
        varianceDays: form.varianceDays,
        status: form.status,
        workstreamId: form.workstreamId === NONE ? "" : form.workstreamId,
        projectId: form.projectId === NONE ? "" : form.projectId,
        notes: form.notes,
      }) as Promise<ActionResult>,
      onSaved,
    );
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit milestone</DialogTitle>
          <DialogDescription>Track a delivery milestone.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" htmlFor="ms-title">
            <Input
              id="ms-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Target date" htmlFor="ms-target">
              <Input
                id="ms-target"
                value={form.targetDate}
                onChange={(e) => set("targetDate", e.target.value)}
                placeholder="2026-09-30"
              />
            </Field>
            <Field label="PI gate" htmlFor="ms-pi">
              <Input
                id="ms-pi"
                value={form.piGate}
                onChange={(e) => set("piGate", e.target.value)}
                placeholder="PI-3"
              />
            </Field>
            <Field label="Variance (days)" htmlFor="ms-var">
              <Input
                id="ms-var"
                type="number"
                value={form.varianceDays}
                onChange={(e) => set("varianceDays", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Status" htmlFor="ms-status">
            <Input
              id="ms-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              placeholder="e.g. On track, At risk, Complete"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Workstream">
              <Select
                value={form.workstreamId}
                onValueChange={(v) => set("workstreamId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.workstreams.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.code} · {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Project">
              <Select value={form.projectId} onValueChange={(v) => set("projectId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {options.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code ? `${p.code} · ` : ""}
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Notes" htmlFor="ms-notes">
            <Textarea
              id="ms-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </Field>
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
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------
// Critical-path step
// --------------------------------------------------------------------------
function CriticalPathStepFormDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  record: CriticalEditable | null;
  onSaved: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    activity: "",
    ownerText: "",
    predecessor: "",
    dueDate: "",
    status: "",
    isCritical: false,
  });

  React.useEffect(() => {
    if (!open || !record) return;
    setForm({
      activity: record.activity,
      ownerText: record.ownerText ?? "",
      predecessor: record.predecessor ?? "",
      dueDate: record.dueDate ?? "",
      status: record.status ?? "",
      isCritical: record.isCritical,
    });
  }, [open, record]);

  if (!record) return null;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.activity.trim()) {
      toast.error("Activity is required");
      return;
    }
    setPending(true);
    await runSave(
      updateCriticalPathStep({
        id: record!.id,
        activity: form.activity,
        ownerText: form.ownerText,
        predecessor: form.predecessor,
        dueDate: form.dueDate,
        status: form.status,
        isCritical: form.isCritical,
      }) as Promise<ActionResult>,
      onSaved,
    );
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit critical-path step {record.stepNumber}</DialogTitle>
          <DialogDescription>Update this critical-path activity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Activity" htmlFor="cp-activity">
            <Textarea
              id="cp-activity"
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              rows={2}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner" htmlFor="cp-owner">
              <Input
                id="cp-owner"
                value={form.ownerText}
                onChange={(e) => set("ownerText", e.target.value)}
              />
            </Field>
            <Field label="Predecessor" htmlFor="cp-pred">
              <Input
                id="cp-pred"
                value={form.predecessor}
                onChange={(e) => set("predecessor", e.target.value)}
              />
            </Field>
            <Field label="Due date" htmlFor="cp-due">
              <Input
                id="cp-due"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                placeholder="2026-08-01"
              />
            </Field>
            <Field label="Status" htmlFor="cp-status">
              <Input
                id="cp-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cp-critical"
              checked={form.isCritical}
              onCheckedChange={(v) => set("isCritical", v)}
            />
            <Label htmlFor="cp-critical">Flagged critical</Label>
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
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------
// Roadmap activity
// --------------------------------------------------------------------------
function RoadmapActivityFormDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  record: ActivityEditable | null;
  onSaved: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    activity: "",
    workstream: "",
    ownerText: "",
    startDate: "",
    endDate: "",
    dependency: "",
    status: "",
    notes: "",
  });

  React.useEffect(() => {
    if (!open || !record) return;
    setForm({
      activity: record.activity,
      workstream: record.workstream ?? "",
      ownerText: record.ownerText ?? "",
      startDate: record.startDate ?? "",
      endDate: record.endDate ?? "",
      dependency: record.dependency ?? "",
      status: record.status ?? "",
      notes: record.notes ?? "",
    });
  }, [open, record]);

  if (!record) return null;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.activity.trim()) {
      toast.error("Activity is required");
      return;
    }
    setPending(true);
    await runSave(
      updateRoadmapActivity({
        id: record!.id,
        activity: form.activity,
        workstream: form.workstream,
        ownerText: form.ownerText,
        startDate: form.startDate,
        endDate: form.endDate,
        dependency: form.dependency,
        status: form.status,
        notes: form.notes,
      }) as Promise<ActionResult>,
      onSaved,
    );
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit roadmap activity</DialogTitle>
          <DialogDescription>Update this roadmap activity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Activity" htmlFor="ra-activity">
            <Textarea
              id="ra-activity"
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              rows={2}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Workstream" htmlFor="ra-ws">
              <Input
                id="ra-ws"
                value={form.workstream}
                onChange={(e) => set("workstream", e.target.value)}
              />
            </Field>
            <Field label="Owner" htmlFor="ra-owner">
              <Input
                id="ra-owner"
                value={form.ownerText}
                onChange={(e) => set("ownerText", e.target.value)}
              />
            </Field>
            <Field label="Start date" htmlFor="ra-start">
              <Input
                id="ra-start"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                placeholder="2026-07-01"
              />
            </Field>
            <Field label="End date" htmlFor="ra-end">
              <Input
                id="ra-end"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                placeholder="2026-08-01"
              />
            </Field>
          </div>
          <Field label="Dependency" htmlFor="ra-dep">
            <Input
              id="ra-dep"
              value={form.dependency}
              onChange={(e) => set("dependency", e.target.value)}
            />
          </Field>
          <Field label="Status" htmlFor="ra-status">
            <Input
              id="ra-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            />
          </Field>
          <Field label="Notes" htmlFor="ra-notes">
            <Textarea
              id="ra-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </Field>
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
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------
// Dispatcher
// --------------------------------------------------------------------------
export function ItemEditDialog({
  selected,
  data,
  options,
  onOpenChange,
  onSaved,
}: {
  selected: { id: string; kind: "wbs" | "milestone" | "critical" | "activity" } | null;
  data: ScheduleEditData;
  options: ScheduleEditOptions;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const kind = selected?.kind;
  const id = selected?.id;
  return (
    <>
      <WbsTaskFormDialog
        open={kind === "wbs"}
        onOpenChange={onOpenChange}
        record={kind === "wbs" && id ? (data.wbs[id] ?? null) : null}
        options={options}
        onSaved={onSaved}
      />
      <MilestoneFormDialog
        open={kind === "milestone"}
        onOpenChange={onOpenChange}
        record={kind === "milestone" && id ? (data.milestone[id] ?? null) : null}
        options={options}
        onSaved={onSaved}
      />
      <CriticalPathStepFormDialog
        open={kind === "critical"}
        onOpenChange={onOpenChange}
        record={kind === "critical" && id ? (data.critical[id] ?? null) : null}
        onSaved={onSaved}
      />
      <RoadmapActivityFormDialog
        open={kind === "activity"}
        onOpenChange={onOpenChange}
        record={kind === "activity" && id ? (data.activity[id] ?? null) : null}
        onSaved={onSaved}
      />
    </>
  );
}
