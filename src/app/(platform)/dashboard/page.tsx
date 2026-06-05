import Link from "next/link";
import {
  AlertTriangle,
  Bug,
  CheckSquare,
  FolderKanban,
  GitBranch,
  ListChecks,
  Network,
  Flag,
  ArrowRight,
  ShieldAlert,
  Megaphone,
  FileText,
  Gauge,
  PackageCheck,
  FileSearch,
  Route,
} from "lucide-react";

import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RagHero } from "@/components/shared/rag-hero";
import { RagIndicator } from "@/components/shared/rag-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ViewGuard } from "@/components/shared/can";
import { EmptyState, ErrorState } from "@/components/shared/states";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RagBar } from "@/components/charts/rag-bar";
import { RiskHeatmap } from "@/components/charts/risk-heatmap";
import { IssueAgeing } from "@/components/charts/issue-ageing";
import { MilestoneProgress } from "@/components/charts/milestone-progress";
import { getDashboardData, type DashboardData } from "@/lib/services/dashboard";
import { formatDate, titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let data: DashboardData | null = null;
  try {
    data = await getDashboardData();
  } catch {
    data = null;
  }

  return (
    <ViewGuard entity="report" entityLabel="the executive dashboard">
      {data ? <DashboardView data={data} /> : <DashboardError />}
    </ViewGuard>
  );
}

function DashboardError() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Programme-wide health, risks, and governance at a glance."
      />
      <ErrorState description="We couldn't load the programme dashboard. Please try again." />
    </div>
  );
}

function DashboardView({ data }: { data: DashboardData }) {
  const m = data.metrics;
  const rag = data.programme?.rag as "RED" | "AMBER" | "GREEN" | null;

  const narrative =
    `${m.openRisks} open risks, ${m.openIssues} live issues and ${m.overdueActions} open actions across ` +
    `${m.workstreams} workstreams and ${m.activeProjects} active projects. ` +
    `${m.pendingApprovals} approvals await a decision; ${m.blockedDependencies} dependencies are blocked. ` +
    `Readiness is ${m.readinessScore}% with ${m.criticalPathTasks} critical-path WBS tasks.`;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Executive command dashboard"
        description={
          data.programme?.name ?? "Programme-wide health, risks, and governance at a glance."
        }
        actions={
          <Button asChild size="sm">
            <Link href="/reports">
              Steering committee pack
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <ControlStrip
          rag={rag}
          milestonePercentComplete={data.milestonePercentComplete}
          pendingApprovals={m.pendingApprovals}
          blockedDependencies={m.blockedDependencies}
          readinessScore={m.readinessScore}
        />
      </PageHeader>

      <RagHero
        rag={rag}
        eyebrow="Overall programme position"
        headline="Programme status"
        narrative={narrative}
        positionValue={rag ? `${rag.charAt(0)}${rag.slice(1).toLowerCase()}` : "—"}
        positionLabel="Confidence rating"
      />

      {/* Metric cards */}
      <section
        aria-label="Programme metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5"
      >
        <MetricCard
          label="Programme RAG"
          value={<RagIndicator value={rag} />}
          icon={ShieldAlert}
          tone={rag === "RED" ? "danger" : rag === "AMBER" ? "warning" : "success"}
        />
        <MetricCard
          label="Active projects"
          value={m.activeProjects}
          icon={FolderKanban}
          tone="info"
          href="/projects"
        />
        <MetricCard
          label="Workstreams"
          value={m.workstreams}
          icon={Network}
          href="/workstreams"
        />
        <MetricCard
          label="Open risks"
          value={m.openRisks}
          icon={AlertTriangle}
          tone={m.openRisks > 0 ? "warning" : "success"}
          href="/risks"
        />
        <MetricCard
          label="Open issues"
          value={m.openIssues}
          icon={Bug}
          tone={m.openIssues > 0 ? "warning" : "success"}
          href="/issues"
        />
        <MetricCard
          label="Overdue / open actions"
          value={m.overdueActions}
          icon={ListChecks}
          tone={m.overdueActions > 0 ? "warning" : "default"}
          hint="Status not done"
          href="/tasks"
        />
        <MetricCard
          label="Pending approvals"
          value={m.pendingApprovals}
          icon={CheckSquare}
          tone={m.pendingApprovals > 0 ? "warning" : "success"}
          href="/approvals"
        />
        <MetricCard
          label="Upcoming milestones"
          value={m.upcomingMilestones}
          icon={Flag}
          href="/milestones"
        />
        <MetricCard
          label="Blocked dependencies"
          value={m.blockedDependencies}
          icon={GitBranch}
          tone={m.blockedDependencies > 0 ? "danger" : "success"}
          href="/dependencies"
        />
        <MetricCard
          label="Deliverables"
          value={m.deliverables}
          icon={PackageCheck}
          href="/deliverables"
        />
        <MetricCard
          label="Readiness score"
          value={`${m.readinessScore}%`}
          icon={Gauge}
          tone={m.blockedReadinessGates > 0 ? "danger" : "warning"}
          hint={`${m.blockedReadinessGates} blocked gate(s)`}
          href="/readiness"
        />
        <MetricCard
          label="Critical-path WBS"
          value={m.criticalPathTasks}
          icon={Route}
          tone="warning"
          href="/wbs"
        />
        <MetricCard
          label="Evidence follow-up"
          value={m.evidenceFollowUps}
          icon={FileSearch}
          tone={m.evidenceFollowUps > 0 ? "warning" : "success"}
          href="/evidence"
        />
      </section>

      {/* Charts */}
      <section
        aria-label="Programme analytics"
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <ChartCard
          title="Project RAG distribution"
          description="Delivery confidence across active projects"
          accent="sky"
        >
          <RagBar data={data.ragDistribution} emptyMessage="No projects yet" />
        </ChartCard>

        <ChartCard
          title="Risk heatmap"
          description="Open and closed risks by probability and impact"
          accent="cerise"
        >
          <RiskHeatmap risks={data.riskHeatmap} />
        </ChartCard>

        <ChartCard
          title="Issue ageing"
          description="Time since issues were raised"
          accent="naartjie"
        >
          <IssueAgeing data={data.issueAgeing} />
        </ChartCard>

        <ChartCard
          title="Milestone progress"
          description="Delivery against planned milestones"
          accent="sun"
        >
          <MilestoneProgress
            data={data.milestoneStatus}
            percentComplete={data.milestonePercentComplete}
          />
        </ChartCard>
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-4">
        <TopRisksCard risks={data.topRisks} />
        <EscalationsCard escalations={data.escalations} />
        <ApprovalsCard approvals={data.pendingApprovalsList} />
        <ExecSummaryCard summary={data.execSummary} />
      </section>
    </div>
  );
}

