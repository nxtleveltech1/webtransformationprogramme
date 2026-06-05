"use client";

import { useRole } from "@/lib/rbac/role-context";
import type { EntityKey, PermissionAction } from "@/lib/rbac/permissions";
import { PermissionDenied } from "@/components/shared/states";

/**
 * Renders children only when the active role has the given permission.
 */
export function Can({
  action,
  entity,
  fallback = null,
  children,
}: {
  action: PermissionAction;
  entity: EntityKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can } = useRole();
  if (!can(action, entity)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Page-level guard that shows a permission-denied state when the active role
 * cannot view the entity.
 */
export function ViewGuard({
  entity,
  entityLabel,
  children,
}: {
  entity: EntityKey;
  entityLabel?: string;
  children: React.ReactNode;
}) {
  const { canView } = useRole();
  if (!canView(entity)) return <PermissionDenied entity={entityLabel ?? entity} />;
  return <>{children}</>;
}
