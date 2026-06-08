import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getOpenQuestions } from "@/lib/services/open-questions";
import { getRelatedLinksMap } from "@/lib/services/register-links";
import { OpenQuestionsClient } from "./open-questions-client";

export const dynamic = "force-dynamic";

export default async function OpenQuestionsPage() {
  try {
    const questions = await getOpenQuestions();
    const linksMap = await getRelatedLinksMap(
      "OPEN_QUESTION",
      questions.map((q) => q.externalId),
    );
    return (
      <ViewGuard entity="question" entityLabel="open questions">
        <OpenQuestionsClient questions={questions} linksMap={linksMap} />
      </ViewGuard>
    );
  } catch {
    return (
      <ErrorState
        title="Unable to load open questions"
        description="The open questions register could not be loaded. Please try again."
      />
    );
  }
}
