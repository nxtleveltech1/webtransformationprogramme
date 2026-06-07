import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info";
type Accent = "heritage" | "naartjie" | "cerise" | "sky" | "sun";

const TONE: Record<Tone, { icon: string; value: string; defaultAccent: Accent }> = {
  default: {
    icon: "bg-muted text-brand-heritage",
    value: "text-foreground",
    defaultAccent: "heritage",
  },
  success: {
    icon: "bg-rag-green/10 text-rag-green",
    value: "text-foreground",
    defaultAccent: "heritage",
  },
  warning: {
    icon: "bg-rag-amber/10 text-foreground",
    value: "text-foreground",
    defaultAccent: "sun",
  },
  danger: {
    icon: "bg-rag-red/10 text-rag-red",
    value: "text-foreground",
    defaultAccent: "cerise",
  },
  info: {
    icon: "bg-[var(--ci-accent-soft)] text-foreground",
    value: "text-foreground",
    defaultAccent: "sky",
  },
};

const ACCENT_CLASS: Record<Accent, string> = {
  heritage: "ci-accent-heritage",
  naartjie: "ci-accent-naartjie",
  cerise: "ci-accent-cerise",
  sky: "ci-accent-sky",
  sun: "ci-accent-sun",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  accent,
  hint,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  accent?: Accent;
  hint?: string;
  href?: string;
  className?: string;
}) {
  const t = TONE[tone];
  const accentClass = ACCENT_CLASS[accent ?? t.defaultAccent];
  const inner = (
    <Card
      className={cn(
        "surface-om-card relative h-full overflow-hidden py-0 transition-colors duration-200",
        accentClass,
        href && "group-hover:border-primary/30 group-hover:shadow-md",
        className,
      )}
    >
      <span
        className="ci-accent-marker absolute inset-x-0 top-0 h-0.5"
        aria-hidden
      />
      <CardContent className="flex items-start gap-3 p-4 pt-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold tracking-normal text-muted-foreground uppercase">
            {label}
          </p>
          <p className={cn("mt-2 text-2xl font-bold tracking-normal tabular-nums", t.value)}>
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-md ring-1 ring-current/10",
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
        className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
