"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { WorkstreamFormDialog, type Option } from "./workstream-form";

export interface WorkstreamRow {
  id: string;
  code: string;
  name: string;
  oneLineStatus: string | null;
  rag: "RED" | "AMBER" | "GREEN" | null;
  leadPersonId: string | null;
  leadName: string | null;
  programmeId: string | null;
  projects: number;
  actions: number;
  risks: number;
  dependencies: number;
  milestones: number;
}

export function WorkstreamsClient({
  workstreams,
  people,
  programmes,
}: {
  workstreams: WorkstreamRow[];
  people: Option[];
  programmes: Option[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<WorkstreamRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
      },
      {
        accessorKey: "name",
        header: "Workstream",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "lead",
        accessorFn: (r) => r.leadName ?? "",
        header: "Lead",
        cell: ({ row }) => <span>{row.original.leadName ?? "Unassigned"}</span>,
      },
      {
        accessorKey: "rag",
        header: "RAG",
        cell: ({ row }) => <RagIndicator value={row.original.rag} showLabel={false} />,
      },
      {
        accessorKey: "oneLineStatus",
        header: "Status",
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-2 max-w-md text-sm">
            {row.original.oneLineStatus ?? "—"}
          </span>
        ),
      },
      {
        id: "rollup",
        header: "Items",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {row.original.projects}p · {row.original.actions}a · {row.original.risks}r
          </span>
        ),
      },
    ],
    [],
  );

  const exportRows = workstreams.map((w) => ({
    code: w.code,
    name: w.name,
    lead: w.leadName ?? "",
    rag: w.rag ?? "",
    status: w.oneLineStatus ?? "",
    projects: w.projects,
    actions: w.actions,
    risks: w.risks,
  }));

  return (
    <>
      <DataTable
        columns={columns}
        data={workstreams}
        searchPlaceholder="Search workstreams..."
        onRowClick={(row) => router.push(`/workstreams/${row.id}`)}
        emptyTitle="No workstreams"
        emptyDescription="Programme workstreams will appear here."
        toolbar={
          <>
            <ExportButton rows={exportRows} filename="workstreams" entity="workstream" />
            <Can action="create" entity="workstream">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New workstream
              </Button>
            </Can>
          </>
        }
      />

      <WorkstreamFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        people={people}
        programmes={programmes}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />
    </>
  );
}
