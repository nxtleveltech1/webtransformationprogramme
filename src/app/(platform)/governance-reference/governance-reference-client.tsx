"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Library, Link2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Can } from "@/components/shared/can";
import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { GovernanceReferenceData } from "@/lib/services/governance-reference";
import { titleCase } from "@/lib/utils";
import { upsertGlossaryTerm } from "@/server/actions/governance-reference";

type GlossaryRow = GovernanceReferenceData["glossary"][number];
type MappingRow = GovernanceReferenceData["mappings"][number];

export function GovernanceReferenceClient({ data }: { data: GovernanceReferenceData }) {
  const router = useRouter();
  const [torQuery, setTorQuery] = React.useState("");
  const [glossaryCategory, setGlossaryCategory] = React.useState<string>("all");
  const [glossaryQuery, setGlossaryQuery] = React.useState("");
  const [mappingQuery, setMappingQuery] = React.useState("");
  const [editingTerm, setEditingTerm] = React.useState<GlossaryRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  const torSections = React.useMemo(() => {
    const sections = data.torDoc?.sections ?? [];
    const q = torQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) =>
        s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q),
    );
  }, [data.torDoc, torQuery]);

  const filteredGlossary = React.useMemo(() => {
    return data.glossary.filter((g) => {
      if (glossaryCategory !== "all" && g.category !== glossaryCategory) return false;
      if (glossaryQuery) {
        const q = glossaryQuery.toLowerCase();
        return (
          g.term.toLowerCase().includes(q) || g.meaning.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.glossary, glossaryCategory, glossaryQuery]);

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

  const glossaryColumns: ColumnDef<GlossaryRow>[] = [
    {
      accessorKey: "term",
      header: "Term",
      cell: ({ row }) => <span className="font-medium">{row.original.term}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{titleCase(row.original.category)}</Badge>
      ),
    },
    {
      accessorKey: "meaning",
      header: "Definition",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm">{row.original.meaning}</span>
      ),
    },
    {
      accessorKey: "confidence",
      header: "Confidence",
      cell: ({ row }) => (
        <Badge variant="secondary">{titleCase(row.original.confidence)}</Badge>
      ),
    },
  ];

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
      cell: ({ row }) => row.original.glossaryTerm?.term ?? "\u2014",
    },
  ];

  async function handleSaveTerm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const result = await upsertGlossaryTerm({
      id: editingTerm?.id,
      term: String(form.get("term") ?? ""),
      meaning: String(form.get("meaning") ?? ""),
      category: String(form.get("category") ?? "TERM"),
      confidence: String(form.get("confidence") ?? "INFERRED"),
    });
    setSaving(false);
    if (result.ok) {
      toast.success(result.message ?? "Saved");
      setEditingTerm(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Glossary terms"
          value={data.summary.glossaryCount}
          icon={Library}
        />
        <MetricCard
          label="Reference mappings"
          value={data.summary.mappingCount}
          icon={Link2}
          tone="info"
        />
        <MetricCard
          label="Published docs"
          value={data.summary.publishedDocs}
          icon={BookOpen}
          tone="warning"
        />
        <MetricCard
          label="Categories"
          value={data.summary.categories.length}
          icon={Search}
          tone="default"
        />
      </div>

      <Tabs defaultValue="tor">
        <TabsList>
          <TabsTrigger value="tor">Terms of Reference</TabsTrigger>
          <TabsTrigger value="glossary">Glossary & Definitions</TabsTrigger>
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

        <TabsContent value="glossary" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                className="pl-8"
                placeholder="Search terms..."
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
              />
            </div>
            <Select value={glossaryCategory} onValueChange={setGlossaryCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {data.summary.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {titleCase(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Can action="edit" entity="governance">
              <Button variant="outline" onClick={() => setEditingTerm({} as GlossaryRow)}>
                Add term
              </Button>
            </Can>
          </div>

          <DataTable
            columns={glossaryColumns}
            data={filteredGlossary}
            searchPlaceholder="Filter table..."
            onRowClick={(row) => setEditingTerm(row)}
            emptyTitle="No glossary terms"
            emptyDescription="Glossary terms will appear after seeding or manual entry."
          />

          {editingTerm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingTerm.id ? "Edit glossary term" : "New glossary term"}
                </CardTitle>
                <CardDescription>
                  Changes are audited and visible to all governance viewers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Can
                  action="edit"
                  entity="governance"
                  fallback={
                    <p className="text-muted-foreground text-sm">
                      You need governance edit permission to modify terms.
                    </p>
                  }
                >
                  <form className="space-y-3" onSubmit={handleSaveTerm}>
                    <div className="space-y-1">
                      <Label htmlFor="term">Term</Label>
                      <Input
                        id="term"
                        name="term"
                        defaultValue={editingTerm.term ?? ""}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="meaning">Definition</Label>
                      <Textarea
                        id="meaning"
                        name="meaning"
                        defaultValue={editingTerm.meaning ?? ""}
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <select
                          name="category"
                          defaultValue={editingTerm.category ?? "TERM"}
                          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                        >
                          {["TERM", "ACRONYM", "SYSTEM", "PROCESS", "GEOGRAPHY"].map((c) => (
                            <option key={c} value={c}>
                              {titleCase(c)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>Confidence</Label>
                        <select
                          name="confidence"
                          defaultValue={editingTerm.confidence ?? "INFERRED"}
                          className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                        >
                          {["CONFIRMED", "INFERRED", "REQUIRES_VALIDATION", "UNCONFIRMED"].map(
                            (c) => (
                              <option key={c} value={c}>
                                {titleCase(c)}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save term"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingTerm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Can>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4 pt-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
            <Input
              className="pl-8"
              placeholder="Search concepts, fields, processes..."
              value={mappingQuery}
              onChange={(e) => setMappingQuery(e.target.value)}
            />
          </div>
          <DataTable
            columns={mappingColumns}
            data={filteredMappings}
            emptyTitle="No reference mappings"
            emptyDescription="Mappings link programme concepts to data fields and processes."
          />
          <p className="text-muted-foreground text-xs">
            Reference mappings connect glossary terms and ToR concepts to schema fields (e.g.{" "}
            <code>Person.ownerPersonId</code>) and operational processes.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
