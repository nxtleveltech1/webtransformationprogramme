"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, PanelLeft, PanelLeftClose, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CommandPalette } from "@/components/layout/command-palette";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useRole } from "@/lib/rbac/role-context";

export function AppHeader({ unreadCount = 0 }: { unreadCount?: number }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { canView } = useRole();
  const { collapsed, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-background/88 px-4 shadow-sm shadow-brand-heritage/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72 md:px-6 2xl:px-10">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-1 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar forceExpanded onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="-ml-1 hidden lg:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-5" />}
      </Button>

      <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
        <div className="min-w-0">
          <Breadcrumbs />
        </div>
        <Badge variant="outline" className="hidden shrink-0 border-primary/25 bg-primary/5 text-primary xl:inline-flex">
          <Sparkles className="size-3" />
          Executive command view
        </Badge>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none sm:gap-2">
        <CommandPalette />
        {canView("notification") && (
          <Button variant="outline" size="icon" asChild aria-label="Notifications" className="relative bg-card/80">
            <Link href="/notifications">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="bg-rag-red absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 hidden !h-6 sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
