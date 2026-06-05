import { BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Lightweight empty/zero-data placeholder for chart cards. Charts must degrade
 * gracefully when there is nothing to plot.
 */
export function ChartEmpty({
  message = "No data to display",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 text-center text-sm",
        className,
      )}
    >
      <BarChart3 className="size-6 opacity-60" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
