import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-transparent",
  info: "ci-accent-badge ci-accent-sky",
  success: "bg-rag-green/10 text-rag-green border-rag-green/30",
  warning: "ci-accent-badge ci-accent-sun",
  danger: "ci-accent-badge ci-accent-cerise",
  muted: "bg-muted text-muted-foreground border-transparent",
};

/**
 * Maps common workshop/PM status enum values to a semantic tone.
 */
const STATUS_TONE: Record<string, Tone> = {
  // Generic
  OPEN: "info",
  NEW: "info",
  IN_PROGRESS: "warning",
  IN_REVIEW: "warning",
  BLOCKED: "danger",
  AT_RISK: "warning",
  DONE: "success",
  COMPLETE: "success",
  COMPLETED: "success",
  CLOSED: "muted",
  RESOLVED: "success",
  CANCELLED: "muted",
  // Decisions
  CONFIRMED: "success",
  PROPOSED: "info",
  DEFERRED: "warning",
  REJECTED: "danger",
  UNCLEAR: "muted",
  // Confidence
  INFERRED: "warning",
  UNCONFIRMED: "muted",
  REQUIRES_VALIDATION: "danger",
  SUGGESTED: "muted",
  // Dependency
  MET: "success",
  // Project / Approval / CR
  ACTIVE: "success",
  ON_HOLD: "warning",
  PENDING: "warning",
  APPROVED: "success",
  IMPLEMENTED: "success",
  DRAFT: "muted",
  SUBMITTED: "info",
  NOT_STARTED: "muted",
  ARCHIVED: "muted",
  ANSWERED: "success",
};

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string | null | undefined;
  tone?: Tone;
  className?: string;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        Unset
      </Badge>
    );
  }
  const key = status.toUpperCase().replace(/\s+/g, "_");
  const resolved = tone ?? STATUS_TONE[key] ?? "neutral";
  return (
    <Badge className={cn(TONE_CLASS[resolved], className)}>{titleCase(status)}</Badge>
  );
}
