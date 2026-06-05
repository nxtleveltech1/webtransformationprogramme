import {
  getNotifications,
  summariseNotifications,
} from "@/lib/services/notifications";
import { ViewGuard } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/states";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  let loadError = false;
  try {
    notifications = await getNotifications();
  } catch {
    loadError = true;
  }

  return (
    <ViewGuard entity="notification" entityLabel="notifications">
      {loadError ? (
        <ErrorState description="We couldn't load notifications from the database." />
      ) : (
        <NotificationsClient
          notifications={notifications}
          summary={summariseNotifications(notifications)}
        />
      )}
    </ViewGuard>
  );
}
