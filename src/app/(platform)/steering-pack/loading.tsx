import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/states";

export default function SteeringPackLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
