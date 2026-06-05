"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AuthRoleBridge } from "@/components/auth/auth-role-bridge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { RoleProvider } from "@/lib/rbac/role-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <RoleProvider>
          <AuthRoleBridge />
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </RoleProvider>
        <Toaster richColors closeButton position="top-right" />
      </NextThemesProvider>
    </ClerkProvider>
  );
}
