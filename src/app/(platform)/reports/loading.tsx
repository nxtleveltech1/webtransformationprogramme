import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/states";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>
      <Skeleton className="h-9 w-full max-w-2xl" />
      <Skeleton className="h-56 rounded-xl" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
