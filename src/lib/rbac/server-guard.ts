import { getCurrentActor } from "@/lib/auth";
import { can, type EntityKey, type PermissionAction } from "@/lib/rbac/permissions";
import type { Role } from "@/lib/rbac/roles";

export class PermissionDeniedError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export async function requireEntityAction(
  entity: EntityKey,
  action: PermissionAction,
): Promise<{ name: string; role: Role }> {
  const actor = await getCurrentActor();
  if (!actor.authenticated || !actor.role) {
    throw new PermissionDeniedError("Authentication required.");
  }
  if (!can(actor.role, action, entity)) {
    throw new PermissionDeniedError();
  }
  return { name: actor.name, role: actor.role };
}

export function canViewContactDetails(role: Role | null): boolean {
  if (!role) return false;
  return role !== "READ_ONLY_STAKEHOLDER";
}
