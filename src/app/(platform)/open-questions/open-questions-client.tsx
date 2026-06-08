"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { HelpCircle, Plus, Pencil, CheckCircle2, Clock } from "lucide-react";

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
import { QUESTION_STATUS_OPTIONS } from "@/lib/enums";
import {
  openQuestionSchema,
  type OpenQuestionFormValues,
} from "@/lib/validation/open-questions";
import type { OpenQuestionRow } from "@/lib/services/open-questions";
import {
  createOpenQuestion,
  updateOpenQuestion,
  markQuestionAnswered,
} from "@/server/actions/open-questions";

export function OpenQuestionsClient({
  questions,
  linksMap = {},
}: {
  questions: OpenQuestionRow[];
  linksMap?: Record<string, RelatedLink[]>;
}) {
  const [selected, setSelected] = React.useState<OpenQuestionRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OpenQuestionRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (q: OpenQuestionRow) => {
    setEditing(q);
    setDrawerOpen(false);
    setDialogOpen(true);
  };
  const openDetail = (q: OpenQuestionRow) => {
    setSelected(q);
    setDrawerOpen(true);
  };

  const handleAnswer = (q: OpenQuestionRow) => {
    startTransition(async () => {
      const res = await markQuestionAnswered({ id: q.id });
      if (res.ok) {
        toast.success(res.message ?? "Question marked answered");
        setDrawerOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const metrics = React.useMemo(() => {
    const open = questions.filter((q) => q.status === "OPEN").length;
    const answered = questions.filter((q) => q.status === "ANSWERED").length;
    const deferred = questions.filter((q) => q.status === "DEFERRED").length;
    return { total: questions.length, open, answered, deferred };
  }, [questions]);

  const columns = React.useMemo<ColumnDef<OpenQuestionRow>[]>(
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
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-md text-sm">
            {row.original.question}
          </span>
        ),
      },
      {
        id: "raisedBy",
        header: "Raised by",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.raisedBy ?? "\u2014"}</span>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.ownerToAnswer ?? "\u2014"}
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
      questions.map((q) => ({
        id: q.externalId,
        question: q.question,
        raisedBy: q.raisedBy ?? "",
        relevantTeam: q.relevantTeam ?? "",
        owner: q.ownerToAnswer ?? "",
        impact: q.impactIfUnanswered ?? "",
        status: q.status,
      })),
    [questions],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Open Questions"
        description="Questions raised during the programme, who owns the answer and the impact if unanswered."
        actions={
          <>
            <ExportButton
              rows={exportRows}
              filename="open-questions"
              entity="question"
            />
            <Can action="create" entity="question">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                New question
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total" value={metrics.total} icon={HelpCircle} />
        <MetricCard label="Open" value={metrics.open} icon={HelpCircle} tone="info" />
        <MetricCard label="Answered" value={metrics.answered} icon={CheckCircle2} tone="success" />
        <MetricCard label="Deferred" value={metrics.deferred} icon={Clock} tone="warning" />
      </div>

      <DataTable
        columns={columns}
        data={questions}
        searchPlaceholder="Search questions..."
        onRowClick={openDetail}
        emptyTitle="No open questions"
        emptyDescription="Raise the first question to track outstanding answers."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selected ? selected.externalId : "Question"}
        description={selected?.question}
        footer={
          selected && (
            <div className="flex justify-end gap-2">
              {selected.status !== "ANSWERED" && (
                <Can action="edit" entity="question">
                  <Button
                    variant="outline"
                    onClick={() => handleAnswer(selected)}
                    disabled={pending}
                  >
                    <CheckCircle2 className="size-4" />
                    Mark answered
                  </Button>
                </Can>
              )}
              <Can action="edit" entity="question">
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
              <DetailField label="Raised by">
                {selected.raisedBy ?? "\u2014"}
              </DetailField>
              <DetailField label="Owner to answer">
                {selected.ownerToAnswer ?? "\u2014"}
              </DetailField>
              <DetailField label="Relevant team">
                {selected.relevantTeam ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            <DetailField label="Question">{selected.question}</DetailField>
            <DetailField label="Impact if unanswered">
              {selected.impactIfUnanswered ?? "\u2014"}
            </DetailField>
            <DetailGrid>
              <DetailField label="Trace">
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

      <OpenQuestionFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}

function OpenQuestionFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: OpenQuestionRow | null;
}) {
  const [pending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OpenQuestionFormValues>({
    resolver: zodResolver(openQuestionSchema),
    defaultValues: editing
      ? {
          id: editing.id,
          question: editing.question,
          raisedBy: editing.raisedBy ?? "",
          relevantTeam: editing.relevantTeam ?? "",
          ownerToAnswer: editing.ownerToAnswer ?? "",
          impactIfUnanswered: editing.impactIfUnanswered ?? "",
          status: editing.status,
        }
      : {
          question: "",
          raisedBy: "",
          relevantTeam: "",
          ownerToAnswer: "",
          impactIfUnanswered: "",
          status: "OPEN",
        },
  });

  const onSubmit = (values: OpenQuestionFormValues) => {
    startTransition(async () => {
      const res = editing
        ? await updateOpenQuestion(values)
        : await createOpenQuestion(values);
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
          <DialogTitle>{editing ? "Edit question" : "New question"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the details for ${editing.externalId}.`
              : "Raise a new open question. An ID will be assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="oq-question">Question</Label>
            <Textarea
              id="oq-question"
              rows={3}
              {...register("question")}
              aria-invalid={!!errors.question}
            />
            {errors.question && (
              <p className="text-rag-red text-xs">{errors.question.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="oq-raised">Raised by</Label>
              <Input id="oq-raised" {...register("raisedBy")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oq-owner">Owner to answer</Label>
              <Input id="oq-owner" {...register("ownerToAnswer")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oq-team">Relevant team</Label>
              <Input id="oq-team" {...register("relevantTeam")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as OpenQuestionFormValues["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {titleCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oq-impact">Impact if unanswered</Label>
            <Textarea id="oq-impact" rows={2} {...register("impactIfUnanswered")} />
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
                  : "Create question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
