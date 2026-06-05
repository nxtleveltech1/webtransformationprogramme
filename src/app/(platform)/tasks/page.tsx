import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import {
  getPeopleOptions,
  getTasks,
  getWorkstreamOptions,
} from "@/lib/services/tasks";
import { TasksClient } from "./tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  let content: React.ReactNode;
  try {
    const [tasks, people, workstreams] = await Promise.all([
      getTasks(),
      getPeopleOptions(),
      getWorkstreamOptions(),
    ]);
    content = (
      <TasksClient tasks={tasks} people={people} workstreams={workstreams} />
    );
  } catch {
    content = (
      <ErrorState
        title="Unable to load tasks"
        description="There was a problem reading the actions register. Please refresh to try again."
      />
    );
  }

  return (
    <ViewGuard entity="task" entityLabel="tasks & actions">
      <div className="space-y-6">{content}</div>
    </ViewGuard>
  );
}

export const metadata = {
  title: "Tasks & Actions",
};
