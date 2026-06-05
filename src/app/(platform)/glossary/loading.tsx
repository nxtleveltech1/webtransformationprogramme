import { Skeleton } from "@/components/ui/skeleton";

export default function GlossaryLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