function ControlStrip({
  rag,
  milestonePercentComplete,
  pendingApprovals,
  blockedDependencies,
  readinessScore,
}: {
  rag: "RED" | "AMBER" | "GREEN" | null;
  milestonePercentComplete: number;
  pendingApprovals: number;
  blockedDependencies: number;
  readinessScore: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <div className="rounded-2xl border bg-card/80 p-4 shadow-sm md:col-span-1">
        <p className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          Current position
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <RagIndicator value={rag} />
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
            Live
          </Badge>
        </div>
      </div>
      <SignalCard
        accent="naartjie"
        label="Delivery movement"
        value={`${milestonePercentComplete}%`}
        meta="planned milestones complete"
      >
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-om-heritage-fresh"
            style={{ width: `${milestonePercentComplete}%` }}
          />
        </div>
      </SignalCard>
      <SignalCard
        accent="sun"
        label="Approval focus"
        value={pendingApprovals}
        meta="items awaiting decision"
      />
      <SignalCard
        accent="cerise"
        label="Escalation pressure"
        value={blockedDependencies}
        meta="blocked dependencies"
      />
      <SignalCard
        accent="sky"
        label="Launch readiness"
        value={`${readinessScore}%`}
        meta="go/no-go gate score"
      />
    </div>
  );
}

type Accent = "sky" | "sun" | "naartjie" | "cerise";

const ACCENT_CLASS: Record<Accent, string> = {
  sky: "ci-accent-sky",
  sun: "ci-accent-sun",
  naartjie: "ci-accent-naartjie",
  cerise: "ci-accent-cerise",
};

