import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const TONE: Record<Tone, { card: string; icon: string; value: string; accent: string }> = {
  default: {
    card: "",
    icon: "text-brand-heritage bg-primary/10",
    value: "text-foreground",
    accent: "bg-gradient-om-heritage-fresh",
  },
  success: {
    card: "",
    icon: "text-rag-green bg-rag-green/10",
    value: "text-rag-green",
    accent: "bg-gradient-om-heritage-fresh",
  },
  warning: {
    card: "ci-accent-card ci-accent-sun",
    icon: "bg-[var(--ci-accent-soft)] text-foreground",
    value: "text-foreground",
    accent: "ci-accent-marker",
  },
  danger: {
    card: "ci-accent-card ci-accent-cerise",
    icon: "bg-[var(--ci-accent-soft)] text-foreground",
    value: "text-foreground",
    accent: "ci-accent-marker",
  },
  info: {
    card: "ci-accent-card ci-accent-sky",
    icon: "bg-[var(--ci-accent-soft)] text-foreground",
    value: "text-foreground",
    accent: "ci-accent-marker",
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: string;
  href?: string;
  className?: string;
}) {
  const t = TONE[tone];
  const inner = (
    <Card
      className={cn(
        "surface-om-card relative h-full overflow-hidden py-0 transition-all duration-300",
        t.card,
        href && "group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-brand-heritage/10",
        className,
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-1", t.accent)}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-brand-future/10 blur-2xl"
        aria-hidden
      />
      <CardContent className="relative flex items-start gap-4 p-5 pt-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className={cn("mt-2 text-3xl font-extrabold tracking-tight tabular-nums", t.value)}>
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-current/10",
              t.icon,
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
