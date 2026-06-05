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
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border/80 bg-sidebar shadow-2xl shadow-brand-heritage/20 transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-72",
        )}
      >
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader unreadCount={unreadCount} />
        <main className="relative flex-1 p-4 md:p-6 2xl:px-10 2xl:py-8">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-fresh/10 to-transparent"
            aria-hidden
          />
          <div className="relative w-full">{children}</div>
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
