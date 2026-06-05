"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, BookA, Layers, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { GlossaryData } from "@/lib/services/glossary";
import { titleCase } from "@/lib/utils";
import { upsertGlossaryTerm } from "@/server/actions/glossary";

type GlossaryRow = GlossaryData["glossary"][number];

export function GlossaryClient({ data }: { data: GlossaryData }) {
  const router = useRouter();
  const [glossaryCategory, setGlossaryCategory] = React.useState<string>("all");
  const [glossaryQuery, setGlossaryQuery] = React.useState("");
  const [editingTerm, setEditingTerm] = React.useState<GlossaryRow | null>(null);
  const [saving, setSaving] = React.useState(false);

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
        <MetricCard label="Glossary terms" value={data.summary.glossaryCount} icon={BookA} />
        <MetricCard
          label="Categories"
          value={data.summary.categories.length}
          icon={Layers}
          tone="info"
        />
        <MetricCard
          label="Confirmed"
          value={data.summary.confirmed}
          icon={BadgeCheck}
          tone="default"
        />
        <MetricCard
          label="Needs validation"
          value={data.summary.needsValidation}
          icon={Search}
          tone="warning"
        />
      </div>

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
        <Can action="edit" entity="glossary">
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
              Changes are audited and visible to all glossary viewers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Can
              action="edit"
              entity="glossary"
              fallback={
                <p className="text-muted-foreground text-sm">
                  You need glossary edit permission to modify terms.
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
    </div>
  );
}
