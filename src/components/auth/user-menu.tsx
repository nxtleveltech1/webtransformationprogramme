"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ROLES } from "@/lib/rbac/roles";

function hasAssignedPlatformRole(metadata: Record<string, unknown> | undefined) {
  const candidate = metadata?.platformRole;
  return typeof candidate === "string" && (ROLES as readonly string[]).includes(candidate);
}

export function UserMenu() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return null;
  }

  const showRoleSwitcher = !hasAssignedPlatformRole(
    user.publicMetadata as Record<string, unknown> | undefined,
  );

  return (
    <>
      {showRoleSwitcher && <RoleSwitcher />}
      <UserButton
        showName
        appearance={{
          elements: {
            userButtonPopoverCard: "border border-border shadow-lg",
            userButtonPopoverActionButton: "hover:bg-muted",
          },
        }}
      />
    </>
  );
}
