import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function PeopleLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton />
      <TableSkeleton />
    </div>
  );
}
