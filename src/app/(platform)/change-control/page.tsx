import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getApproverOptions,
  getChangeRequestAudit,
  getChangeRequests,
  getProjectOptions,
} from "@/lib/services/change-control";
import { ChangeControlClient } from "./change-control-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Change Control",
};

export default async function ChangeControlPage() {
  let content: React.ReactNode;
  try {
    const [changeRequests, audit, projects, approvers] = await Promise.all([
      getChangeRequests(),
      getChangeRequestAudit(),
      getProjectOptions(),
      getApproverOptions(),
    ]);
    content = (
      <ChangeControlClient
        changeRequests={changeRequests}
        audit={audit}
        projects={projects}
        approvers={approvers}
      />
    );
  } catch {
    content = (
      <ErrorState
        title="Unable to load change requests"
        description="There was a problem reading the change-control register. Please refresh to try again."
      />
    );
  }

  return (
    <ViewGuard entity="changeRequest" entityLabel="change control">
      <div className="space-y-6">{content}</div>
    </ViewGuard>
  );
}
