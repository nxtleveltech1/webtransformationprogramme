import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { TYPE_LABEL, type RelatedLink } from "@/lib/services/register-links";
import type { LinkKind } from "@prisma/client";

/** Human label for each link kind. */
const LINK_KIND_LABEL: Record<LinkKind, string> = {
  RELATED: "Related",
  BLOCKS: "Blocks",
  MITIGATES: "Mitigates",
  ANSWERS: "Answers",
  IMPLEMENTS: "Implements",
  TRACES: "Traces",
  ESCALATES: "Escalates",
};

const LINK_KIND_ORDER: LinkKind[] = [
  "BLOCKS",
  "MITIGATES",
  "ANSWERS",
  "IMPLEMENTS",
  "TRACES",
  "ESCALATES",
  "RELATED",
];

function LinkRow({ link }: { link: RelatedLink }) {
  const meta = (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-medium">
          {link.targetExternalId}
        </span>
        <Badge className="bg-muted text-muted-foreground border-transparent text-[10px]">
          {TYPE_LABEL[link.targetType]}
        </Badge>
        {link.direction === "incoming" && (
          <span className="text-muted-foreground text-[10px] uppercase">
            inbound
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-sm">{link.targetTitle}</span>
      {link.targetStatus && (
        <span className="mt-0.5">
          <StatusBadge status={link.targetStatus} />
        </span>
      )}
    </div>
  );

  const base =
    "flex items-start gap-2 rounded-md border p-2.5 transition-colors";

  if (!link.href) {
    return (
      <div className={base} aria-label={`${link.targetExternalId} (no page)`}>
        {meta}
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      className={`${base} hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none`}
      aria-label={`Open ${TYPE_LABEL[link.targetType]} ${link.targetExternalId}: ${link.targetTitle}`}
    >
      {meta}
      <ArrowUpRight className="text-muted-foreground mt-0.5 size-4 shrink-0" />
    </Link>
  );
}

/**
 * Presentational list of cross-register links for a single register item.
 * Groups links by relationship (linkKind) and renders each target as a clickable
 * row that navigates to the target register's route. Renders a clean empty state
 * when there are no links. Status is conveyed with text (not colour alone).
 */
export function RelatedLinks({
  links,
  title = "Linked items",
}: {
  links: RelatedLink[];
  title?: string;
}) {
  if (links.length === 0) {
    return (
      <div className="space-y-1">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Link2 className="size-4" />
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">No linked items.</p>
      </div>
    );
  }

  const groups = LINK_KIND_ORDER.map((kind) => ({
    kind,
    items: links.filter((l) => l.linkKind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Link2 className="size-4" />
        {title}
        <span className="text-muted-foreground font-normal">
          ({links.length})
        </span>
      </h3>
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.kind} className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-normal uppercase">
              {LINK_KIND_LABEL[group.kind]}
            </p>
            <div className="space-y-2">
              {group.items.map((link) => (
                <LinkRow key={`${link.id}-${link.direction}`} link={link} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
