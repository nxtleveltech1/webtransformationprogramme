"use client";

import * as React from "react";
import { Landmark, Search, Users, CalendarClock, ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/states";
import { DetailDrawer, DetailField } from "@/components/shared/detail-drawer";
import { ExportButton } from "@/components/shared/export-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseMembers, type GovernanceForumRecord } from "@/lib/services/governance";

export function GovernanceClient({ forums }: { forums: GovernanceForumRecord[] }) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<GovernanceForumRecord | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return forums;
    return forums.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.purpose ?? "").toLowerCase().includes(q) ||
        (f.chair ?? "").toLowerCase().includes(q),
    );
  }, [forums, query]);

  const withCadence = forums.filter((f) => f.cadence).length;
  const exportRows = forums.map((f) => ({
    name: f.name,
    chair: f.chair ?? "",
    cadence: f.cadence ?? "",
    purpose: f.purpose ?? "",
    members: f.members ?? "",
    escalation: f.escalation ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Governance"
        description="Programme governance forums: purpose, membership, cadence and escalation routes."
        actions={<ExportButton rows={exportRows} filename="governance-forums" entity="governance" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Forums" value={forums.length} icon={Landmark} />
        <MetricCard label="With cadence" value={withCadence} icon={CalendarClock} tone="info" />
        <MetricCard
          label="With escalation route"
          value={forums.filter((f) => f.escalation).length}
          icon={ArrowUpRight}
          tone="warning"
        />
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search forums..."
          className="pl-8"
          aria-label="Search forums"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No forums found"
          description={
            forums.length === 0
              ? "No governance forums have been defined yet."
              : "No forums match your search."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((forum) => {
            const members = parseMembers(forum.members);
            return (
              <button
                key={forum.id}
                type="button"
                className="text-left"
                onClick={() => setSelected(forum)}
              >
                <Card className="hover:border-primary/40 h-full gap-3 transition-colors">
                  <CardHeader className="gap-1">
                    <CardTitle className="text-base">{forum.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      {forum.cadence && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <CalendarClock className="size-3" />
                          {forum.cadence}
                        </Badge>
                      )}
                      {forum.chair && (
                        <span className="text-muted-foreground text-xs">Chair: {forum.chair}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {forum.purpose && (
                      <p className="text-muted-foreground line-clamp-3 text-sm">{forum.purpose}</p>
                    )}
                    {members.length > 0 && (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Users className="size-3.5" />
                        {members.length} member(s)
                      </div>
                    )}
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? "Forum"}
        description={selected?.cadence ?? undefined}
        footer={
          selected?.escalation ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Escalates to: </span>
              {selected.escalation}
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <DetailField label="Chair">{selected.chair ?? "\u2014"}</DetailField>
            <DetailField label="Cadence">{selected.cadence ?? "\u2014"}</DetailField>
            {selected.purpose && <DetailField label="Purpose">{selected.purpose}</DetailField>}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Members</h3>
              {parseMembers(selected.members).length ? (
                <div className="flex flex-wrap gap-1.5">
                  {parseMembers(selected.members).map((m, i) => (
                    <Badge key={`${m}-${i}`} variant="secondary">
                      {m}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No members recorded.</p>
              )}
            </div>
            {selected.inputs && <DetailField label="Inputs">{selected.inputs}</DetailField>}
            {selected.outputs && <DetailField label="Outputs">{selected.outputs}</DetailField>}
            {selected.escalation && (
              <DetailField label="Escalation">{selected.escalation}</DetailField>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
