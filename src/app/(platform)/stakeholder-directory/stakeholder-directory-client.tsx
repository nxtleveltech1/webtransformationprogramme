"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookUser, Contact, Filter, Shield, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Can } from "@/components/shared/can";
import { DataTable } from "@/components/shared/data-table";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type {
  StakeholderRecord,
  StakeholderDirectoryFilters,
} from "@/lib/services/stakeholder-directory";
import { conciseRole, fullName, initials, stripMarkdown, titleCase } from "@/lib/utils";
import { updateStakeholder } from "@/server/actions/stakeholders";

type DirectoryData = Awaited<
  ReturnType<typeof import("@/lib/services/stakeholder-directory").getStakeholderDirectory>
>;

type FormOptions = Awaited<
  ReturnType<typeof import("@/lib/services/stakeholder-directory").getStakeholderFormOptions>
>;

const PROGRAMME_ROLES = [
  "STREAM_LEAD",
  "PRODUCT_OWNER",
  "SME",
  "GATEKEEPER",
  "FACILITATOR",
  "TECHNICAL_ARCHITECT",
  "BUSINESS_STAKEHOLDER",
  "SPONSOR",
  "CONTRIBUTOR",
  "PROGRAMME_DIRECTOR",
  "SCRIBE",
  "EXECUTIVE_SPONSOR",
] as const;

const STAKEHOLDER_ROLES = [
  "SPONSOR",
  "APPROVER",
  "SME",
  "DECISION_MAKER",
  "INFORMED",
] as const;

