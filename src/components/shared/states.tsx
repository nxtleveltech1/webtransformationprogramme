import type { LucideIcon } from "lucide-react";
import { Inbox, ShieldOff, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn("surface-om-card border bg-card", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-muted text-brand-heritage ring-1 ring-primary/15">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export function PermissionDenied({
  entity,
  className,
}: {
  entity?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={ShieldOff}
      title="You don't have access to this area"
      description={
        entity
          ? `Your current role cannot view ${entity}. Switch role or contact an administrator.`
          : "Your current role does not permit access to this area. Switch role or contact an administrator."
      }
      className={className}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description ?? "An unexpected error occurred while loading this data."}
      action={action}
      className={cn("border-rag-red/30", className)}
    />
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <Skeleton className="h-9 w-56 rounded-md" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-10 flex-1 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}
