import Link from "next/link";
import {
  Briefcase,
  FolderKanban,
  Network,
  ListChecks,
  AlertTriangle,
  Bug,
  GitBranch,
  Gavel,
  Landmark,
  Target,
} from "lucide-react";

import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RagHero } from "@/components/shared/rag-hero";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ViewGuard } from "@/components/shared/can";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatOwnerDisplay, formatWorkstreamLead } from "@/lib/format-person";
import { cn, titleCase } from "@/lib/utils";
import { getProgrammeWorkspace } from "@/lib/services/programme";
import { ProgrammeEditButton } from "./programme-client";

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  let workspace: Awaited<ReturnType<typeof getProgrammeWorkspace>> = null;
  try {
    workspace = await getProgrammeWorkspace();
  } catch {
    return (
      <ErrorState description="The programme workspace could not be loaded. Please try again." />
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No programme found"
        description="The programme record has not been seeded yet."
      />
    );
  }

  const { programme, counts, decisions, forums, resourceConstraints } = workspace;
  const platformMetrics = programme.metrics.filter((m) => m.category === "PLATFORM");
  const customerMetrics = programme.metrics.filter((m) => m.category === "CUSTOMER");

  return (
    <ViewGuard entity="programme" entityLabel="the programme workspace">
      <div className="space-y-6">
        <PageHeader
          title={programme.name}
          description={programme.purpose ?? "Programme control workspace."}
          actions={
            <div className="flex items-center gap-3">
              <RagIndicator value={programme.rag} />
              <ProgrammeEditButton
                programme={{
                  id: programme.id,
                  name: programme.name,
                  purpose: programme.purpose,
                  scopeTension: programme.scopeTension,
                  hardDeadline: programme.hardDeadline,
                  mvpSummary: programme.mvpSummary,
                  rag: programme.rag,
                }}
              />
            </div>
          }
        />

        <RagHero
          rag={programme.rag}
          eyebrow="Programme position"
          headline={programme.name}
          narrative={
            programme.scopeTension ??
            programme.purpose ??
            "Programme delivery position across scope, capacity and governance."
          }
          positionValue={programme.hardDeadline ?? undefined}
          positionLabel={programme.hardDeadline ? "Hard deadline" : undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Workstreams" value={counts.workstreams} icon={Network} href="/workstreams" />
          <MetricCard label="Projects" value={counts.projects} icon={FolderKanban} href="/projects" />
          <MetricCard label="Open actions" value={counts.openActions} icon={ListChecks} tone="info" href="/tasks" />
          <MetricCard label="Success metrics" value={counts.metrics} icon={Target} tone="success" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Open risks" value={counts.risks} icon={AlertTriangle} tone="danger" href="/risks" />
          <MetricCard label="Open issues" value={counts.issues} icon={Bug} tone="warning" href="/issues" />
          <MetricCard label="Open dependencies" value={counts.dependencies} icon={GitBranch} tone="info" href="/dependencies" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="size-4" /> Programme framing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Field label="Purpose">{programme.purpose ?? "—"}</Field>
              <Separator />
              <Field label="Scope tension">{programme.scopeTension ?? "—"}</Field>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hard deadline">{programme.hardDeadline ?? "—"}</Field>
                <Field label="Status">
                  <StatusBadge status={programme.status} />
                </Field>
              </div>
              {programme.mvpSummary && (
                <>
                  <Separator />
                  <Field label="MVP summary">{programme.mvpSummary}</Field>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Success metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricGroup title="Platform" metrics={platformMetrics} />
              <MetricGroup title="Customer" metrics={customerMetrics} />
              {programme.metrics.length === 0 && (
                <p className="text-muted-foreground text-sm">No success metrics defined.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {programme.scopeOptions.length > 0 && (
          <Card className="from-rag-amber/10 border-rag-amber/30 bg-gradient-to-br to-transparent">
            <CardHeader>
              <SectionHeader
                title="The defining question — scope tension"
                description="The programme's master tension and the scope options under consideration."
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {programme.scopeTension && (
                <p className="text-foreground border-rag-amber/50 border-l-2 pl-3 text-sm font-medium italic">
                  {programme.scopeTension}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {programme.scopeOptions.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={cn(
                      "bg-card rounded-lg border border-t-4 p-3",
                      SCOPE_ACCENTS[i % SCOPE_ACCENTS.length],
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{opt.name}</p>
                      {opt.status && <StatusBadge status={opt.status} />}
                    </div>
                    {opt.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{opt.description}</p>
                    )}
                    {opt.appetite && (
                      <p className="text-muted-foreground mt-2 text-xs">Appetite: {opt.appetite}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {resourceConstraints.length > 0 && (
          <Card>
            <CardHeader>
              <SectionHeader
                title="Capacity & throughput signals"
                description="Resourcing constraints affecting delivery pace."
              />
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resourceConstraints.map((rc) => (
                <div key={rc.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{rc.role ?? rc.namedResource ?? "Resource"}</p>
                    {rc.confirmedVsSuggested && (
                      <Badge variant="outline" className="text-xs">{rc.confirmedVsSuggested}</Badge>
                    )}
                  </div>
                  {rc.namedResource && rc.role && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{rc.namedResource}</p>
                  )}
                  {rc.capacityConcern && (
                    <p className="text-muted-foreground mt-1.5 text-sm">{rc.capacityConcern}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <SectionHeader title="Workstreams" description="Delivery streams in this programme." />
            </CardHeader>
            <CardContent className="space-y-2">
              {programme.workstreams.length === 0 ? (
                <p className="text-muted-foreground text-sm">No workstreams yet.</p>
              ) : (
                programme.workstreams.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workstreams/${ws.id}`}
                    className="hover:bg-accent/40 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        <span className="text-muted-foreground mr-2 text-xs">{ws.code}</span>
                        {ws.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {formatWorkstreamLead(ws.leadText, ws.leadPerson)} · {ws._count.projects} projects ·{" "}
                        {ws._count.risks} risks
                      </p>
                    </div>
                    <RagIndicator value={ws.rag} showLabel={false} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeader title="Projects" description="Projects derived from workstreams." />
            </CardHeader>
            <CardContent className="space-y-2">
              {programme.projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">No projects yet.</p>
              ) : (
                programme.projects.slice(0, 10).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="hover:bg-accent/40 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.code && <span className="text-muted-foreground mr-2 text-xs">{p.code}</span>}
                        {p.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {formatOwnerDisplay(p.ownerText, p.ownerPerson)}
                        {p.workstream ? ` · ${p.workstream.code}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <RagIndicator value={p.rag} showLabel={false} />
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gavel className="size-4" /> Recent decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {decisions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No decisions recorded.</p>
              ) : (
                decisions.map((d) => (
                  <div key={d.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        <span className="text-muted-foreground mr-2 text-xs">{d.externalId}</span>
                        {d.title ?? titleCase(d.description.slice(0, 60))}
                      </p>
                      <StatusBadge status={d.status} />
                    </div>
                    {d.title && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{d.description}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Landmark className="size-4" /> Governance forums
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {forums.length === 0 ? (
                <p className="text-muted-foreground text-sm">No governance forums defined.</p>
              ) : (
                forums.map((f) => (
                  <div key={f.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{f.name}</p>
                      {f.cadence && <Badge variant="outline">{f.cadence}</Badge>}
                    </div>
                    {f.purpose && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{f.purpose}</p>
                    )}
                    {f.chair && (
                      <p className="text-muted-foreground mt-2 text-xs">Chair: {f.chair}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ViewGuard>
  );
}

const SCOPE_ACCENTS = [
  "border-t-rag-green/70",
  "border-t-rag-amber/70",
  "border-t-brand-future/70",
  "border-t-brand-heritage/70",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className="text-sm whitespace-pre-wrap">{children}</div>
    </div>
  );
}

function MetricGroup({
  title,
  metrics,
}: {
  title: string;
  metrics: { id: string; name: string; confirmed: boolean }[];
}) {
  if (metrics.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</p>
      <ul className="space-y-1">
        {metrics.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm">
            <span className={m.confirmed ? "bg-rag-green size-1.5 rounded-full" : "bg-rag-amber size-1.5 rounded-full"} aria-hidden />
            <span>{m.name}</span>
            {!m.confirmed && <span className="text-muted-foreground text-xs">(unconfirmed)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
