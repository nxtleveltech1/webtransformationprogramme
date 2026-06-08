"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BookUser,
  Contact,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  StakeholderRecord,
  StakeholderDirectoryFilters,
} from "@/lib/services/stakeholder-directory";
import type { Role } from "@/lib/rbac/roles";
import { ROLE_DEFINITIONS } from "@/lib/rbac/roles";
import { conciseRole, fullName, initials, stripMarkdown, titleCase } from "@/lib/utils";
import {
  archiveStakeholder,
  assignProgrammeRole,
  assignStakeholderRole,
  assignTeam,
  createStakeholder,
  removeProgrammeRole,
  removeStakeholderRole,
  removeTeam,
  updateStakeholder,
} from "@/server/actions/stakeholders";

type DirectoryData = Awaited<
  ReturnType<typeof import("@/lib/services/stakeholder-directory").getStakeholderDirectory>
>;

type FormOptions = Awaited<
  ReturnType<typeof import("@/lib/services/stakeholder-directory").getStakeholderFormOptions>
>;

type StakeholderPermissions = {
  role: Role;
  canCreate: boolean;
  canEdit: boolean;
  canAssign: boolean;
  canArchive: boolean;
};

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
  "STEERCING_MEMBER",
  "CONSULTATION",
  "COMMUNICATION",
  "WORKING_TEAM",
] as const;

const PARTICIPANT_STATUSES = [
  "CONFIRMED",
  "PENDING",
  "TO_BE_CONFIRMED",
  "INACTIVE",
] as const;

const CONFIDENCE_LEVELS = [
  "CONFIRMED",
  "INFERRED",
  "REQUIRES_VALIDATION",
  "UNCONFIRMED",
] as const;

function formatStakeholderRole(role: {
  roleType: string;
  roleLabel?: string | null;
  scope?: string | null;
}) {
  const parts = [
    role.roleLabel ?? titleCase(role.roleType),
    role.scope ? `(${role.scope})` : null,
  ].filter(Boolean);
  return parts.join(" ");
}

type DrawerMode = "view" | "edit" | "create";

