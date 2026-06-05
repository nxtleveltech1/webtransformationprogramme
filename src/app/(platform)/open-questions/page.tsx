import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { getOpenQuestions } from "@/lib/services/open-questions";
import { OpenQuestionsClient } from "./open-questions-client";

export const dynamic = "force-dynamic";

export default async function OpenQuestionsPage() {
  try {
    const questions = await getOpenQuestions();
    return (
      <ViewGuard entity="question" entityLabel="open questions">
        <OpenQuestionsClient questions={questions} />
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
