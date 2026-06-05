import { CardGridSkeleton } from "@/components/shared/states";

export default function GovernanceLoading() {
  return (
    <div className="space-y-6">
      <CardGridSkeleton count={6} />
    </div>
  );
}
