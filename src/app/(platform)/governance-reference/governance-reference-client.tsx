"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, FileText, Link2, Search } from "lucide-react";
import Link from "next/link";

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

type MappingRow = GovernanceReferenceData["mappings"][number];

export function GovernanceReferenceClient({ data }: { data: GovernanceReferenceData }) {
  const [torQuery, setTorQuery] = React.useState("");
  const [mappingQuery, setMappingQuery] = React.useState("");

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
            <Button asChild variant="outline" size="sm">
              <Link href="/glossary">Open Glossary &amp; Definitions</Link>
            </Button>
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
    </div>
  );
}
