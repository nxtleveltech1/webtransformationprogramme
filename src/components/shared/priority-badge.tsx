import { Badge } from "@/components/ui/badge";
import { cn, titleCase } from "@/lib/utils";

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string | null | undefined;

const PRIORITY_CLASS: Record<string, string> = {
  CRITICAL: "ci-accent-badge ci-accent-cerise",
  HIGH: "ci-accent-badge ci-accent-naartjie",
  MEDIUM: "ci-accent-badge ci-accent-sun",
  LOW: "bg-muted text-muted-foreground border-transparent",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  if (!priority) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Unset
      </Badge>
    );
  }
  const key = String(priority).toUpperCase();
  return (
    <Badge className={cn(PRIORITY_CLASS[key] ?? PRIORITY_CLASS.LOW, className)}>
      {titleCase(String(priority))}
    </Badge>
  );
}
