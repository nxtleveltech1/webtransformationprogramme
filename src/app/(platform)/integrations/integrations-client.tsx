"use client";

import * as React from "react";
import { Plug, PlugZap, Layers, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SystemPlatformRecord } from "@/lib/services/integrations";

export function IntegrationsClient({
  groups,
  total,
}: {
  groups: { category: string; items: SystemPlatformRecord[] }[];
  total: number;
}) {
  const [query, setQuery] = React.useState("");

  const filteredGroups = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        category: g.category,
        items: g.items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.ownerTeam ?? "").toLowerCase().includes(q) ||
            (i.notes ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Catalogue of systems and platforms in the programme landscape. Connection management is read-only for now."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Systems catalogued" value={total} icon={Plug} />
        <MetricCard label="Categories" value={groups.length} icon={Layers} tone="info" />
        <MetricCard
          label="Connected"
          value={0}
          icon={PlugZap}
          tone="warning"
          hint="No live connections configured"
        />
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search systems..."
          className="pl-8"
          aria-label="Search systems"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="No systems found"
          description="No systems match your search."
        />
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight">{group.category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((system) => (
                  <Card key={system.id} className="gap-3">
                    <CardHeader className="gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{system.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className="text-muted-foreground shrink-0 text-xs"
                        >
                          Not connected
                        </Badge>
                      </div>
                      {system.ownerTeam && (
                        <p className="text-muted-foreground text-xs">
                          Owner: {system.ownerTeam}
                        </p>
                      )}
                    </CardHeader>
                    {system.notes && (
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{system.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