function readStakeholderForm(form: FormData) {
  return {
    displayName: String(form.get("displayName") ?? ""),
    surname: String(form.get("surname") ?? ""),
    nickname: String(form.get("nickname") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    mobile: String(form.get("mobile") ?? ""),
    primaryContact: String(form.get("primaryContact") ?? ""),
    roleDescription: String(form.get("roleDescription") ?? ""),
    department: String(form.get("department") ?? ""),
    location: String(form.get("location") ?? ""),
    areaId: String(form.get("areaId") ?? ""),
    businessId: String(form.get("businessId") ?? ""),
    clusterId: String(form.get("clusterId") ?? ""),
    primaryWorkstreamId: String(form.get("primaryWorkstreamId") ?? ""),
    dataOwnerPersonId: String(form.get("dataOwnerPersonId") ?? ""),
    contactVisibility: String(form.get("contactVisibility") ?? "PUBLIC_INTERNAL"),
    confidence: String(form.get("confidence") ?? "INFERRED"),
    participantStatus: String(form.get("participantStatus") ?? "CONFIRMED"),
  };
}

export function StakeholderDirectoryClient({
  data,
  formOptions,
  permissions,
}: {
  data: DirectoryData;
  formOptions: FormOptions;
  permissions: StakeholderPermissions;
}) {
  const router = useRouter();
  const { canCreate, canEdit, canAssign, canArchive, role } = permissions;

  const [selected, setSelected] = React.useState<StakeholderRecord | null>(null);
  const [drawerMode, setDrawerMode] = React.useState<DrawerMode | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [archiveTarget, setArchiveTarget] = React.useState<StakeholderRecord | null>(null);
  const [filters, setFilters] = React.useState<StakeholderDirectoryFilters>({
    activeOnly: true,
  });

  const drawerOpen = drawerMode !== null;

  function openView(person: StakeholderRecord) {
    setSelected(person);
    setDrawerMode("view");
  }

  function openCreate() {
    setSelected(null);
    setDrawerMode("create");
  }

  function openEdit(person?: StakeholderRecord) {
    if (person) setSelected(person);
    setDrawerMode("edit");
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelected(null);
  }

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
          p.primaryContact,
          p.nickname,
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
      header: "First name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {initials(fullName(row.original))}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[160px] truncate font-medium" title={row.original.displayName}>
            {row.original.displayName}
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
      id: "department",
      header: "Department",
      accessorFn: (p) => p.department ?? "",
      cell: ({ row }) => (
        <span className="block max-w-[120px] truncate text-sm" title={row.original.department ?? ""}>
          {row.original.department ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "primaryContact",
      header: "Primary contact",
      accessorFn: (p) => p.primaryContact ?? "",
      cell: ({ row }) => (
        <span className="block max-w-[120px] truncate text-sm" title={row.original.primaryContact ?? ""}>
          {row.original.primaryContact ?? "\u2014"}
        </span>
      ),
    },
    {
      id: "participantStatus",
      header: "Status",
      accessorFn: (p) => p.participantStatus,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {titleCase(row.original.participantStatus)}
        </Badge>
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
                {formatStakeholderRole(r)}
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!canEdit}
                onClick={() => canEdit && openEdit(row.original)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canArchive}
                className="text-destructive focus:text-destructive"
                onClick={() => canArchive && setArchiveTarget(row.original)}
              >
                <Trash2 className="mr-2 size-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const exportRows = filtered.map((p) => ({
    firstName: p.displayName,
    surname: p.surname ?? "",
    nickname: p.nickname ?? "",
    role: p.roleDescription ?? "",
    department: p.department ?? "",
    primaryContact: p.primaryContact ?? "",
    status: titleCase(p.participantStatus),
    confidence: titleCase(p.confidence),
    area: p.area?.name ?? "",
    business: p.business?.name ?? "",
    cluster: p.cluster?.name ?? "",
    location: p.location ?? "",
    teams: p.teamAssignments.map((t) => t.team.name).join("; "),
    programmeRoles: p.programmeRoles.map((r) => titleCase(r.roleType)).join("; "),
    stakeholderRoles: p.stakeholderRoles.map((s) => formatStakeholderRole(s)).join("; "),
    email: data.canViewPii ? (p.email ?? "") : "",
    phone: data.canViewPii ? (p.phone ?? "") : "",
    mobile: data.canViewPii ? (p.mobile ?? "") : "",
  }));

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = readStakeholderForm(form);

    const result =
      drawerMode === "create"
        ? await createStakeholder(payload)
        : selected
          ? await updateStakeholder({ id: selected.id, ...payload })
          : { ok: false as const, error: "No stakeholder selected." };

    setSaving(false);
    if (result.ok) {
      toast.success(result.message ?? "Saved");
      closeDrawer();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    setSaving(true);
    const result = await archiveStakeholder({ id: archiveTarget.id });
    setSaving(false);
    if (result.ok) {
      toast.success(result.message ?? "Stakeholder removed");
      if (selected?.id === archiveTarget.id) closeDrawer();
      setArchiveTarget(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function refreshAfterRoleChange() {
    router.refresh();
    toast.success("Role updated");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title=""
        description=""
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 size-4" />
                Add stakeholder
              </Button>
            )}
            <ExportButton
              rows={exportRows}
              filename="stakeholder-directory"
              entity="people"
            />
          </div>
        }
      />

      {!canCreate && !canEdit && !canArchive && (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-3 text-sm">
          Your signed-in account role ({ROLE_DEFINITIONS[role].label}) is read-only for
          the stakeholder directory. Ask an administrator to set your Clerk{" "}
          <code className="text-xs">platformRole</code> to Programme Director or Project
          Manager if you need to manage stakeholders.
        </p>
      )}

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
        onRowClick={openView}
        toolbar={
          canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 size-4" />
              Add stakeholder
            </Button>
          ) : undefined
        }
        emptyTitle="No stakeholders match"
        emptyDescription="Adjust filters or add stakeholders with appropriate permissions."
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          if (!o) closeDrawer();
        }}
        title={
          drawerMode === "create"
            ? "Add stakeholder"
            : selected
              ? fullName(selected)
              : "Stakeholder"
        }
        description={
          drawerMode === "create"
            ? "Create a new programme stakeholder record."
            : selected
              ? conciseRole(selected.roleDescription)
              : undefined
        }
        headerActions={
          drawerMode === "view" && selected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={!canEdit}
                title={canEdit ? "Edit stakeholder" : "Your role cannot edit stakeholders"}
                onClick={() => canEdit && openEdit()}
              >
                <Pencil className="mr-1.5 size-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!canArchive}
                title={canArchive ? "Remove stakeholder" : "Your role cannot remove stakeholders"}
                onClick={() => canArchive && setArchiveTarget(selected)}
              >
                <Trash2 className="mr-1.5 size-4" />
                Remove
              </Button>
            </>
          ) : undefined
        }
        footer={
          drawerMode === "edit" || drawerMode === "create" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  drawerMode === "create" ? closeDrawer() : setDrawerMode("view")
                }
              >
                Cancel
              </Button>
              <Button
                size="sm"
                form="stakeholder-form"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : drawerMode === "create"
                    ? "Create stakeholder"
                    : "Save changes"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && drawerMode === "view" && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="First name">{selected.displayName}</DetailField>
              <DetailField label="Surname">{selected.surname ?? "\u2014"}</DetailField>
              <DetailField label="Nickname">{selected.nickname ?? "\u2014"}</DetailField>
              <DetailField label="Primary contact">{selected.primaryContact ?? "\u2014"}</DetailField>
              <DetailField label="Status">{titleCase(selected.participantStatus)}</DetailField>
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
              <DetailField label="Data steward">
                {selected.dataOwner
                  ? fullName(selected.dataOwner)
                  : "\u2014"}
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
              title="Stakeholder roles"
              items={selected.stakeholderRoles.map((r) => formatStakeholderRole(r))}
            />
            <p className="text-muted-foreground text-xs">
              Person ID: {selected.id} — used for task and action owner assignment.
            </p>
          </div>
        )}

        {(drawerMode === "edit" || drawerMode === "create") && (
          <form
            id="stakeholder-form"
            className="space-y-4"
            onSubmit={handleSave}
            key={drawerMode === "create" ? "create" : selected?.id}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="displayName">First name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={selected?.displayName ?? ""}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  name="surname"
                  defaultValue={selected?.surname ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={selected?.nickname ?? ""}
                  placeholder="e.g. Lennie"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="primaryContact">Primary contact</Label>
                <Input
                  id="primaryContact"
                  name="primaryContact"
                  defaultValue={selected?.primaryContact ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="roleDescription">Role description</Label>
              <Textarea
                id="roleDescription"
                name="roleDescription"
                defaultValue={selected?.roleDescription ?? ""}
                rows={2}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selected?.email ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={selected?.phone ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" name="mobile" defaultValue={selected?.mobile ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department / group</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={selected?.department ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={selected?.location ?? ""}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                name="areaId"
                label="Area"
                defaultValue={selected?.areaId ?? ""}
                options={formOptions.areas.map((a) => ({ value: a.id, label: a.name }))}
              />
              <SelectField
                name="businessId"
                label="Business"
                defaultValue={selected?.businessId ?? ""}
                options={formOptions.businesses.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
              />
              <SelectField
                name="clusterId"
                label="Cluster"
                defaultValue={selected?.clusterId ?? ""}
                options={formOptions.clusters.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <SelectField
                name="primaryWorkstreamId"
                label="Primary workstream"
                defaultValue={selected?.primaryWorkstreamId ?? ""}
                options={formOptions.workstreams.map((w) => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
              <SelectField
                name="contactVisibility"
                label="Contact visibility"
                defaultValue={selected?.contactVisibility ?? "PUBLIC_INTERNAL"}
                options={[
                  { value: "PUBLIC_INTERNAL", label: "Public (internal)" },
                  { value: "RESTRICTED", label: "Restricted" },
                  { value: "NAME_ONLY", label: "Name only" },
                ]}
              />
              <SelectField
                name="confidence"
                label="Data confidence"
                defaultValue={selected?.confidence ?? "INFERRED"}
                options={CONFIDENCE_LEVELS.map((c) => ({
                  value: c,
                  label: titleCase(c),
                }))}
              />
              <SelectField
                name="participantStatus"
                label="Participation status"
                defaultValue={selected?.participantStatus ?? "CONFIRMED"}
                options={PARTICIPANT_STATUSES.map((s) => ({
                  value: s,
                  label: titleCase(s),
                }))}
              />
              <SelectField
                name="dataOwnerPersonId"
                label="Data steward"
                defaultValue={selected?.dataOwnerPersonId ?? ""}
                options={formOptions.people.map((p) => ({
                  value: p.id,
                  label: fullName(p),
                }))}
              />
            </div>

            {drawerMode === "edit" && selected && canAssign && (
              <RoleManagement
                person={selected}
                formOptions={formOptions}
                onChanged={refreshAfterRoleChange}
              />
            )}
          </form>
        )}
      </DetailDrawer>

      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(o) => {
          if (!o) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove stakeholder?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget
                ? `${fullName(archiveTarget)} will be archived and hidden from the directory. Existing task and register owner links are preserved.`
                : "This stakeholder will be archived."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleArchive}
              disabled={saving}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function RoleManagement({
  person,
  formOptions,
  onChanged,
}: {
  person: StakeholderRecord;
  formOptions: FormOptions;
  onChanged: () => void | Promise<void>;
}) {
  const [teamId, setTeamId] = React.useState("none");
  const [programmeRole, setProgrammeRole] = React.useState<string>(PROGRAMME_ROLES[0]);
  const [programmeScope, setProgrammeScope] = React.useState("");
  const [stakeholderRole, setStakeholderRole] = React.useState<string>(STAKEHOLDER_ROLES[0]);
  const [stakeholderLabel, setStakeholderLabel] = React.useState("");
  const [stakeholderScope, setStakeholderScope] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result.ok) {
      await onChanged();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold">Roles & teams</h3>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase">Teams</p>
        <div className="flex flex-wrap gap-1.5">
          {person.teamAssignments.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
              {t.team.name}
              <button
                type="button"
                className="hover:bg-muted rounded px-1"
                disabled={busy}
                onClick={() =>
                  run(() => removeTeam({ personId: person.id, teamId: t.teamId }))
                }
              >
                ×
              </button>
            </Badge>
          ))}
          {!person.teamAssignments.length && (
            <span className="text-muted-foreground text-sm">None recorded.</span>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select team</SelectItem>
              {formOptions.teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || teamId === "none"}
            onClick={() =>
              run(async () => {
                const result = await assignTeam({ personId: person.id, teamId });
                if (result.ok) setTeamId("none");
                return result;
              })
            }
          >
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase">Programme roles</p>
        <div className="flex flex-wrap gap-1.5">
          {person.programmeRoles.map((r) => (
            <Badge key={r.id} variant="secondary" className="gap-1 pr-1">
              {titleCase(r.roleType)}
              {r.scope ? ` (${r.scope})` : ""}
              <button
                type="button"
                className="hover:bg-muted rounded px-1"
                disabled={busy}
                onClick={() =>
                  run(() =>
                    removeProgrammeRole({
                      personId: person.id,
                      roleType: r.roleType,
                      scope: r.scope ?? "",
                    }),
                  )
                }
              >
                ×
              </button>
            </Badge>
          ))}
          {!person.programmeRoles.length && (
            <span className="text-muted-foreground text-sm">None recorded.</span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Select
            value={programmeRole}
            onValueChange={setProgrammeRole}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMME_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {titleCase(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Scope (optional)"
            value={programmeScope}
            onChange={(e) => setProgrammeScope(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const result = await assignProgrammeRole({
                  personId: person.id,
                  roleType: programmeRole as (typeof PROGRAMME_ROLES)[number],
                  scope: programmeScope,
                });
                if (result.ok) setProgrammeScope("");
                return result;
              })
            }
          >
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase">Stakeholder roles</p>
        <div className="flex flex-wrap gap-1.5">
          {person.stakeholderRoles.map((r) => (
            <Badge key={r.id} variant="outline" className="gap-1 pr-1">
              {formatStakeholderRole(r)}
              <button
                type="button"
                className="hover:bg-muted rounded px-1"
                disabled={busy}
                onClick={() => run(() => removeStakeholderRole({ id: r.id }))}
              >
                ×
              </button>
            </Badge>
          ))}
          {!person.stakeholderRoles.length && (
            <span className="text-muted-foreground text-sm">None recorded.</span>
          )}
        </div>
        <div className="grid gap-2">
          <Select
            value={stakeholderRole}
            onValueChange={setStakeholderRole}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAKEHOLDER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {titleCase(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Role label (e.g. External Steerco Member)"
            value={stakeholderLabel}
            onChange={(e) => setStakeholderLabel(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Scope (e.g. External Steerco)"
              value={stakeholderScope}
              onChange={(e) => setStakeholderScope(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const result = await assignStakeholderRole({
                    personId: person.id,
                    roleType: stakeholderRole as (typeof STAKEHOLDER_ROLES)[number],
                    roleLabel: stakeholderLabel,
                    scope: stakeholderScope,
                  });
                  if (result.ok) {
                    setStakeholderLabel("");
                    setStakeholderScope("");
                  }
                  return result;
                })
              }
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
