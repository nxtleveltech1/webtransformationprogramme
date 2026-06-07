import { cn } from "@/lib/utils";

type Rag = "RED" | "AMBER" | "GREEN" | null | undefined;

const TONE: Record<
  "RED" | "AMBER" | "GREEN" | "NONE",
  { wrap: string; dot: string; text: string; meta: string; panel: string; label: string }
> = {
  RED: {
    wrap: "border-rag-red/30 bg-card",
    dot: "bg-rag-red",
    text: "text-rag-red",
    meta: "text-muted-foreground",
    panel: "border-rag-red/20 bg-rag-red/5",
    label: "Red / Off Track",
  },
  AMBER: {
    wrap: "border-rag-amber/40 bg-card",
    dot: "bg-rag-amber",
    text: "text-rag-amber",
    meta: "text-muted-foreground",
    panel: "border-rag-amber/25 bg-rag-amber/10",
    label: "Amber / At Risk",
  },
  GREEN: {
    wrap: "bg-om-hero border-brand-fresh/40 text-primary-foreground shadow-lg",
    dot: "bg-brand-fresh",
    text: "text-white",
    meta: "text-white/76",
    panel: "border-white/20 bg-white/10 text-white",
    label: "Green / On Track",
  },
  NONE: {
    wrap: "border-border bg-card",
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
        "relative grid items-center gap-6 overflow-hidden rounded-lg border p-5 md:grid-cols-[1fr_auto] md:p-7",
        tone.wrap,
        className,
      )}
    >
      <div className="relative flex items-start gap-4">
        <span className={cn("mt-1.5 flex size-4 shrink-0 rounded-full ring-4 ring-current/10", tone.dot)} aria-hidden />
        <div className="min-w-0">
          {eyebrow && (
            <p className={cn("text-xs font-semibold tracking-normal uppercase", tone.meta)}>
              {eyebrow}
            </p>
          )}
          <h2 className={cn("mt-2 text-3xl font-bold tracking-normal md:text-4xl", tone.text)}>
            {tone.label}
          </h2>
          <p className={cn("mt-3 max-w-4xl text-sm leading-relaxed md:text-base", tone.meta)}>
            {narrative ?? headline}
          </p>
        </div>
      </div>
      {(positionValue || positionLabel) && (
        <div className={cn("relative rounded-md border px-5 py-4 md:min-w-48 md:text-right", tone.panel)}>
          {positionValue && (
            <p className={cn("text-4xl font-bold tracking-normal md:text-5xl", tone.text)}>
              {positionValue}
            </p>
          )}
          {positionLabel && (
            <p className={cn("mt-2 text-xs font-semibold tracking-normal uppercase", tone.meta)}>
              {positionLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
