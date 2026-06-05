"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  LayoutGrid,
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  Table as TableIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  TabsContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
import { EmptyState } from "@/components/shared/states";
import { Can } from "@/components/shared/can";
import { ACTION_STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/enums";
import { formatOwnerDisplay } from "@/lib/format-person";
import { cn, formatDate, titleCase } from "@/lib/utils";
import type {
  PersonOption,
  TaskWithRelations,
  WorkstreamOption,
} from "@/lib/services/tasks";
import {
  createTask,
  updateTask,
  updateTaskStatus,
} from "@/server/actions/tasks";

const NONE = "__none__";
const ALL = "ALL";

const BOARD_COLUMNS: {
  id: string;
  label: string;
  statuses: string[];
  setStatus: (typeof ACTION_STATUS_OPTIONS)[number];
}[] = [
  {
    id: "TODO",
    label: "Open / New",
    statuses: ["OPEN", "NEW", "UNCONFIRMED", "SUGGESTED"],
    setStatus: "NEW",
  },
  { id: "IN_PROGRESS", label: "In Progress", statuses: ["IN_PROGRESS"], setStatus: "IN_PROGRESS" },
  { id: "BLOCKED", label: "Blocked", statuses: ["BLOCKED"], setStatus: "BLOCKED" },
  { id: "DONE", label: "Done", statuses: ["DONE"], setStatus: "DONE" },
];

const MOVE_TARGETS: (typeof ACTION_STATUS_OPTIONS)[number][] = [
  "NEW",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
];

function isEscalated(task: TaskWithRelations): boolean {
  return task.priority === "CRITICAL" || task.status === "BLOCKED";
}

function ownerLabel(task: TaskWithRelations): string {
  return formatOwnerDisplay(task.ownerText, task.ownerPerson);
}

export function TasksClient({
  tasks,
  people,
  workstreams,
}: {
  tasks: TaskWithRelations[];
  people: PersonOption[];
  workstreams: WorkstreamOption[];
}) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  const [priorityFilter, setPriorityFilter] = React.useState<string>(ALL);
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [workstreamFilter, setWorkstreamFilter] = React.useState<string>(ALL);
  const [myOnly, setMyOnly] = React.useState(false);

  const [selected, setSelected] = React.useState<TaskWithRelations | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskWithRelations | null>(null);

  // "My tasks" heuristic: the owner holding the most assigned actions stands in
  // for the signed-in user until auth wiring lands.
  const myPerson = React.useMemo(() => {
    const counts = new Map<string, { id: string; name: string; n: number }>();
    for (const t of tasks) {
      if (!t.ownerPersonId) continue;
      const entry = counts.get(t.ownerPersonId) ?? {
        id: t.ownerPersonId,
        name: t.ownerPerson?.displayName ?? "Me",
        n: 0,
      };
      entry.n += 1;
      counts.set(t.ownerPersonId, entry);
    }
    let top: { id: string; name: string; n: number } | null = null;
    for (const v of counts.values()) {
      if (!top || v.n > top.n) top = v;
    }
    return top;
  }, [tasks]);

  const filtered = React.useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== ALL && t.priority !== priorityFilter) return false;
      if (statusFilter !== ALL && t.status !== statusFilter) return false;
      if (workstreamFilter !== ALL && t.workstreamId !== workstreamFilter) return false;
      if (myOnly && (!myPerson || t.ownerPersonId !== myPerson.id)) return false;
      return true;
    });
  }, [tasks, priorityFilter, statusFilter, workstreamFilter, myOnly, myPerson]);

  const metrics = React.useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const escalated = tasks.filter(isEscalated).length;
    return { total, inProgress, blocked, done, escalated };
  }, [tasks]);

  const exportRows = React.useMemo(
    () =>
      filtered.map((t) => ({
        id: t.externalId,
        description: t.description,
        area: t.area ?? "",
        owner: ownerLabel(t),
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ?? "",
        workstream: t.workstream?.name ?? "",
      })),
    [filtered],
  );

  function openDetail(task: TaskWithRelations) {
    setSelected(task);
    setDrawerOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskWithRelations) {
    setEditing(task);
    setDrawerOpen(false);
    setFormOpen(true);
  }

  function runStatusChange(
    id: string,
    status: (typeof ACTION_STATUS_OPTIONS)[number],
  ) {
    startTransition(async () => {
      const res = await updateTaskStatus({ id, status });
      if (res.ok) {
        toast.success(res.message ?? "Status updated");
        setDrawerOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const columns: ColumnDef<TaskWithRelations>[] = [
    {
      id: "externalId",
      accessorFn: (r) => r.externalId,
      header: "ID",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            {t.externalId}
            {isEscalated(t) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle
                    className="text-rag-red size-3.5"
                    aria-label="Escalation: critical or blocked"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {t.priority === "CRITICAL" ? "Critical priority" : "Blocked"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      id: "description",
      accessorFn: (r) => r.description,
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-sm text-sm">
          {row.original.description}
        </span>
      ),
    },
    {
      id: "area",
      accessorFn: (r) => r.area ?? "",
      header: "Area",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.area ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "owner",
      accessorFn: (r) => ownerLabel(r),
      header: "Owner",
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{ownerLabel(row.original)}</span>
      ),
    },
    {
      id: "priority",
      accessorFn: (r) => r.priority,
      header: "Priority",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: "status",
      accessorFn: (r) => r.status,
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
      id: "workstream",
      accessorFn: (r) => r.workstream?.name ?? "",
      header: "Workstream",
      cell: ({ row }) =>
        row.original.workstream ? (
          <Badge variant="outline" className="whitespace-nowrap">
            {row.original.workstream.code}
          </Badge>
        ) : (
          <span className="text-muted-foreground">{"\u2014"}</span>
        ),
    },
  ];

  const filterBar = (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        label="Priority"
        value={priorityFilter}
        onChange={setPriorityFilter}
        options={PRIORITY_OPTIONS}
      />
      <FilterSelect
        label="Status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={ACTION_STATUS_OPTIONS}
      />
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Workstream</Label>
        <Select value={workstreamFilter} onValueChange={setWorkstreamFilter}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="All workstreams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All workstreams</SelectItem>
            {workstreams.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.code} · {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 pb-1.5">
        <Switch
          id="my-tasks"
          checked={myOnly}
          onCheckedChange={setMyOnly}
          disabled={!myPerson}
        />
        <Label htmlFor="my-tasks" className="text-sm">
          My tasks{myPerson ? ` (${myPerson.name})` : ""}
        </Label>
      </div>
      {(priorityFilter !== ALL ||
        statusFilter !== ALL ||
        workstreamFilter !== ALL ||
        myOnly) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPriorityFilter(ALL);
            setStatusFilter(ALL);
            setWorkstreamFilter(ALL);
            setMyOnly(false);
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Tasks & Actions"
        description="Track and progress workshop actions across the programme. Switch between a sortable table and a Kanban board."
        actions={
          <div className="flex items-center gap-2">
            <ExportButton
              rows={exportRows}
              filename="tasks"
              entity="task"
            />
            <Can action="create" entity="task">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New task
              </Button>
            </Can>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total actions" value={metrics.total} icon={ListChecks} />
        <MetricCard
          label="In progress"
          value={metrics.inProgress}
          icon={Clock}
          tone="info"
        />
        <MetricCard
          label="Blocked"
          value={metrics.blocked}
          icon={CircleDashed}
          tone="danger"
        />
        <MetricCard
          label="Done"
          value={metrics.done}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Escalations"
          value={metrics.escalated}
          icon={AlertTriangle}
          tone="warning"
          hint="Critical or blocked"
        />
      </div>

      {filterBar}

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">
            <TableIcon className="size-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="board">
            <LayoutGrid className="size-4" />
            Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Search actions..."
            onRowClick={openDetail}
            emptyTitle="No actions match these filters"
            emptyDescription="Adjust the filters above or create a new task."
          />
        </TabsContent>

        <TabsContent value="board">
          <TaskBoard
            tasks={filtered}
            onOpen={openDetail}
            onMove={runStatusChange}
          />
        </TabsContent>
      </Tabs>

      <TaskDetailDrawer
        task={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={openEdit}
        onComplete={(id) => runStatusChange(id, "DONE")}
      />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        people={people}
        workstreams={workstreams}
        onSaved={() => {
          setFormOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40" size="sm">
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {titleCase(o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TaskBoard({
  tasks,
  onOpen,
  onMove,
}: {
  tasks: TaskWithRelations[];
  onOpen: (t: TaskWithRelations) => void;
  onMove: (id: string, status: (typeof ACTION_STATUS_OPTIONS)[number]) => void;
}) {
  if (!tasks.length) {
    return (
      <EmptyState
        title="No actions to display"
        description="Adjust the filters or create a task to populate the board."
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {BOARD_COLUMNS.map((col) => {
        const items = tasks.filter((t) => col.statuses.includes(t.status));
        return (
          <div key={col.id} className="bg-muted/30 flex flex-col rounded-xl border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">{col.label}</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {items.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-xs">
                  Nothing here
                </p>
              ) : (
                items.map((t) => (
                  <BoardCard
                    key={t.id}
                    task={t}
                    columnStatus={col.setStatus}
                    onOpen={onOpen}
                    onMove={onMove}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({
  task,
  columnStatus,
  onOpen,
  onMove,
}: {
  task: TaskWithRelations;
  columnStatus: (typeof ACTION_STATUS_OPTIONS)[number];
  onOpen: (t: TaskWithRelations) => void;
  onMove: (id: string, status: (typeof ACTION_STATUS_OPTIONS)[number]) => void;
}) {
  return (
    <div
      className={cn(
        "bg-background rounded-lg border p-3 shadow-xs transition-colors",
        isEscalated(task) && "border-rag-red/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="hover:text-primary text-left text-xs font-medium"
        >
          {task.externalId}
        </button>
        <Can action="edit" entity="task">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label="Change status"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {MOVE_TARGETS.filter((s) => s !== columnStatus || task.status !== s).map(
                (s) => (
                  <DropdownMenuItem key={s} onClick={() => onMove(task.id, s)}>
                    {titleCase(s)}
                  </DropdownMenuItem>
                ),
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOpen(task)}>
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Can>
      </div>
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="mt-1 block text-left"
      >
        <p className="line-clamp-3 text-sm">{task.description}</p>
      </button>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.workstream && (
          <Badge variant="outline">{task.workstream.code}</Badge>
        )}
      </div>
      <p className="text-muted-foreground mt-2 truncate text-xs">
        {ownerLabel(task)}
        {task.dueDate ? ` · Due ${task.dueDate}` : ""}
      </p>
    </div>
  );
}

function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  onEdit,
  onComplete,
}: {
  task: TaskWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (t: TaskWithRelations) => void;
  onComplete: (id: string) => void;
}) {
  if (!task) return null;
  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={task.externalId}
      description={task.area ?? undefined}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isEscalated(task) ? (
            <span className="text-rag-red inline-flex items-center gap-1.5 text-sm font-medium">
              <AlertTriangle className="size-4" />
              Escalation flagged
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Can action="edit" entity="task">
              <Button variant="outline" onClick={() => onEdit(task)}>
                <Pencil className="size-4" />
                Edit
              </Button>
            </Can>
            {task.status !== "DONE" && (
              <Can action="edit" entity="task">
                <Button onClick={() => onComplete(task.id)}>
                  <CheckCircle2 className="size-4" />
                  Mark done
                </Button>
              </Can>
            )}
          </div>
        </div>
      }
    >
      <p className="text-sm leading-relaxed">{task.description}</p>
      <DetailGrid>
        <DetailField label="Status">
          <StatusBadge status={task.status} />
        </DetailField>
        <DetailField label="Priority">
          <PriorityBadge priority={task.priority} />
        </DetailField>
        <DetailField label="Owner">{ownerLabel(task)}</DetailField>
        <DetailField label="Due date">{task.dueDate ?? "\u2014"}</DetailField>
        <DetailField label="Workstream">
          {task.workstream ? `${task.workstream.code} · ${task.workstream.name}` : "\u2014"}
        </DetailField>
        <DetailField label="Project">{task.project?.name ?? "\u2014"}</DetailField>
        <DetailField label="Area">{task.area ?? "\u2014"}</DetailField>
        <DetailField label="Updated">{formatDate(task.updatedAt)}</DetailField>
      </DetailGrid>
      {task.acceptanceCriteria && (
        <DetailField label="Acceptance criteria">
          <p className="whitespace-pre-wrap">{task.acceptanceCriteria}</p>
        </DetailField>
      )}
      {task.expectedOutput && (
        <DetailField label="Expected output">
          <p className="whitespace-pre-wrap">{task.expectedOutput}</p>
        </DetailField>
      )}
      {task.notes && (
        <DetailField label="Notes">
          <p className="whitespace-pre-wrap">{task.notes}</p>
        </DetailField>
      )}
    </DetailDrawer>
  );
}

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  people,
  workstreams,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
  people: PersonOption[];
  workstreams: WorkstreamOption[];
  onSaved: () => void;
}) {
  const isEdit = Boolean(task);
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    description: "",
    area: "",
    priority: "MEDIUM" as string,
    status: "NEW" as string,
    ownerPersonId: NONE,
    ownerText: "",
    dueDate: "",
    workstreamId: NONE,
    notes: "",
    acceptanceCriteria: "",
    expectedOutput: "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      description: task?.description ?? "",
      area: task?.area ?? "",
      priority: task?.priority ?? "MEDIUM",
      status: task?.status ?? "NEW",
      ownerPersonId: task?.ownerPersonId ?? NONE,
      ownerText: task?.ownerText ?? "",
      dueDate: task?.dueDate ?? "",
      workstreamId: task?.workstreamId ?? NONE,
      notes: task?.notes ?? "",
      acceptanceCriteria: task?.acceptanceCriteria ?? "",
      expectedOutput: task?.expectedOutput ?? "",
    });
  }, [open, task]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    setPending(true);
    const payload = {
      description: form.description,
      area: form.area || undefined,
      priority: form.priority,
      status: form.status,
      ownerPersonId: form.ownerPersonId === NONE ? undefined : form.ownerPersonId,
      ownerText: form.ownerText || undefined,
      dueDate: form.dueDate || undefined,
      workstreamId: form.workstreamId === NONE ? undefined : form.workstreamId,
      notes: form.notes || undefined,
      acceptanceCriteria: form.acceptanceCriteria || undefined,
      expectedOutput: form.expectedOutput || undefined,
    };
    const res = isEdit
      ? await updateTask({ id: task!.id, ...payload })
      : await createTask(payload);
    setPending(false);
    if (res.ok) {
      toast.success(res.message ?? "Saved");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${task?.externalId}` : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the action details below."
              : "Create a new action. An ID will be generated automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-description">Description *</Label>
            <Textarea
              id="t-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-area">Area</Label>
              <Input
                id="t-area"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-due">Due date</Label>
              <Input
                id="t-due"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                placeholder="e.g. Day 2 or 2026-07-01"
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_STATUS_OPTIONS.map((s) => (
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
                value={form.ownerPersonId}
                onValueChange={(v) => set("ownerPersonId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Workstream</Label>
              <Select
                value={form.workstreamId}
                onValueChange={(v) => set("workstreamId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {workstreams.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.code} · {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-owner-text">Owner (free text)</Label>
            <Input
              id="t-owner-text"
              value={form.ownerText}
              onChange={(e) => set("ownerText", e.target.value)}
              placeholder="Used when no person is selected"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-accept">Acceptance criteria</Label>
            <Textarea
              id="t-accept"
              value={form.acceptanceCriteria}
              onChange={(e) => set("acceptanceCriteria", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-output">Expected output</Label>
            <Textarea
              id="t-output"
              value={form.expectedOutput}
              onChange={(e) => set("expectedOutput", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-notes">Notes</Label>
            <Textarea
              id="t-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
