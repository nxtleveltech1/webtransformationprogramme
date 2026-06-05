"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";

import { useRole } from "@/lib/rbac/role-context";
import { ROLES, type Role } from "@/lib/rbac/roles";

/**
 * Syncs the platform RBAC role from Clerk publicMetadata.platformRole when present.
 * Users without an assigned role keep the dev RoleSwitcher default.
 */
export function AuthRoleBridge() {
  const { isSignedIn, user } = useUser();
  const { setRole } = useRole();

  React.useEffect(() => {
    if (!isSignedIn || !user) return;

    const candidate = user.publicMetadata?.platformRole;
    if (typeof candidate === "string" && (ROLES as readonly string[]).includes(candidate)) {
      setRole(candidate as Role);
    }
  }, [isSignedIn, user, setRole]);

  return null;
}
