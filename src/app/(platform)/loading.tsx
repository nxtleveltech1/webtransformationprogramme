import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function PlatformLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton />
      <TableSkeleton />
    </div>
  );
}
