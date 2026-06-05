import {
  AlertTriangle,
  Check,
  ChevronRight,
  GitBranch,
  LayoutGrid,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { DsZone } from "@prisma/client";

import { getLifecycleData, splitSteps } from "@/lib/services/lifecycle";
import { ViewGuard } from "@/components/shared/can";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const READY_STATUS = /ready|beta|in progress|complete/i;
const BLOCKED_STATUS = /block|not started/i;

const ZONE_DOT: Record<DsZone, string> = {
  GREEN: "bg-rag-green",
  RED: "bg-rag-red",
  MIXED: "bg-rag-amber",
};

const ZONE_TEXT: Record<DsZone, string> = {
  GREEN: "text-rag-green",
  RED: "text-rag-red",
  MIXED: "text-rag-amber",
};

function StepPipeline({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary border-primary/30 rounded-md border px-3 py-1.5 text-sm">
            {step}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

export default async function LifecyclePage() {
  let data: Awaited<ReturnType<typeof getLifecycleData>> | null = null;
  let loadError = false;
  try {
    data = await getLifecycleData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="governance" entityLabel="the delivery lifecycle">
      {loadError || !data ? (
        <ErrorState description="We couldn't load the delivery lifecycle." />
      ) : data.workflows.length === 0 && data.components.length === 0 ? (
        <EmptyState
          title="No lifecycle data"
          description="Process workflows have not been seeded yet."
        />
      ) : (
        (() => {
          const { workflows, components } = data;
          const readyCount = components.filter((c) =>
            c.status ? READY_STATUS.test(c.status) : false,
          ).length;
          const blockedCount = components.filter((c) =>
            c.status ? BLOCKED_STATUS.test(c.status) : false,
          ).length;

          return (
            <div className="flex w-full flex-col gap-6">
              <PageHeader
                title="Delivery Lifecycle"
                description="Process pipeline, environment sequencing and design-system component readiness."
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Workflows"
                  value={workflows.length}
                  icon={GitBranch}
                  tone="default"
                />
                <MetricCard
                  label="Components ready"
                  value={readyCount}
                  icon={ShieldCheck}
                  tone="success"
                  hint={`of ${components.length} components`}
                />
                <MetricCard
                  label="Components blocked"
                  value={blockedCount}
                  icon={ShieldX}
                  tone="danger"
                />
                <MetricCard
                  label="Components mapped"
                  value={components.filter((c) => c.contentstackMapped).length}
                  icon={LayoutGrid}
                  tone="info"
                  hint="Contentstack"
                />
              </div>

              <div className="flex flex-col gap-4">
                {workflows.map((workflow) => {
                  const futureSteps = splitSteps(workflow.futureStateSteps);
                  const currentSteps = splitSteps(workflow.currentStateSteps);
                  return (
                    <Card key={workflow.id}>
                      <CardHeader>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                          {workflow.name}
                        </CardTitle>
                        {workflow.ownerText && (
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="secondary">Owner: {workflow.ownerText}</Badge>
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        {currentSteps.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Current state
                            </p>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                              {currentSteps.map((step, index) => (
                                <span key={`${step}-${index}`} className="flex items-center gap-1.5">
                                  {step}
                                  {index < currentSteps.length - 1 && (
                                    <ChevronRight className="size-3 shrink-0" aria-hidden />
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {futureSteps.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Future state
                            </p>
                            <StepPipeline steps={futureSteps} />
                          </div>
                        )}

                        {workflow.bottlenecks && (
                          <Alert>
                            <AlertTriangle />
                            <AlertTitle>Bottlenecks</AlertTitle>
                            <AlertDescription>{workflow.bottlenecks}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {components.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Design-system component readiness</CardTitle>
                    <CardDescription>
                      Design-system zone classification and Contentstack mapping status per
                      component template.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {components.map((component) => {
                        const mapped = component.contentstackMapped === true;
                        return (
                          <div
                            key={component.id}
                            className="flex flex-col gap-2.5 rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{component.name}</p>
                              {component.dsZone && (
                                <span
                                  className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium",
                                    ZONE_TEXT[component.dsZone],
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "size-2.5 rounded-full",
                                      ZONE_DOT[component.dsZone],
                                    )}
                                    aria-hidden
                                  />
                                  {component.dsZone}
                                </span>
                              )}
                            </div>

                            <span
                              className={cn(
                                "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                mapped
                                  ? "bg-rag-green/10 text-rag-green"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {mapped ? (
                                <Check className="size-3" aria-hidden />
                              ) : (
                                <X className="size-3" aria-hidden />
                              )}
                              Contentstack mapped
                            </span>

                            {component.status && (
                              <p className="text-muted-foreground text-xs">{component.status}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })()
      )}
    </ViewGuard>
  );
}
