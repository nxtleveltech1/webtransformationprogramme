"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  headerActions,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-3 border-b px-4 py-4 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <SheetTitle className="truncate">{title}</SheetTitle>
              {description && (
                <SheetDescription className="line-clamp-2">{description}</SheetDescription>
              )}
            </div>
            {headerActions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>
            ) : null}
          </div>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4">{children}</div>
        </ScrollArea>
        {footer ? (
          <div className="bg-background shrink-0 border-t p-4">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-xs font-medium tracking-normal uppercase">
        {label}
      </dt>
      <dd className="text-sm">{children ?? "\u2014"}</dd>
    </div>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-4">{children}</dl>;
}
