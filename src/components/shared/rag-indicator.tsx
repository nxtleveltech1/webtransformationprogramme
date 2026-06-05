import { cn } from "@/lib/utils";

type RagValue = "RED" | "AMBER" | "GREEN" | null | undefined;

const RAG_META: Record<
  "RED" | "AMBER" | "GREEN",
  { label: string; dot: string; text: string; bg: string }
> = {
  RED: {
    label: "Red",
    dot: "bg-rag-red",
    text: "text-rag-red",
    bg: "bg-rag-red/10 border-rag-red/30",
  },
  AMBER: {
    label: "Amber",
    dot: "bg-rag-amber",
    text: "text-rag-amber",
    bg: "bg-rag-amber/10 border-rag-amber/30",
  },
  GREEN: {
    label: "Green",
    dot: "bg-rag-green",
    text: "text-rag-green",
    bg: "bg-rag-green/10 border-rag-green/30",
  },
};

/**
 * Accessible RAG indicator: communicates status with shape + text label, not
 * colour alone (the label text is always present for screen readers).
 */
export function RagIndicator({
  value,
  showLabel = true,
  className,
}: {
  value: RagValue;
  showLabel?: boolean;
  className?: string;
}) {
  if (!value) {
    return (
      <span
        className={cn("text-muted-foreground inline-flex items-center gap-1.5 text-sm", className)}
      >
        <span className="bg-muted-foreground/40 size-2.5 rounded-full" aria-hidden />
        {showLabel && "Not set"}
      </span>
    );
  }
  const meta = RAG_META[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
      {showLabel ? `${meta.label} RAG` : <span className="sr-only">{meta.label} RAG</span>}
    </span>
  );
}
