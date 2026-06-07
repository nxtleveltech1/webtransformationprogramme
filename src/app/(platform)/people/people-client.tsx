"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Contact, Users2, Star } from "lucide-react";

import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { DetailDrawer, DetailField, DetailGrid } from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fullName, initials, titleCase } from "@/lib/utils";
import type { PersonWithRelations, TeamWithMembers } from "@/lib/services/people";

export function PeopleClient({
  people,
  teams,
}: {
  people: PersonWithRelations[];
  teams: TeamWithMembers[];
}) {
  const [selectedPerson, setSelectedPerson] = React.useState<PersonWithRelations | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<TeamWithMembers | null>(null);

  const stakeholderCount = people.filter((p) => p.stakeholderRoles.length > 0).length;

  const columns: ColumnDef<PersonWithRelations>[] = [
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
          <span className="font-medium">{row.original.displayName}</span>
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
      header: "Role",
      accessorFn: (p) => p.roleDescription ?? "",
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.roleDescription ?? "\u2014"}</span>
      ),
    },
    {
      id: "teams",
      header: "Teams",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.teamAssignments.length ? (
            row.original.teamAssignments.map((t) => (
              <Badge key={t.id} variant="outline" className="text-xs">
                {t.team.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">{"\u2014"}</span>
          )}
        </div>
      ),
    },
    {
      id: "stakeholder",
      header: "Stakeholder roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.stakeholderRoles.length ? (
            row.original.stakeholderRoles.map((s) => (
              <Badge key={s.id} variant="secondary" className="text-xs">
                {titleCase(s.roleType)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">{"\u2014"}</span>
          )}
        </div>
      ),
    },
  ];

  const exportRows = people.map((p) => ({
    firstName: p.displayName,
    surname: p.surname ?? "",
    role: p.roleDescription ?? "",
    teams: p.teamAssignments.map((t) => t.team.name).join("; "),
    stakeholderRoles: p.stakeholderRoles.map((s) => titleCase(s.roleType)).join("; "),
    email: p.email ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="People & Teams"
        description="Programme people, their team memberships and stakeholder roles."
        actions={<ExportButton rows={exportRows} filename="people" entity="people" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="People" value={people.length} icon={Contact} />
        <MetricCard label="Teams" value={teams.length} icon={Users2} tone="info" />
        <MetricCard label="Stakeholders" value={stakeholderCount} icon={Star} tone="warning" />
      </div>

      <Tabs defaultValue="people">
        <TabsList>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="pt-4">
          <DataTable
            columns={columns}
            data={people}
            searchPlaceholder="Search people..."
            onRowClick={(p) => setSelectedPerson(p)}
            emptyTitle="No people"
            emptyDescription="No people are recorded in the programme yet."
          />
        </TabsContent>

        <TabsContent value="teams" className="pt-4">
          {teams.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="text-left"
                  onClick={() => setSelectedTeam(team)}
                >
                  <Card className="hover:border-primary/40 h-full gap-3 transition-colors">
                    <CardHeader className="gap-1">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      <p className="text-muted-foreground text-xs">
                        {team.members.length} member(s)
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {team.functionDescription && (
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {team.functionDescription}
                        </p>
                      )}
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 6).map((m) => (
                          <Avatar key={m.id} className="border-background size-7 border-2">
                            <AvatarFallback className="text-xs">
                              {initials(m.person.displayName)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 6 && (
                          <span className="bg-muted text-muted-foreground border-background flex size-7 items-center justify-center rounded-full border-2 text-xs">
                            +{team.members.length - 6}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <SectionHeader title="No teams" description="No teams have been defined." />
          )}
        </TabsContent>
      </Tabs>

      <DetailDrawer
        open={!!selectedPerson}
        onOpenChange={(o) => !o && setSelectedPerson(null)}
        title={selectedPerson?.displayName ?? "Person"}
        description={selectedPerson?.roleDescription ?? undefined}
      >
        {selectedPerson && (
          <div className="space-y-6">
            <DetailGrid>
              <DetailField label="Email">{selectedPerson.email ?? "\u2014"}</DetailField>
              <DetailField label="Confidence">{titleCase(selectedPerson.confidence)}</DetailField>
            </DetailGrid>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Teams</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedPerson.teamAssignments.length ? (
                  selectedPerson.teamAssignments.map((t) => (
                    <Badge key={t.id} variant="outline">
                      {t.team.name}
                      {t.isPrimary ? " (primary)" : ""}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No team memberships.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Stakeholder roles</h3>
              {selectedPerson.stakeholderRoles.length ? (
                <ul className="space-y-2">
                  {selectedPerson.stakeholderRoles.map((s) => (
                    <li key={s.id} className="rounded-lg border px-3 py-2 text-sm">
                      <Badge variant="secondary">{titleCase(s.roleType)}</Badge>
                      {s.scope && <p className="text-muted-foreground mt-1 text-xs">{s.scope}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No stakeholder roles.</p>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <DetailDrawer
        open={!!selectedTeam}
        onOpenChange={(o) => !o && setSelectedTeam(null)}
        title={selectedTeam?.name ?? "Team"}
        description={selectedTeam?.functionDescription ?? undefined}
      >
        {selectedTeam && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Members ({selectedTeam.members.length})</h3>
            {selectedTeam.members.length ? (
              <ul className="space-y-2">
                {selectedTeam.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {initials(m.person.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {m.person.displayName}
                        {m.isPrimary && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Primary
                          </Badge>
                        )}
                      </p>
                      {m.person.roleDescription && (
                        <p className="text-muted-foreground truncate text-xs">
                          {m.person.roleDescription}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No members.</p>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
