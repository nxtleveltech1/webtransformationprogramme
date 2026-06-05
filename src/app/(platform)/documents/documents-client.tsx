"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, FileCheck2, FileClock, FilePen, Plus, Pencil, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, titleCase } from "@/lib/utils";
import { DOCUMENT_STATUS_OPTIONS } from "@/lib/enums";
import type { DocumentWithRelations } from "@/lib/services/documents";
import { upsertDocument } from "@/server/actions/documents";

type Options = {
  projects: { id: string; name: string; code: string | null }[];
  people: { id: string; displayName: string }[];
};

export function DocumentsClient({
  documents,
  options,
  summary,
}: {
  documents: DocumentWithRelations[];
  options: Options;
  summary: { total: number; approved: number; inReview: number; draft: number };
}) {
  const [selected, setSelected] = React.useState<DocumentWithRelations | null>(null);
  const [editing, setEditing] = React.useState<DocumentWithRelations | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const filtered = React.useMemo(
    () =>
      statusFilter === "ALL"
        ? documents
        : documents.filter((d) => d.status === statusFilter),
    [documents, statusFilter],
  );

  const columns: ColumnDef<DocumentWithRelations>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "project",
      header: "Project",
      accessorFn: (d) => d.project?.name ?? "",
      cell: ({ row }) => row.original.project?.name ?? "\u2014",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => row.original.version ?? "\u2014",
    },
    {
      id: "owner",
      header: "Owner",
      accessorFn: (d) => d.ownerPerson?.displayName ?? d.ownerText ?? "",
      cell: ({ row }) =>
        row.original.ownerPerson?.displayName ?? row.original.ownerText ?? "\u2014",
    },
    {
      accessorKey: "mimeType",
      header: "Type",
      cell: ({ row }) =>
        row.original.mimeType ? (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.mimeType}
          </Badge>
        ) : (
          "\u2014"
        ),
    },
  ];

  const exportRows = documents.map((d) => ({
    name: d.name,
    project: d.project?.name ?? "",
    status: titleCase(d.status),
    version: d.version ?? "",
    owner: d.ownerPerson?.displayName ?? d.ownerText ?? "",
    mimeType: d.mimeType ?? "",
    updatedAt: formatDate(d.updatedAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Programme document register with status, version and ownership metadata."
        actions={
          <>
            <ExportButton rows={exportRows} filename="documents" entity="document" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="sm" variant="outline" disabled>
                    <Upload className="size-4" />
                    Upload
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                File storage is not configured yet — uploads coming soon. Add metadata records in
                the meantime.
              </TooltipContent>
            </Tooltip>
            <Can action="create" entity="document">
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                Add document
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Documents" value={summary.total} icon={FileText} />
        <MetricCard label="Approved" value={summary.approved} icon={FileCheck2} tone="success" />
        <MetricCard label="In review" value={summary.inReview} icon={FileClock} tone="warning" />
        <MetricCard label="Draft" value={summary.draft} icon={FilePen} tone="default" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search documents..."
        onRowClick={(d) => setSelected(d)}
        emptyTitle="No documents"
        emptyDescription="No documents match the current filter."
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {DOCUMENT_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {titleCase(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Document"}
        description={selected?.project?.name ?? undefined}
        footer={
          selected ? (
            <Can action="edit" entity="document">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
              >
                <Pencil className="size-4" />
                Edit metadata
              </Button>
            </Can>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Status">
                <StatusBadge status={selected.status} />
              </DetailField>
              <DetailField label="Version">{selected.version ?? "\u2014"}</DetailField>
              <DetailField label="Project">{selected.project?.name ?? "\u2014"}</DetailField>
              <DetailField label="Owner">
                {selected.ownerPerson?.displayName ?? selected.ownerText ?? "\u2014"}
              </DetailField>
              <DetailField label="Type">{selected.mimeType ?? "\u2014"}</DetailField>
              <DetailField label="Updated">{formatDate(selected.updatedAt)}</DetailField>
            </DetailGrid>
            {selected.description && (
              <DetailField label="Description">{selected.description}</DetailField>
            )}
            <div className="bg-muted/40 text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
              <span className="text-foreground font-medium">File storage not configured.</span>{" "}
              This record stores metadata only (storage reference:{" "}
              <code>{selected.storageRef ?? "none"}</code>). Binary upload &amp; download will be
              enabled once a storage provider is connected.
            </div>
          </div>
        )}
      </DetailDrawer>

      <DocumentFormDialog
        open={creating || !!editing}
        document={editing}
        options={options}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

const NONE = "__none__";

function DocumentFormDialog({
  open,
  document,
  options,
  onClose,
}: {
  open: boolean;
  document: DocumentWithRelations | null;
  options: Options;
  onClose: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [status, setStatus] = React.useState<string>(document?.status ?? "DRAFT");
  const [projectId, setProjectId] = React.useState<string>(document?.projectId ?? NONE);
  const [ownerPersonId, setOwnerPersonId] = React.useState<string>(
    document?.ownerPersonId ?? NONE,
  );
  const isEdit = !!document;

  React.useEffect(() => {
    if (open) {
      setStatus(document?.status ?? "DRAFT");
      setProjectId(document?.projectId ?? NONE);
      setOwnerPersonId(document?.ownerPersonId ?? NONE);
      setErrors({});
    }
  }, [open, document]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: document?.id,
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      version: String(fd.get("version") ?? ""),
      mimeType: String(fd.get("mimeType") ?? ""),
      ownerText: String(fd.get("ownerText") ?? ""),
      status,
      projectId: projectId === NONE ? null : projectId,
      ownerPersonId: ownerPersonId === NONE ? null : ownerPersonId,
    };
    const result = await upsertDocument(payload);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit document" : "Add document"}</DialogTitle>
            <DialogDescription>
              Manage document metadata. File contents are not stored until storage is configured.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={document?.name ?? ""} required />
              {errors.name && <p className="text-rag-red text-xs">{errors.name[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={document?.description ?? ""}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {titleCase(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" name="version" defaultValue={document?.version ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger aria-label="Project">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No project</SelectItem>
                  {options.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Owner</Label>
                <Select value={ownerPersonId} onValueChange={setOwnerPersonId}>
                  <SelectTrigger aria-label="Owner">
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mimeType">MIME type</Label>
                <Input
                  id="mimeType"
                  name="mimeType"
                  placeholder="application/pdf"
                  defaultValue={document?.mimeType ?? ""}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerText">Owner (free text)</Label>
              <Input
                id="ownerText"
                name="ownerText"
                placeholder="Used when no person is linked"
                defaultValue={document?.ownerText ?? ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
