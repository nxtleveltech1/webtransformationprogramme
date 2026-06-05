import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton />
      <TableSkeleton rows={6} cols={3} />
    </div>
  );
}