function SignalCard({
  accent,
  label,
  value,
  meta,
  children,
}: {
  accent: Accent;
  label: string;
  value: React.ReactNode;
  meta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`ci-accent-card ${ACCENT_CLASS[accent]} relative overflow-hidden rounded-2xl border p-4 shadow-sm`}>
      <span className="ci-accent-marker absolute inset-y-4 left-0 w-1 rounded-r-full" aria-hidden />
      <p className="pl-2 text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 flex items-end gap-3 pl-2">
        <span className="text-3xl font-black tabular-nums text-foreground">{value}</span>
        <span className="pb-1 text-xs font-medium text-muted-foreground">{meta}</span>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  accent,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  accent: Accent;
}) {
  return (
    <Card className={`ci-accent-card ${ACCENT_CLASS[accent]} relative overflow-hidden`}>
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <span className="ci-accent-marker size-2.5 rounded-full" aria-hidden />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TopRisksCard({ risks }: { risks: DashboardData["topRisks"] }) {
  return (
    <Card className={`ci-accent-card ${ACCENT_CLASS.cerise} overflow-hidden`}>
      <CardHeader className="border-b bg-primary/5">
        <SectionHeader
          title="Top open risks"
          description="Highest probability × impact"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/risks">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <EmptyState title="No open risks" description="Nothing requires attention." className="border-0" />
        ) : (
          <ul className="divide-border divide-y">
            {risks.map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {r.externalId}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm">{r.description}</p>
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span>{titleCase(r.category)}</span>
                    <span aria-hidden>•</span>
                    <span>Owner: {r.owner}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    className="bg-rag-red/10 text-rag-red border-rag-red/30 tabular-nums"
                    title={`Probability ${titleCase(r.probability)} × impact ${titleCase(r.impact)}`}
                  >
                    Score {r.score}
                  </Badge>
                  <StatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EscalationsCard({
  escalations,
}: {
  escalations: DashboardData["escalations"];
}) {
  return (
    <Card className={`ci-accent-card ${ACCENT_CLASS.cerise} overflow-hidden`}>
      <CardHeader className="border-b bg-primary/5">
        <SectionHeader
          title="Recent escalations"
          description="Items raised to programme leadership"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/notifications">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {escalations.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No escalations"
            description="No items have been escalated recently."
            className="border-0"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {escalations.map((e) => (
              <Alert key={e.id}>
                <Megaphone />
                <AlertTitle className="flex items-center justify-between gap-2">
                  <span className="truncate">{e.title}</span>
                  <PriorityBadge priority={e.priority} />
                </AlertTitle>
                <AlertDescription>
                  {e.body && <span className="line-clamp-2">{e.body}</span>}
                  <span className="text-xs">{formatDate(e.createdAt)}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalsCard({
  approvals,
}: {
  approvals: DashboardData["pendingApprovalsList"];
}) {
  return (
    <Card className={`ci-accent-card ${ACCENT_CLASS.sun} overflow-hidden`}>
      <CardHeader className="border-b bg-primary/5">
        <SectionHeader
          title="Pending approvals"
          description="Awaiting a decision"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/approvals">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No pending approvals"
            description="Everything is up to date."
            className="border-0"
          />
        ) : (
          <ul className="divide-border divide-y">
            {approvals.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {a.externalId}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span>Approver: {a.approver}</span>
                    {a.dueDate && (
                      <>
                        <span aria-hidden>•</span>
                        <span>Due {a.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <PriorityBadge priority={a.priority} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ExecSummaryCard({
  summary,
}: {
  summary: DashboardData["execSummary"];
}) {
  return (
    <Card className={`ci-accent-card ${ACCENT_CLASS.sky} overflow-hidden`}>
      <CardHeader className="border-b bg-primary/5">
        <SectionHeader
          title="Executive summary"
          description={
            summary
              ? `${titleCase(summary.day)}${summary.version ? ` · ${summary.version}` : ""}`
              : "Latest programme narrative"
          }
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href="/reports">
                Full report <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {summary.excerpt}
            </p>
            {summary.publishedAt && (
              <p className="text-muted-foreground text-xs">
                Published {formatDate(summary.publishedAt)}
              </p>
            )}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No executive summary"
            description="No summary has been published yet."
            className="border-0"
          />
        )}
      </CardContent>
    </Card>
  );
}
