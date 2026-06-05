"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ALL_NAV_ITEMS } from "@/lib/nav-config";
import { titleCase } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const navMatch = ALL_NAV_ITEMS.find((n) => n.href === href);
    const label = navMatch?.label ?? titleCase(decodeURIComponent(seg));
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
        Home
      </Link>
      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-1">
          <ChevronRight className="text-muted-foreground size-3.5" />
          {c.isLast ? (
            <span className="font-medium" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link href={c.href} className="text-muted-foreground hover:text-foreground">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
