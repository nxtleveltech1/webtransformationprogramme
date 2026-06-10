"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Bug,
  GitBranch,
  Lightbulb,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

import { relativeDays, titleCase } from "@/lib/utils";
import { riskScore } from "@/lib/enums";
import type { RaidData } from "@/lib/services/raid";
import type { RiskRow } from "@/lib/services/risks";
import type { IssueRow } from "@/lib/services/issues";
import type { DependencyRow } from "@/lib/services/dependencies";
import type { AssumptionRow } from "@/lib/services/assumptions";

function StatusFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-40">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All statuses</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {titleCase(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RaidClient({ data }: { data: RaidData }) {
  const router = useRouter();
  const { risks, issues, dependencies, assumptions } = data;

  const [riskStatus, setRiskStatus] = React.useState("ALL");
  const [issueStatus, setIssueStatus] = React.useState("ALL");
  const [depStatus, setDepStatus] = React.useState("ALL");

  const openRisks = risks.filter((r) => !/closed/i.test(r.status)).length;
  const openIssues = issues.filter((i) => i.status !== "CLOSED").length;
  const liveDeps = dependencies.filter(
    (d) => d.status !== "MET",
  ).length;

  const riskStatuses = React.useMemo(
    () => Array.from(new Set(risks.map((r) => r.status))).sort(),
    [risks],
  );
  const issueStatuses = React.useMemo(
    () => Array.from(new Set(issues.map((i) => i.status))).sort(),
    [issues],
  );
  const depStatuses = React.useMemo(
    () => Array.from(new Set(dependencies.map((d) => d.status))).sort(),
    [dependencies],
  );

  const filteredRisks = risks.filter(
    (r) => riskStatus === "ALL" || r.status === riskStatus,
  );
  const filteredIssues = issues.filter(
    (i) => issueStatus === "ALL" || i.status === issueStatus,
  );
  const filteredDeps = dependencies.filter(
    (d) => depStatus === "ALL" || d.status === depStatus,
  );

  const riskColumns = React.useMemo<ColumnDef<RiskRow>[]>(
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-sm text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "score",
        header: "Score",
        accessorFn: (r) => riskScore(r.probability, r.impact),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {riskScore(row.original.probability, row.original.impact)}
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

  const issueColumns = React.useMemo<ColumnDef<IssueRow>[]>(
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-sm text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "age",
        header: "Age",
        accessorFn: (i) => relativeDays(i.createdAt) ?? 0,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {relativeDays(row.original.createdAt) ?? 0}d
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

  const depColumns = React.useMemo<ColumnDef<DependencyRow>[]>(
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-sm text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "required",
        header: "Required",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.requiredDate ?? "\u2014"}</span>
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

  const assumptionColumns = React.useMemo<ColumnDef<AssumptionRow>[]>(
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-sm text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "area",
        header: "Area impacted",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.areaImpacted ?? "\u2014"}</span>
        ),
      },
      {
        id: "validator",
        header: "Validator",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.validatorPerson?.displayName ??
              row.original.validatorText ??
              "\u2014"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="RAID Dashboard"
        description="Consolidated view of Risks, Assumptions, Issues and Dependencies across the programme."
        actions={
          <Button asChild variant="outline">
            <Link href="/risks">
              Open registers
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Open risks"
          value={openRisks}
          hint={`${risks.length} total`}
          icon={AlertTriangle}
          tone="danger"
          href="/risks"
        />
        <MetricCard
          label="Assumptions"
          value={assumptions.length}
          icon={Lightbulb}
          tone="warning"
          href="/assumptions"
        />
        <MetricCard
          label="Open issues"
          value={openIssues}
          hint={`${issues.length} total`}
          icon={Bug}
          tone="info"
          href="/issues"
        />
        <MetricCard
          label="Live dependencies"
          value={liveDeps}
          hint={`${dependencies.length} total`}
          icon={GitBranch}
          tone="default"
          href="/dependencies"
        />
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">
            <ShieldAlert className="size-4" />
            Risks ({risks.length})
          </TabsTrigger>
          <TabsTrigger value="assumptions">
            <Lightbulb className="size-4" />
            Assumptions ({assumptions.length})
          </TabsTrigger>
          <TabsTrigger value="issues">
            <Bug className="size-4" />
            Issues ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="dependencies">
            <GitBranch className="size-4" />
            Dependencies ({dependencies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusFilter
              value={riskStatus}
              onChange={setRiskStatus}
              options={riskStatuses}
            />
            <Button asChild variant="ghost" size="sm">
              <Link href="/risks">
                Full risk register
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <DataTable
            columns={riskColumns}
            data={filteredRisks}
            mappingColumns
            tableKey="raid-risks"
            searchPlaceholder="Search risks..."
            onRowClick={() => router.push("/risks")}
            emptyTitle="No risks"
            emptyDescription="No risks match the current filter."
          />
        </TabsContent>

        <TabsContent value="assumptions" className="space-y-3">
          <div className="flex items-center justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href="/assumptions">
                Full assumptions log
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <DataTable
            columns={assumptionColumns}
            data={assumptions}
            mappingColumns
            tableKey="raid-assumptions"
            searchPlaceholder="Search assumptions..."
            onRowClick={() => router.push("/assumptions")}
            emptyTitle="No assumptions"
            emptyDescription="No assumptions recorded yet."
          />
        </TabsContent>

        <TabsContent value="issues" className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusFilter
              value={issueStatus}
              onChange={setIssueStatus}
              options={issueStatuses}
            />
            <Button asChild variant="ghost" size="sm">
              <Link href="/issues">
                Full issue register
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <DataTable
            columns={issueColumns}
            data={filteredIssues}
            mappingColumns
            tableKey="raid-issues"
            searchPlaceholder="Search issues..."
            onRowClick={() => router.push("/issues")}
            emptyTitle="No issues"
            emptyDescription="No issues match the current filter."
          />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusFilter
              value={depStatus}
              onChange={setDepStatus}
              options={depStatuses}
            />
            <Button asChild variant="ghost" size="sm">
              <Link href="/dependencies">
                Full dependency register
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <DataTable
            columns={depColumns}
            data={filteredDeps}
            mappingColumns
            tableKey="raid-dependencies"
            searchPlaceholder="Search dependencies..."
            onRowClick={() => router.push("/dependencies")}
            emptyTitle="No dependencies"
            emptyDescription="No dependencies match the current filter."
          />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Decision log" value="View" icon={ArrowUpRight} href="/decisions" />
        <MetricCard label="Open questions" value="View" icon={ArrowUpRight} href="/open-questions" />
        <MetricCard label="Parking lot" value="View" icon={ArrowUpRight} href="/parking-lot" />
      </div>
    </div>
  );
}
