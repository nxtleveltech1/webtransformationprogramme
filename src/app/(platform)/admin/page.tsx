import { getAdminData } from "@/lib/services/admin";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let data: Awaited<ReturnType<typeof getAdminData>> | null = null;
  let loadError = false;
  try {
    data = await getAdminData();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="admin" entityLabel="administration">
      {loadError || !data ? (
        <ErrorState description="We couldn't load administration data." />
      ) : (
        <AdminClient
          users={data.users}
          roles={data.roles}
          permissions={data.permissions}
          auditEvents={data.auditEvents}
          programme={data.programme}
        />
      )}
    </ViewGuard>
  );
}
