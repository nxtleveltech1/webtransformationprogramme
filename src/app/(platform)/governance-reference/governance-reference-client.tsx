"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, FileText, Link2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Can } from "@/components/shared/can";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GovernanceReferenceData } from "@/lib/services/governance-reference";
import { titleCase } from "@/lib/utils";
import { deleteReferenceMapping } from "@/server/actions/governance-reference";
import { MappingFormDialog, type MappingFormValues } from "./mapping-form";

type MappingRow = GovernanceReferenceData["mappings"][number];

function toFormValues(m: MappingRow): MappingFormValues {
  return {
    id: m.id,
    conceptKey: m.conceptKey,
    label: m.label,
    description: m.description,
    glossaryTermId: m.glossaryTerm?.id ?? null,
    entityType: m.entityType ?? null,
    fieldPath: m.fieldPath ?? null,
    processName: m.processName ?? null,
  };
}

export function GovernanceReferenceClient({ data }: { data: GovernanceReferenceData }) {
  const router = useRouter();
  const [torQuery, setTorQuery] = React.useState("");
  const [mappingQuery, setMappingQuery] = React.useState("");
  const [mappingDialogOpen, setMappingDialogOpen] = React.useState(false);
  const [editingMapping, setEditingMapping] = React.useState<MappingFormValues | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MappingRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  function openCreate() {
    setEditingMapping(null);
    setMappingDialogOpen(true);
  }

  function openEdit(m: MappingRow) {
    setEditingMapping(toFormValues(m));
    setMappingDialogOpen(true);
  }

  async function handleDeleteMapping() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteReferenceMapping({ id: deleteTarget.id });
    setDeleting(false);
    setDeleteTarget(null);
    if (result.ok) {
      toast.success(result.message ?? "Mapping deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const torSections = React.useMemo(() => {
    const sections = data.torDoc?.sections ?? [];
    const q = torQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) =>
        s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q),
    );
  }, [data.torDoc, torQuery]);

  const filteredMappings = React.useMemo(() => {
    const q = mappingQuery.trim().toLowerCase();
    if (!q) return data.mappings;
    return data.mappings.filter(
      (m) =>
        m.conceptKey.toLowerCase().includes(q) ||
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.entityType ?? "").toLowerCase().includes(q) ||
        (m.fieldPath ?? "").toLowerCase().includes(q),
    );
  }, [data.mappings, mappingQuery]);

  const mappingColumns: ColumnDef<MappingRow>[] = [
    {
      accessorKey: "conceptKey",
      header: "Concept",
      cell: ({ row }) => (
        <code className="text-xs">{row.original.conceptKey}</code>
      ),
    },
    { accessorKey: "label", header: "Label" },
    {
      id: "field",
      header: "Data field",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.entityType && row.original.fieldPath
            ? `${row.original.entityType}.${row.original.fieldPath}`
            : "\u2014"}
        </span>
      ),
    },
    {
      accessorKey: "processName",
      header: "Process",
      cell: ({ row }) => row.original.processName ?? "\u2014",
    },
    {
      id: "glossary",
      header: "Glossary",
      cell: ({ row }) =>
        row.original.glossaryTerm ? (
          <Link
            href="/glossary"
            className="text-primary text-sm underline-offset-2 hover:underline"
          >
            {row.original.glossaryTerm.term}
          </Link>
        ) : (
          "\u2014"
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Can action="configure" entity="governance">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit mapping"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row.original);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete mapping"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row.original);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </Can>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Published docs"
          value={data.summary.publishedDocs}
          icon={BookOpen}
        />
        <MetricCard
          label="ToR sections"
          value={data.summary.torSections}
          icon={FileText}
          tone="info"
        />
        <MetricCard
          label="Reference mappings"
          value={data.summary.mappingCount}
          icon={Link2}
          tone="default"
        />
        <MetricCard
          label="Mapped glossary terms"
          value={data.summary.mappedTerms}
          icon={Search}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="tor">
        <TabsList>
          <TabsTrigger value="tor">Terms of Reference</TabsTrigger>
          <TabsTrigger value="mappings">Reference Map</TabsTrigger>
        </TabsList>

        <TabsContent value="tor" className="space-y-4 pt-4">
          {data.torDoc ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{data.torDoc.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    v{data.torDoc.version} · {titleCase(data.torDoc.status)}
                    {data.torDoc.ownerPerson
                      ? ` · Owner: ${data.torDoc.ownerPerson.displayName}`
                      : ""}
                  </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                  <Input
                    className="pl-8"
                    placeholder="Search ToR sections..."
                    value={torQuery}
                    onChange={(e) => setTorQuery(e.target.value)}
                  />
                </div>
              </div>
              {data.torDoc.summary && (
                <p className="text-muted-foreground text-sm">{data.torDoc.summary}</p>
              )}
              <div className="space-y-4">
                {torSections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{section.heading}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                        {section.body}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!torSections.length && (
                  <p className="text-muted-foreground text-sm">No sections match your search.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No Terms of Reference document found.</p>
          )}
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                className="pl-8"
                placeholder="Search concepts, fields, processes..."
                value={mappingQuery}
                onChange={(e) => setMappingQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/glossary">Open Glossary &amp; Definitions</Link>
              </Button>
              <Can action="configure" entity="governance">
                <Button size="sm" onClick={openCreate}>
                  <Plus className="size-4" />
                  Add mapping
                </Button>
              </Can>
            </div>
          </div>
          <DataTable
            columns={mappingColumns}
            data={filteredMappings}
            emptyTitle="No reference mappings"
            emptyDescription="Mappings link programme concepts to data fields and processes."
          />
          <p className="text-muted-foreground text-xs">
            Reference mappings connect glossary terms and ToR concepts to schema fields (e.g.{" "}
            <code>Person.ownerPersonId</code>) and operational processes. Term definitions live in
            the <Link href="/glossary" className="text-primary underline-offset-2 hover:underline">Glossary &amp; Definitions</Link> tab.
          </p>
        </TabsContent>
      </Tabs>

      <MappingFormDialog
        open={mappingDialogOpen}
        onOpenChange={setMappingDialogOpen}
        initial={editingMapping}
        glossaryTerms={data.glossaryTerms}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete reference mapping?"
        description={
          deleteTarget
            ? `"${deleteTarget.conceptKey}" will be permanently removed from the reference map.`
            : undefined
        }
        confirmLabel="Delete mapping"
        destructive
        loading={deleting}
        onConfirm={handleDeleteMapping}
      />
    </div>
  );
}
