import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton />
      <TableSkeleton />
    </div>
  );
}
