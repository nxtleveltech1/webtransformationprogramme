"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";

import { NAV_GROUPS } from "@/lib/nav-config";
import { useRole } from "@/lib/rbac/role-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COLLAPSE_STORAGE_KEY = "sidebar:collapsed-groups";

const GROUP_ACCENT_CLASS = {
  heritage: "",
  naartjie: "ci-accent-naartjie",
  cerise: "ci-accent-cerise",
  sky: "ci-accent-sky",
  sun: "ci-accent-sun",
} as const;

function NavLink({
  item,
  active,
  accent,
  collapsed,
  onNavigate,
}: {
  item: (typeof NAV_GROUPS)[number]["items"][number];
  active: boolean;
  accent: (typeof NAV_GROUPS)[number]["accent"];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center overflow-hidden rounded-md transition-colors",
        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5 text-sm",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold ring-1 ring-white/10"
          : "text-sidebar-foreground/72 hover:bg-sidebar-accent/45 hover:text-sidebar-accent-foreground",
      )}
    >
      {!collapsed && (
        <span
          className={cn(
            "absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity",
            accent === "heritage" ? "bg-sidebar-primary" : "ci-accent-marker",
            active ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md transition-colors",
          collapsed ? "size-9" : "size-8",
          active
            ? accent === "heritage"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "bg-[var(--ci-accent-soft)] text-sidebar-foreground"
            : "bg-white/5 text-sidebar-foreground/72 group-hover:bg-white/10 group-hover:text-sidebar-foreground",
        )}
      >
        <item.icon className="size-4" />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({
  onNavigate,
  forceExpanded = false,
}: {
  onNavigate?: () => void;
  /** Mobile drawer always shows full nav regardless of desktop rail state. */
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const { canView } = useRole();
  const { collapsed: railCollapsed, toggle } = useSidebar();
  const collapsed = forceExpanded ? false : railCollapsed;

  const [groupCollapsed, setGroupCollapsed] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (raw) setGroupCollapsed(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // ignore malformed/unavailable storage
    }
  }, []);

  const toggleGroup = React.useCallback((label: string) => {
    setGroupCollapsed((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore unavailable storage
      }
      return next;
    });
  }, []);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((i) => canView(i.entity)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "relative border-sidebar-border flex shrink-0 flex-col border-b",
          collapsed ? "items-center px-2 py-4" : "min-h-24 justify-end gap-4 px-5 pb-5 pt-4",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn("group flex items-center", collapsed ? "justify-center" : "gap-3")}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-white shadow-sm ring-1 ring-white/60 transition-transform group-hover:scale-[1.03]">
            <Image
              src="/brand/om-anchor-tick.svg"
              alt=""
              width={32}
              height={32}
              className="size-8"
              priority
            />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-xs font-semibold tracking-normal text-sidebar-foreground/70 uppercase">
                Old Mutual
              </span>
              <span className="block truncate text-base font-semibold tracking-normal">
                Web Transformation
              </span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/45 px-3 py-2">
            <p className="text-xs font-semibold tracking-normal text-sidebar-foreground/60 uppercase">
              Programme Control
            </p>
            <p className="mt-0.5 text-xs text-sidebar-foreground/82">
              Steering, delivery, RAID and governance in one cockpit.
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="relative h-0 min-h-0 flex-1 overflow-hidden">
        <nav className={cn("flex flex-col", collapsed ? "gap-1 p-2" : "gap-4 p-4")} aria-label="Primary">
          {visibleGroups.map((group, groupIndex) => {
            const isGroupCollapsed = Boolean(groupCollapsed[group.label]);
            const contentId = `nav-group-${group.label.replace(/\W+/g, "-").toLowerCase()}`;
            const accentClass = GROUP_ACCENT_CLASS[group.accent ?? "heritage"];

            if (collapsed) {
              return (
                <React.Fragment key={group.label}>
                  {groupIndex > 0 && <Separator className="my-1 bg-sidebar-border/60" />}
                  <div className={cn("flex flex-col gap-1", accentClass)}>
                    {group.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <NavLink
                          key={item.href}
                          item={item}
                          active={active}
                          accent={group.accent}
                          collapsed
                          onNavigate={onNavigate}
                        />
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            }

            return (
              <div key={group.label} className={cn("flex flex-col gap-1.5", accentClass)}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={!isGroupCollapsed}
                  aria-controls={contentId}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-semibold tracking-normal text-sidebar-foreground/56 uppercase transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        group.accent === "heritage" ? "bg-sidebar-primary" : "ci-accent-marker",
                      )}
                      aria-hidden
                    />
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 transition-transform duration-200",
                      isGroupCollapsed && "-rotate-90",
                    )}
                    aria-hidden
                  />
                </button>
                {!isGroupCollapsed && (
                  <div id={contentId} className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <NavLink
                          key={item.href}
                          item={item}
                          active={active}
                          accent={group.accent}
                          collapsed={false}
                          onNavigate={onNavigate}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className={cn("relative border-sidebar-border shrink-0 border-t", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="mx-auto size-9 text-sidebar-foreground/72 hover:bg-sidebar-accent/45 hover:text-sidebar-accent-foreground"
            aria-label="Expand sidebar"
            aria-expanded={false}
          >
            <PanelLeft className="size-4" />
          </Button>
        ) : (
          <>
            <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/35 px-3 py-3">
              <p className="text-xs font-semibold tracking-normal text-sidebar-foreground/58 uppercase">
                CI compliant
              </p>
              <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/78">
                Domain accents stay below the primary green system.
              </p>
            </div>
            {!forceExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="mt-3 w-full justify-start gap-2 text-sidebar-foreground/72 hover:bg-sidebar-accent/45 hover:text-sidebar-accent-foreground"
                aria-label="Collapse sidebar"
                aria-expanded
              >
                <PanelLeftClose className="size-4 shrink-0" />
                Collapse sidebar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
