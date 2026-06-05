import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-56 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-80 animate-pulse rounded-md" />
      </div>
      <CardGridSkeleton count={4} />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
