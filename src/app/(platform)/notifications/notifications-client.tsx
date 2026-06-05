"use client";

import * as React from "react";
import {
  Bell,
  BellRing,
  Info,
  AlertTriangle,
  Siren,
  CheckSquare,
  AtSign,
  Clock,
  Check,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/states";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Can } from "@/components/shared/can";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, titleCase } from "@/lib/utils";
import type { NotificationWithRelations } from "@/lib/services/notifications";
import {
  setNotificationRead,
  markAllNotificationsRead,
} from "@/server/actions/notifications";

const TYPE_META: Record<string, { icon: LucideIcon; className: string }> = {
  INFO: { icon: Info, className: "text-chart-3 bg-chart-3/10" },
  WARNING: { icon: AlertTriangle, className: "text-rag-amber bg-rag-amber/10" },
  ESCALATION: { icon: Siren, className: "text-rag-red bg-rag-red/10" },
  APPROVAL_REQUEST: { icon: CheckSquare, className: "text-chart-3 bg-chart-3/10" },
  MENTION: { icon: AtSign, className: "text-primary bg-primary/10" },
  REMINDER: { icon: Clock, className: "text-muted-foreground bg-muted" },
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationsClient({
  notifications,
  summary,
}: {
  notifications: NotificationWithRelations[];
  summary: { total: number; unread: number; escalations: number; approvals: number };
}) {
  const [filter, setFilter] = React.useState<"ALL" | "UNREAD">("ALL");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [bulkPending, setBulkPending] = React.useState(false);

  const visible = React.useMemo(
    () => (filter === "UNREAD" ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter],
  );

  async function toggleRead(n: NotificationWithRelations) {
    setPendingId(n.id);
    const result = await setNotificationRead({ id: n.id, read: !n.read });
    setPendingId(null);
    if (result.ok) toast.success(result.message ?? "Updated");
    else toast.error(result.error);
  }

  async function markAll() {
    setBulkPending(true);
    const result = await markAllNotificationsRead();
    setBulkPending(false);
    if (result.ok) toast.success(result.message ?? "Done");
    else toast.error(result.error);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Programme alerts, approvals, mentions and reminders."
        actions={
          <Can action="edit" entity="notification">
            <Button
              size="sm"
              variant="outline"
              onClick={markAll}
              disabled={bulkPending || summary.unread === 0}
            >
              <Check className="size-4" />
              Mark all read
            </Button>
          </Can>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total" value={summary.total} icon={Bell} />
        <MetricCard
          label="Unread"
          value={summary.unread}
          icon={BellRing}
          tone={summary.unread ? "info" : "default"}
        />
        <MetricCard label="Escalations" value={summary.escalations} icon={Siren} tone="danger" />
        <MetricCard
          label="Approval requests"
          value={summary.approvals}
          icon={CheckSquare}
          tone="warning"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === "ALL" ? "default" : "outline"}
          onClick={() => setFilter("ALL")}
        >
          All ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={filter === "UNREAD" ? "default" : "outline"}
          onClick={() => setFilter("UNREAD")}
        >
          Unread ({summary.unread})
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "UNREAD" ? "No unread notifications" : "No notifications"}
          description={
            filter === "UNREAD"
              ? "You're all caught up."
              : "Notifications will appear here as programme events occur."
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.INFO;
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <Card className={cn("py-0 transition-colors", !n.read && "border-primary/30 bg-accent/30")}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        meta.className,
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {!n.read && (
                          <span
                            className="bg-primary size-2 shrink-0 rounded-full"
                            aria-label="Unread"
                          />
                        )}
                        <p className={cn("text-sm", !n.read ? "font-semibold" : "font-medium")}>
                          {n.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {titleCase(n.type)}
                        </Badge>
                        <PriorityBadge priority={n.priority} />
                      </div>
                      {n.body && (
                        <p className="text-muted-foreground text-sm">{n.body}</p>
                      )}
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span>{timeAgo(n.createdAt)}</span>
                        {n.recipientPerson && <span>To: {n.recipientPerson.displayName}</span>}
                        {n.relatedType && (
                          <span>
                            Re: {titleCase(n.relatedType)}
                            {n.relatedId ? ` (${n.relatedId.slice(0, 8)})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <Can action="edit" entity="notification">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => toggleRead(n)}
                        disabled={pendingId === n.id}
                      >
                        {n.read ? (
                          <>
                            <Undo2 className="size-4" />
                            <span className="sr-only sm:not-sr-only">Mark unread</span>
                          </>
                        ) : (
                          <>
                            <Check className="size-4" />
                            <span className="sr-only sm:not-sr-only">Mark read</span>
                          </>
                        )}
                      </Button>
                    </Can>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
