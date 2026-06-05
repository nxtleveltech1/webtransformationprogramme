import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex flex-col gap-5 overflow-hidden rounded-3xl border bg-card/82 p-5 shadow-sm shadow-brand-heritage/5 md:p-6", className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-om-heritage-fresh"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-brand-future/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-fresh shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-fresh)_18%,transparent)]" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
              Programme cockpit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
