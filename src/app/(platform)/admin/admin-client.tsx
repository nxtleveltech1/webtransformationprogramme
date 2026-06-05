"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, ShieldCheck, KeyRound, ScrollText, Plus, X, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { ExportButton } from "@/components/shared/export-button";
import { Can } from "@/components/shared/can";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate, titleCase } from "@/lib/utils";
import { RAG_OPTIONS } from "@/lib/enums";
import type {
  AdminUser,
  AdminRole,
  AdminPermission,
  AuditEventRecord,
  ProgrammeSettings,
} from "@/lib/services/admin";
import {
  updateUser,
  assignRole,
  removeRole,
  updateProgrammeSettings,
} from "@/server/actions/admin";

export function AdminClient({
  users,
  roles,
  permissions,
  auditEvents,
  programme,
}: {
  users: AdminUser[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  auditEvents: AuditEventRecord[];
  programme: ProgrammeSettings;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Manage users, roles, permissions, programme settings and the audit trail."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Users" value={users.length} icon={Users} />
        <MetricCard label="Roles" value={roles.length} icon={ShieldCheck} tone="info" />
        <MetricCard label="Permissions" value={permissions.length} icon={KeyRound} />
        <MetricCard label="Audit events" value={auditEvents.length} icon={ScrollText} tone="default" />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <UsersTab users={users} roles={roles} />
        </TabsContent>
        <TabsContent value="roles" className="pt-4">
          <RolesTab roles={roles} />
        </TabsContent>
        <TabsContent value="permissions" className="pt-4">
          <PermissionsTab permissions={permissions} />
        </TabsContent>
        <TabsContent value="settings" className="pt-4">
          <SettingsTab programme={programme} />
        </TabsContent>
        <TabsContent value="audit" className="pt-4">
          <AuditTab events={auditEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────

function UsersTab({ users, roles }: { users: AdminUser[]; roles: AdminRole[] }) {
  const [selected, setSelected] = React.useState<AdminUser | null>(null);
  const current = selected ? users.find((u) => u.id === selected.id) ?? selected : null;

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.displayName}</span>,
    },
    { accessorKey: "email", header: "Email" },
    {
      id: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length ? (
            row.original.roles.map((r) => (
              <Badge key={r.id} variant="outline" className="text-xs">
                {r.role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
        </div>
      ),
    },
    {
      id: "active",
      header: "Status",
      accessorFn: (u) => (u.active ? "Active" : "Inactive"),
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "ACTIVE" : "ARCHIVED"} />
      ),
    },
  ];

  const exportRows = users.map((u) => ({
    name: u.displayName,
    email: u.email,
    roles: u.roles.map((r) => r.role.name).join("; "),
    active: u.active ? "Yes" : "No",
  }));

  return (
    <div className="space-y-3">
      <SectionHeader
        title="User management"
        description="Platform users, their roles and account status."
        actions={<ExportButton rows={exportRows} filename="users" entity="admin" />}
      />
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users..."
        onRowClick={(u) => setSelected(u)}
        emptyTitle="No users"
        emptyDescription="No user accounts exist yet."
      />
      <UserDrawer
        user={current}
        roles={roles}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function UserDrawer({
  user,
  roles,
  onClose,
}: {
  user: AdminUser | null;
  roles: AdminRole[];
  onClose: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [addRoleId, setAddRoleId] = React.useState<string>("");

  async function toggleActive(next: boolean) {
    if (!user) return;
    setPending(true);
    const result = await updateUser({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      active: next,
    });
    setPending(false);
    if (result.ok) toast.success(result.message ?? "Updated");
    else toast.error(result.error);
  }

  async function handleAddRole() {
    if (!user || !addRoleId) return;
    setPending(true);
    const result = await assignRole({ userId: user.id, roleId: addRoleId });
    setPending(false);
    setAddRoleId("");
    if (result.ok) toast.success(result.message ?? "Assigned");
    else toast.error(result.error);
  }

  async function handleRemoveRole(roleId: string) {
    if (!user) return;
    setPending(true);
    const result = await removeRole({ userId: user.id, roleId });
    setPending(false);
    if (result.ok) toast.success(result.message ?? "Removed");
    else toast.error(result.error);
  }

  const assignedRoleIds = new Set(user?.roles.map((r) => r.role.id) ?? []);
  const availableRoles = roles.filter((r) => !assignedRoleIds.has(r.id));

  return (
    <DetailDrawer
      open={!!user}
      onOpenChange={(o) => !o && onClose()}
      title={user?.displayName ?? "User"}
      description={user?.email}
    >
      {user && (
        <div className="space-y-6">
          <DetailGrid>
            <DetailField label="Linked person">
              {user.person?.displayName ?? "\u2014"}
            </DetailField>
            <DetailField label="External ref">{user.externalRef ?? "\u2014"}</DetailField>
          </DetailGrid>

          <Can
            action="edit"
            entity="admin"
            fallback={
              <DetailField label="Account status">
                {user.active ? "Active" : "Inactive"}
              </DetailField>
            }
          >
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Account active</p>
                <p className="text-muted-foreground text-xs">
                  Inactive users cannot access the platform.
                </p>
              </div>
              <Switch
                checked={user.active}
                onCheckedChange={toggleActive}
                disabled={pending}
                aria-label="Toggle account active"
              />
            </div>
          </Can>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Assigned roles</h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.length ? (
                user.roles.map((r) => (
                  <Badge key={r.id} variant="secondary" className="gap-1">
                    {r.role.name}
                    <Can action="edit" entity="admin">
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(r.role.id)}
                        disabled={pending}
                        className="hover:text-rag-red"
                        aria-label={`Remove ${r.role.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Can>
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No roles assigned.</p>
              )}
            </div>
            <Can action="edit" entity="admin">
              {availableRoles.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Select value={addRoleId} onValueChange={setAddRoleId}>
                    <SelectTrigger size="sm" className="w-48" aria-label="Add role">
                      <SelectValue placeholder="Add a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddRole} disabled={!addRoleId || pending}>
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
              )}
            </Can>
          </div>
        </div>
      )}
    </DetailDrawer>
  );
}

// ─── Roles ────────────────────────────────────────────────────────────────

function RolesTab({ roles }: { roles: AdminRole[] }) {
  const [selected, setSelected] = React.useState<AdminRole | null>(null);

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Role management"
        description="Roles and the permissions they grant. System roles are read-only."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roles.map((role) => (
          <button key={role.id} type="button" className="text-left" onClick={() => setSelected(role)}>
            <Card className="hover:border-primary/40 h-full gap-3 transition-colors">
              <CardHeader className="gap-1">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground font-mono text-xs">{role.key}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {role.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">{role.description}</p>
                )}
                <div className="text-muted-foreground flex gap-3 text-xs">
                  <span>{role._count.users} users</span>
                  <span>{role._count.permissions} permissions</span>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? "Role"}
        description={selected?.key}
      >
        {selected && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Users">{selected._count.users}</DetailField>
              <DetailField label="Permissions">{selected._count.permissions}</DetailField>
              <DetailField label="System role">{selected.isSystem ? "Yes" : "No"}</DetailField>
            </DetailGrid>
            {selected.description && (
              <DetailField label="Description">{selected.description}</DetailField>
            )}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Permissions ({selected.permissions.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {selected.permissions.length ? (
                  selected.permissions.map((p) => (
                    <Badge key={p.id} variant="outline" className="font-mono text-xs">
                      {p.permission.key}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No permissions assigned.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

// ─── Permissions ──────────────────────────────────────────────────────────

function PermissionsTab({ permissions }: { permissions: AdminPermission[] }) {
  const [entityFilter, setEntityFilter] = React.useState<string>("ALL");
  const entities = React.useMemo(
    () => Array.from(new Set(permissions.map((p) => p.entity))).sort(),
    [permissions],
  );
  const filtered = React.useMemo(
    () => (entityFilter === "ALL" ? permissions : permissions.filter((p) => p.entity === entityFilter)),
    [permissions, entityFilter],
  );

  const columns: ColumnDef<AdminPermission>[] = [
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.key}</span>,
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => <Badge variant="outline">{row.original.entity}</Badge>,
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => titleCase(row.original.action),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description ?? "\u2014",
    },
  ];

  const exportRows = permissions.map((p) => ({
    key: p.key,
    entity: p.entity,
    action: p.action,
    description: p.description ?? "",
  }));

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Permission catalogue"
        description="All permissions available for assignment to roles."
        actions={<ExportButton rows={exportRows} filename="permissions" entity="admin" />}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search permissions..."
        emptyTitle="No permissions"
        emptyDescription="No permissions match the filter."
        toolbar={
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger size="sm" className="w-40" aria-label="Filter by entity">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All entities</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────

const RAG_NONE = "__none__";

function SettingsTab({ programme }: { programme: ProgrammeSettings }) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [rag, setRag] = React.useState<string>(programme?.rag ?? RAG_NONE);

  if (!programme) {
    return (
      <p className="text-muted-foreground text-sm">No programme configured.</p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!programme) return;
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const result = await updateProgrammeSettings({
      id: programme.id,
      name: String(fd.get("name") ?? ""),
      hardDeadline: String(fd.get("hardDeadline") ?? ""),
      mvpSummary: String(fd.get("mvpSummary") ?? ""),
      rag: rag === RAG_NONE ? null : rag,
    });
    setPending(false);
    if (result.ok) {
      toast.success(result.message ?? "Saved");
    } else {
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
      toast.error(result.error);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="size-4" />
            Programme settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Programme name</Label>
              <Input id="name" name="name" defaultValue={programme.name} required />
              {errors.name && <p className="text-rag-red text-xs">{errors.name[0]}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="hardDeadline">Hard deadline</Label>
                <Input
                  id="hardDeadline"
                  name="hardDeadline"
                  defaultValue={programme.hardDeadline ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>Overall RAG</Label>
                <Select value={rag} onValueChange={setRag}>
                  <SelectTrigger aria-label="Overall RAG">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RAG_NONE}>Not set</SelectItem>
                    {RAG_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {titleCase(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mvpSummary">MVP summary</Label>
              <Textarea
                id="mvpSummary"
                name="mvpSummary"
                rows={4}
                defaultValue={programme.mvpSummary ?? ""}
              />
            </div>
            <div className="flex items-center gap-3">
              <RagIndicator value={(rag === RAG_NONE ? null : rag) as "RED" | "AMBER" | "GREEN" | null} />
              <Can
                action="edit"
                entity="admin"
                fallback={<p className="text-muted-foreground text-sm">Read-only</p>}
              >
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save settings"}
                </Button>
              </Can>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Escalation alerts</p>
              <p className="text-muted-foreground text-xs">
                Notify directors when items are escalated.
              </p>
            </div>
            <Switch defaultChecked disabled aria-label="Escalation alerts" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Approval reminders</p>
              <p className="text-muted-foreground text-xs">
                Daily digest of pending approvals.
              </p>
            </div>
            <Switch defaultChecked disabled aria-label="Approval reminders" />
          </div>
          <p className="text-muted-foreground text-xs">
            Notification delivery channels are managed by the platform and not yet configurable
            from this screen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Audit ────────────────────────────────────────────────────────────────

function AuditTab({ events }: { events: AuditEventRecord[] }) {
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<AuditEventRecord | null>(null);

  const types = React.useMemo(
    () => Array.from(new Set(events.map((e) => e.entityType))).sort(),
    [events],
  );
  const filtered = React.useMemo(
    () => (typeFilter === "ALL" ? events : events.filter((e) => e.entityType === typeFilter)),
    [events, typeFilter],
  );

  const columns: ColumnDef<AuditEventRecord>[] = [
    {
      accessorKey: "createdAt",
      header: "When",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.original.createdAt).toLocaleString("en-GB")}
        </span>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Entity",
      cell: ({ row }) => <Badge variant="outline">{row.original.entityType}</Badge>,
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => titleCase(row.original.action),
    },
    {
      accessorKey: "actorName",
      header: "Actor",
      cell: ({ row }) => row.original.actorName ?? "system",
    },
  ];

  const exportRows = events.map((e) => ({
    when: new Date(e.createdAt).toISOString(),
    entityType: e.entityType,
    entityId: e.entityId,
    action: e.action,
    actor: e.actorName ?? "system",
  }));

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Audit log"
        description={`Most recent ${events.length} audit events.`}
        actions={<ExportButton rows={exportRows} filename="audit-log" entity="admin" />}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search audit log..."
        onRowClick={(e) => setSelected(e)}
        emptyTitle="No audit events"
        emptyDescription="No audit events have been recorded yet."
        toolbar={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger size="sm" className="w-40" aria-label="Filter by entity type">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All entities</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.entityType} · ${titleCase(selected.action)}` : "Audit event"}
        description={selected ? new Date(selected.createdAt).toLocaleString("en-GB") : undefined}
      >
        {selected && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Entity type">{selected.entityType}</DetailField>
              <DetailField label="Entity ID">
                <span className="font-mono text-xs break-all">{selected.entityId}</span>
              </DetailField>
              <DetailField label="Action">{titleCase(selected.action)}</DetailField>
              <DetailField label="Actor">{selected.actorName ?? "system"}</DetailField>
              <DetailField label="Actor role">{selected.actorRole ?? "\u2014"}</DetailField>
              <DetailField label="Timestamp">{formatDate(selected.createdAt)}</DetailField>
            </DetailGrid>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Payload</h3>
              <pre className={cn(
                "bg-muted max-h-80 overflow-auto rounded-lg p-3 text-xs",
                !selected.payload && "text-muted-foreground",
              )}>
                {selected.payload ? JSON.stringify(selected.payload, null, 2) : "No payload"}
              </pre>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
