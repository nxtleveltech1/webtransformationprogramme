"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

function PlatformShellInner({
  children,
  unreadCount,
}: {
  children: React.ReactNode;
  unreadCount: number;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="bg-om-mesh flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-svh max-h-svh shrink-0 flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar shadow-sm transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadCount={unreadCount} />
        <main className="relative flex-1 p-4 md:p-6 2xl:px-10 2xl:py-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PlatformShell({
  children,
  unreadCount = 0,
}: {
  children: React.ReactNode;
  unreadCount?: number;
}) {
  return (
    <SidebarProvider>
      <PlatformShellInner unreadCount={unreadCount}>{children}</PlatformShellInner>
    </SidebarProvider>
  );
}
