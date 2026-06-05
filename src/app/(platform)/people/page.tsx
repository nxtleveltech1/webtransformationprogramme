import { getPeopleData } from "@/lib/services/people";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { PeopleClient } from "./people-client";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  let data: Awaited<ReturnType<typeof getPeopleData>> = { people: [], teams: [] };
  let loadError = false;
  try {
    data = await getPeopleData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="people" entityLabel="people & teams">
      {loadError ? (
        <ErrorState description="We couldn't load people and teams." />
      ) : (
        <PeopleClient people={data.people} teams={data.teams} />
      )}
    </ViewGuard>
  );
}
