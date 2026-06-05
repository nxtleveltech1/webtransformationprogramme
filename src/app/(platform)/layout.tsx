import { PlatformShell } from "@/components/layout/platform-shell";
import { prisma } from "@/lib/db";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({ where: { read: false } });
  } catch {
    unreadCount = 0;
  }

  return <PlatformShell unreadCount={unreadCount}>{children}</PlatformShell>;
}
