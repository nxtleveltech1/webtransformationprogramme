import { cn } from "@/lib/utils";

type Rag = "RED" | "AMBER" | "GREEN" | null | undefined;

const TONE: Record<
  "RED" | "AMBER" | "GREEN" | "NONE",
  { wrap: string; dot: string; text: string; meta: string; panel: string; label: string }
> = {
  RED: {
    wrap: "border-rag-red/30 bg-gradient-to-br from-rag-red/10 via-card to-card",
    dot: "bg-rag-red",
    text: "text-rag-red",
    meta: "text-muted-foreground",
    panel: "border-rag-red/20 bg-rag-red/5",
    label: "Red / Off Track",
  },
  AMBER: {
    wrap: "border-rag-amber/40 bg-gradient-to-br from-rag-amber/20 via-card to-card",
    dot: "bg-rag-amber",
    text: "text-rag-amber",
    meta: "text-muted-foreground",
    panel: "border-rag-amber/25 bg-rag-amber/10",
    label: "Amber / At Risk",
  },
  GREEN: {
    wrap: "bg-om-hero border-brand-fresh/40 text-primary-foreground shadow-2xl shadow-brand-heritage/20",
    dot: "bg-brand-fresh",
    text: "text-white",
    meta: "text-white/76",
    panel: "border-white/20 bg-white/10 text-white",
    label: "Green / On Track",
  },
  NONE: {
    wrap: "border-border bg-gradient-to-br from-muted to-card",
    dot: "bg-muted-foreground",
    text: "text-foreground",
    meta: "text-muted-foreground",
    panel: "border-border/80 bg-muted/50",
    label: "Status not set",
  },
};

export function RagHero({
  rag,
  eyebrow,
  headline,
  narrative,
  positionLabel,
  positionValue,
  className,
}: {
  rag: Rag;
  eyebrow?: string;
  headline: string;
  narrative?: string;
  positionLabel?: string;
  positionValue?: string;
  className?: string;
}) {
  const tone = TONE[rag ?? "NONE"];
  return (
    <div
      className={cn(
        "relative grid items-center gap-6 overflow-hidden rounded-3xl border p-6 md:grid-cols-[1fr_auto] md:p-8",
        tone.wrap,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand-future/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span className={cn("mt-1.5 flex size-5 shrink-0 rounded-full shadow-lg ring-8 ring-current/10", tone.dot)} aria-hidden />
        <div className="min-w-0">
          {eyebrow && (
            <p className={cn("text-xs font-bold tracking-[0.18em] uppercase", tone.meta)}>
              {eyebrow}
            </p>
          )}
          <h2 className={cn("mt-2 text-3xl font-extrabold tracking-tight md:text-5xl", tone.text)}>
            {tone.label}
          </h2>
          <p className={cn("mt-3 max-w-4xl text-sm leading-relaxed md:text-base", tone.meta)}>
            {narrative ?? headline}
          </p>
        </div>
      </div>
      {(positionValue || positionLabel) && (
        <div className={cn("relative rounded-2xl border px-5 py-4 md:min-w-48 md:text-right", tone.panel)}>
          {positionValue && (
            <p className={cn("text-4xl font-black tracking-tight md:text-5xl", tone.text)}>
              {positionValue}
            </p>
          )}
          {positionLabel && (
            <p className={cn("mt-2 text-xs font-bold tracking-[0.16em] uppercase", tone.meta)}>
              {positionLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
