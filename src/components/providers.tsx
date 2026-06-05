"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { RoleProvider } from "@/lib/rbac/role-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RoleProvider>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </RoleProvider>
      <Toaster richColors closeButton position="top-right" />
    </NextThemesProvider>
  );
}
