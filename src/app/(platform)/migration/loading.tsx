import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <CardGridSkeleton count={4} />
      <Skeleton className="h-40 rounded-xl" />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
