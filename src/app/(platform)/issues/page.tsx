import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getIssues } from "@/lib/services/issues";
import { getPeopleOptions } from "@/lib/services/registers";
import { IssuesClient } from "./issues-client";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  try {
    const [issues, people] = await Promise.all([
      getIssues(),
      getPeopleOptions(),
    ]);
    return (
      <ViewGuard entity="issue" entityLabel="the issue register">
        <IssuesClient issues={issues} people={people} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load issues"
        description="The issue register could not be loaded. Please try again."
      />
    );
  }
}
