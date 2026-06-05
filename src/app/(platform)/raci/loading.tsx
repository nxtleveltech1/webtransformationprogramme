import { CardGridSkeleton, TableSkeleton } from "@/components/shared/states";

export default function RaciLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton count={2} />
      <TableSkeleton rows={8} cols={9} />
    </div>
  );
}
