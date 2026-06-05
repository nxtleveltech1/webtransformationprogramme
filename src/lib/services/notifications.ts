import { prisma } from "@/lib/db";

export async function getNotifications() {
  return prisma.notification.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    include: {
      recipientPerson: { select: { id: true, displayName: true } },
    },
  });
}

export type NotificationWithRelations = Awaited<
  ReturnType<typeof getNotifications>
>[number];

export function summariseNotifications(items: NotificationWithRelations[]) {
  return {
    total: items.length,
    unread: items.filter((n) => !n.read).length,
    escalations: items.filter((n) => n.type === "ESCALATION").length,
    approvals: items.filter((n) => n.type === "APPROVAL_REQUEST").length,
  };
}
