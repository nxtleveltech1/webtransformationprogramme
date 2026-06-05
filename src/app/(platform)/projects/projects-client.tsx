"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { formatDate } from "@/lib/utils";
import { ProjectFormDialog, type Option, type WsOption } from "./project-form";

export interface ProjectRow {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  rag: "RED" | "AMBER" | "GREEN" | null;
  ownerPersonId: string | null;
  ownerName: string | null;
  ownerText: string | null;
  sponsor: string | null;
  startDate: string | null;
  endDate: string | null;
  budgetNote: string | null;
  workstreamId: string | null;
  workstreamCode: string | null;
  programmeId: string | null;
}

export function ProjectsClient({
  projects,
  people,
  workstreams,
  programmes,
}: {
  projects: ProjectRow[];
  people: Option[];
  workstreams: WsOption[];
  programmes: Option[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs">{row.original.code ?? "—"}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: "rag",
        header: "RAG",
        cell: ({ row }) => <RagIndicator value={row.original.rag} showLabel={false} />,
      },
      {
        id: "owner",
        accessorFn: (r) => r.ownerName ?? r.ownerText ?? "",
        header: "Owner",
        cell: ({ row }) => (
          <span>{row.original.ownerName ?? row.original.ownerText ?? "—"}</span>
        ),
      },
      {
        accessorKey: "sponsor",
        header: "Sponsor",
        cell: ({ row }) => <span>{row.original.sponsor ?? "—"}</span>,
      },
      {
        id: "dates",
        header: "Timeline",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {formatDate(row.original.startDate)} → {formatDate(row.original.endDate)}
          </span>
        ),
      },
    ],
    [],
  );

  const exportRows = projects.map((p) => ({
    code: p.code ?? "",
    name: p.name,
    status: p.status,
    priority: p.priority,
    rag: p.rag ?? "",
    owner: p.ownerName ?? p.ownerText ?? "",
    sponsor: p.sponsor ?? "",
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
  }));

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        searchPlaceholder="Search projects..."
        onRowClick={(row) => router.push(`/projects/${row.id}`)}
        emptyTitle="No projects"
        emptyDescription="Projects derived from workstreams will appear here."
        toolbar={
          <>
            <ExportButton rows={exportRows} filename="projects" entity="project" />
            <Can action="create" entity="project">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New project
              </Button>
            </Can>
          </>
        }
      />

      <ProjectFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        people={people}
        workstreams={workstreams}
        programmes={programmes}
        onSuccess={(msg) => {
          toast.success(msg);
          router.refresh();
        }}
      />
    </>
  );
}
