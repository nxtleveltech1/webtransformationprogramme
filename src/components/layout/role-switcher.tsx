"use client";

import { UserCog } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/lib/rbac/role-context";
import { ROLES, ROLE_DEFINITIONS, type Role } from "@/lib/rbac/roles";

/**
 * Dev-only role switcher. Auth is not yet wired (Clerk planned), so the active
 * role is selected here to drive role-aware navigation and actions.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <UserCog className="text-muted-foreground hidden size-4 sm:block" />
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger size="sm" className="w-[170px]" aria-label="Active role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_DEFINITIONS[r].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
