import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getApprovalAudit,
  getApprovals,
  getApproverOptions,
} from "@/lib/services/approvals";
import { ApprovalsClient } from "./approvals-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Approvals",
};

export default async function ApprovalsPage() {
  let content: React.ReactNode;
  try {
    const [approvals, audit, approvers] = await Promise.all([
      getApprovals(),
      getApprovalAudit(),
      getApproverOptions(),
    ]);
    content = (
      <ApprovalsClient approvals={approvals} audit={audit} approvers={approvers} />
    );
  } catch {
    content = (
      <ErrorState
        title="Unable to load approvals"
        description="There was a problem reading the approval queue. Please refresh to try again."
      />
    );
  }

  return (
    <ViewGuard entity="approval" entityLabel="approvals">
      <div className="space-y-6">{content}</div>
    </ViewGuard>
  );
}