export function StakeholderDirectoryClient({
  data,
  formOptions,
}: {
  data: DirectoryData;
  formOptions: FormOptions;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<StakeholderRecord | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [filters, setFilters] = React.useState<StakeholderDirectoryFilters>({
    activeOnly: true,
  });

  const filtered = React.useMemo(() => {
    return data.people.filter((p) => {
      if (filters.areaId && p.areaId !== filters.areaId) return false;
      if (filters.businessId && p.businessId !== filters.businessId) return false;
      if (filters.clusterId && p.clusterId !== filters.clusterId) return false;
      if (filters.teamId && !p.teamAssignments.some((t) => t.teamId === filters.teamId)) {
        return false;
      }
      if (
        filters.programmeRole &&
        !p.programmeRoles.some((r) => r.roleType === filters.programmeRole)
      ) {
        return false;
      }
      if (
        filters.stakeholderRole &&
        !p.stakeholderRoles.some((r) => r.roleType === filters.stakeholderRole)
      ) {
        return false;
      }
      if (filters.workstreamId && p.primaryWorkstreamId !== filters.workstreamId) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const hay = [
          p.displayName,
          p.surname,
          p.roleDescription,
          p.department,
          p.area?.name,
          p.business?.name,
          p.cluster?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.people, filters]);

  const columns: ColumnDef<StakeholderRecord>[] = [
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {initials(fullName(row.original))}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[160px] truncate font-medium" title={fullName(row.original)}>
            {fullName(row.original)}
          </span>
        </div>
      ),
    },
    {
      id: "surname",
      header: "Surname",
      accessorFn: (p) => p.surname ?? "",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.surname ?? "\u2014"}</span>
      ),
    },
    {
      id: "role",
      header: "Role / title",
      accessorFn: (p) => p.roleDescription ?? "",
      cell: ({ row }) => {
        const full = stripMarkdown(row.original.roleDescription) || "\u2014";
        return (
          <span className="block max-w-[240px] truncate text-sm" title={full}>
            {conciseRole(row.original.roleDescription)}
          </span>
        );
      },
    },
    {
      id: "business",
      header: "Business",
      cell: ({ row }) => (
        <span className="block max-w-[140px] truncate text-sm" title={row.original.business?.name ?? ""}>
          {row.original.business?.name ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "cluster",
      header: "Cluster",
      cell: ({ row }) => (
        <span className="block max-w-[120px] truncate text-sm" title={row.original.cluster?.name ?? ""}>
          {row.original.cluster?.name ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "area",
      header: "Area",
      cell: ({ row }) => (
        <span className="block max-w-[150px] truncate text-sm" title={row.original.area?.name ?? ""}>
          {row.original.area?.name ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "programmeRoles",
      header: "Programme roles",
      cell: ({ row }) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {row.original.programmeRoles.length ? (
            row.original.programmeRoles.map((r) => (
              <Badge key={r.id} variant="secondary" className="text-xs">
                {titleCase(r.roleType)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">{"\u2014"}</span>
          )}
        </div>
      ),
    },
    {
      id: "stakeholderRoles",
      header: "Stakeholder roles",
      cell: ({ row }) => (
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {row.original.stakeholderRoles.length ? (
            row.original.stakeholderRoles.map((r) => (
              <Badge key={r.id} variant="outline" className="text-xs">
                {titleCase(r.roleType)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">{"\u2014"}</span>
          )}
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        if (!data.canViewPii || row.original.contactVisibility === "NAME_ONLY") {
          return <span className="text-muted-foreground text-xs">Restricted</span>;
        }
        return (
          <span className="block max-w-[180px] truncate text-xs" title={row.original.email ?? row.original.phone ?? ""}>
            {row.original.email ?? row.original.phone ?? "\u2014"}
          </span>
        );
      },
    },
  ];

  const exportRows = filtered.map((p) => ({
    name: fullName(p),
    surname: p.surname ?? "",
    role: p.roleDescription ?? "",
    area: p.area?.name ?? "",
    business: p.business?.name ?? "",
    cluster: p.cluster?.name ?? "",
    teams: p.teamAssignments.map((t) => t.team.name).join("; "),
    programmeRoles: p.programmeRoles.map((r) => titleCase(r.roleType)).join("; "),
    stakeholderRoles: p.stakeholderRoles.map((s) => titleCase(s.roleType)).join("; "),
    email: data.canViewPii ? (p.email ?? "") : "",
    phone: data.canViewPii ? (p.phone ?? "") : "",
  }));

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const result = await updateStakeholder({
      id: selected.id,
      displayName: String(form.get("displayName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      roleDescription: String(form.get("roleDescription") ?? ""),
      department: String(form.get("department") ?? ""),
      location: String(form.get("location") ?? ""),
      areaId: String(form.get("areaId") ?? ""),
      businessId: String(form.get("businessId") ?? ""),
      clusterId: String(form.get("clusterId") ?? ""),
      primaryWorkstreamId: String(form.get("primaryWorkstreamId") ?? ""),
      contactVisibility: String(form.get("contactVisibility") ?? "PUBLIC_INTERNAL"),
    });
    setSaving(false);
    if (result.ok) {
      toast.success(result.message ?? "Saved");
      setEditing(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title=""
        description=""
        actions={
          <ExportButton
            rows={exportRows}
            filename="stakeholder-directory"
            entity="people"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Stakeholders" value={filtered.length} icon={BookUser} />
        <MetricCard
          label="With programme roles"
          value={data.summary.withProgrammeRoles}
          icon={Users2}
          tone="info"
        />
        <MetricCard
          label="With stakeholder roles"
          value={data.summary.withStakeholderRoles}
          icon={Contact}
          tone="warning"
        />
        <MetricCard
          label="Contact restricted"
          value={data.summary.restrictedContact}
          icon={Shield}
          tone="default"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <Filter className="text-muted-foreground size-4 shrink-0" />
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="space-y-1">
            <Label className="text-xs">Search</Label>
            <Input
              placeholder="Name, role..."
              value={filters.query ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            />
          </div>
          <FilterSelect
            label="Area"
            value={filters.areaId}
            options={data.areas.map((a) => ({ value: a.id, label: a.name }))}
            onChange={(v) => setFilters((f) => ({ ...f, areaId: v }))}
          />
          <FilterSelect
            label="Business"
            value={filters.businessId}
            options={data.businesses.map((b) => ({ value: b.id, label: b.name }))}
            onChange={(v) => setFilters((f) => ({ ...f, businessId: v }))}
          />
          <FilterSelect
            label="Cluster"
            value={filters.clusterId}
            options={data.clusters.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => setFilters((f) => ({ ...f, clusterId: v }))}
          />
          <FilterSelect
            label="Team"
            value={filters.teamId}
            options={data.teams.map((t) => ({ value: t.id, label: t.name }))}
            onChange={(v) => setFilters((f) => ({ ...f, teamId: v }))}
          />
          <FilterSelect
            label="Programme role"
            value={filters.programmeRole}
            options={PROGRAMME_ROLES.map((r) => ({
              value: r,
              label: titleCase(r),
            }))}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                programmeRole: v as StakeholderDirectoryFilters["programmeRole"],
              }))
            }
          />
          <FilterSelect
            label="Stakeholder role"
            value={filters.stakeholderRole}
            options={STAKEHOLDER_ROLES.map((r) => ({
              value: r,
              label: titleCase(r),
            }))}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                stakeholderRole: v as StakeholderDirectoryFilters["stakeholderRole"],
              }))
            }
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ activeOnly: true })}
        >
          Clear filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Quick filter visible rows..."
        onRowClick={(p) => {
          setSelected(p);
          setEditing(false);
        }}
        emptyTitle="No stakeholders match"
        emptyDescription="Adjust filters or add stakeholders with appropriate permissions."
      />

      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            setEditing(false);
          }
        }}
        title={selected ? fullName(selected) : "Stakeholder"}
        description={selected ? conciseRole(selected.roleDescription) : undefined}
        footer={
          selected ? (
            <Can action="edit" entity="people">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "View" : "Edit"}
              </Button>
            </Can>
          ) : undefined
        }
      >
        {selected && !editing && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Surname">{selected.surname ?? "\u2014"}</DetailField>
              <DetailField label="Area">{selected.area?.name ?? "\u2014"}</DetailField>
              <DetailField label="Business">{selected.business?.name ?? "\u2014"}</DetailField>
              <DetailField label="Cluster">{selected.cluster?.name ?? "\u2014"}</DetailField>
              <DetailField label="Department">{selected.department ?? "\u2014"}</DetailField>
              <DetailField label="Location">{selected.location ?? "\u2014"}</DetailField>
              <DetailField label="Confidence">{titleCase(selected.confidence)}</DetailField>
              {data.canViewPii && selected.contactVisibility !== "NAME_ONLY" && (
                <>
                  <DetailField label="Email">{selected.email ?? "\u2014"}</DetailField>
                  <DetailField label="Phone">{selected.phone ?? "\u2014"}</DetailField>
                  <DetailField label="Mobile">{selected.mobile ?? "\u2014"}</DetailField>
                </>
              )}
              <DetailField label="Contact visibility">
                {titleCase(selected.contactVisibility)}
              </DetailField>
              <DetailField label="Workstream">
                {selected.primaryWorkstream?.name ?? "\u2014"}
              </DetailField>
            </DetailGrid>
            {selected.roleDescription && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-normal">
                  Role / title
                </p>
                <p className="text-sm">{stripMarkdown(selected.roleDescription)}</p>
              </div>
            )}
            <RoleSection title="Teams" items={selected.teamAssignments.map((t) => t.team.name)} />
            <RoleSection
              title="Programme roles"
              items={selected.programmeRoles.map((r) => titleCase(r.roleType))}
            />
            <RoleSection
              title="Stakeholder roles (RACI)"
              items={selected.stakeholderRoles.map((r) => titleCase(r.roleType))}
            />
            <p className="text-muted-foreground text-xs">
              Person ID: {selected.id} — used for task and action owner assignment.
            </p>
          </div>
        )}

        {selected && editing && (
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-1">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={selected.displayName}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="roleDescription">Role description</Label>
              <Textarea
                id="roleDescription"
                name="roleDescription"
                defaultValue={selected.roleDescription ?? ""}
                rows={2}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selected.email ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={selected.phone ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" name="mobile" defaultValue={selected.mobile ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={selected.department ?? ""}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                name="areaId"
                label="Area"
                defaultValue={selected.areaId ?? ""}
                options={formOptions.areas.map((a) => ({ value: a.id, label: a.name }))}
              />
              <SelectField
                name="businessId"
                label="Business"
                defaultValue={selected.businessId ?? ""}
                options={formOptions.businesses.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
              />
              <SelectField
                name="clusterId"
                label="Cluster"
                defaultValue={selected.clusterId ?? ""}
                options={formOptions.clusters.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <SelectField
                name="primaryWorkstreamId"
                label="Primary workstream"
                defaultValue={selected.primaryWorkstreamId ?? ""}
                options={formOptions.workstreams.map((w) => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
              <SelectField
                name="contactVisibility"
                label="Contact visibility"
                defaultValue={selected.contactVisibility}
                options={[
                  { value: "PUBLIC_INTERNAL", label: "Public (internal)" },
                  { value: "RESTRICTED", label: "Restricted" },
                  { value: "NAME_ONLY", label: "Name only" },
                ]}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </DetailDrawer>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select
        value={value ?? "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  const [value, setValue] = React.useState(defaultValue || "none");
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value === "none" ? "" : value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function RoleSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">None recorded.</p>
      )}
    </div>
  );
}
