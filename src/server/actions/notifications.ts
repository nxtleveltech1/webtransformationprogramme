"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput, type ActionResult } from "@/server/actions/helpers";
import { markReadSchema } from "@/lib/validation/notifications";

export async function setNotificationRead(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(markReadSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, read } = parsed.data;

  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    });
    await writeAudit({
      entityType: "Notification",
      entityId: notification.id,
      action: read ? "mark-read" : "mark-unread",
    });
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    return ok(notification, read ? "Marked as read" : "Marked as unread");
  } catch {
    return fail("Could not update the notification.");
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const result = await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    await writeAudit({
      entityType: "Notification",
      entityId: "*",
      action: "mark-all-read",
      payload: { count: result.count },
    });
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    return ok({ count: result.count }, `Marked ${result.count} as read`);
  } catch {
    return fail("Could not mark all notifications as read.");
  }
}
