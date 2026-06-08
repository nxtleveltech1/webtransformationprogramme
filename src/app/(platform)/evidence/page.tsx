import { FileSearch, GitPullRequest, HelpCircle, ShieldCheck } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgrammeControlTable } from "@/components/shared/programme-control-table";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  EVIDENCE_COLUMNS,
  getEvidenceControlData,
} from "@/lib/services/programme-controls";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  let data: Awaited<ReturnType<typeof getEvidenceControlData>> | null = null;
  let loadError = false;
  try {
    data = await getEvidenceControlData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="evidence" entityLabel="evidence library">
      {loadError || !data ? (
        <ErrorState description="We couldn't load workshop evidence links." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Workshop Evidence Library"
            description="Traceability from workshop sources, extracted text and professional inferences to execution items, readiness gates and governance controls."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Evidence links" value={data.summary.total} icon={FileSearch} />
            <MetricCard label="Confirmed" value={data.summary.confirmed} icon={ShieldCheck} tone="success" />
            <MetricCard label="Inferred" value={data.summary.inferred} icon={GitPullRequest} tone="warning" />
            <MetricCard label="Follow-up" value={data.summary.followUp} icon={HelpCircle} tone="danger" />
          </div>
          <ProgrammeControlTable
            rows={data.rows}
            columns={EVIDENCE_COLUMNS}
            filename="workshop-evidence-library"
            entity="evidence"
            searchPlaceholder="Search sources, trace refs, execution IDs..."
            emptyTitle="No evidence links"
            emptyDescription="Seed evidence links to populate workshop traceability."
            quickFilters={[
              {
                key: "confirmed",
                label: "Confirmed",
                predicate: (row) => String(row.confidence ?? "").toUpperCase() === "CONFIRMED",
              },
              {
                key: "inferred",
                label: "Inferred",
                predicate: (row) => String(row.confidence ?? "").toUpperCase() === "INFERRED",
              },
              {
                key: "followUp",
                label: "Follow-up required",
                predicate: (row) => {
                  const v = row.followUpRequired;
                  return v === true || String(v ?? "").toLowerCase() === "yes" || String(v ?? "").toLowerCase() === "true";
                },
              },
            ]}
          />
        </div>
      )}
    </ViewGuard>
  );
}
