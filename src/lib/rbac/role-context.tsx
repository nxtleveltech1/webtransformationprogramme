"use client";

import * as React from "react";

import {
  DEFAULT_ROLE,
  ROLE_DEFINITIONS,
  type Role,
} from "./roles";
import {
  can,
  canView,
  type EntityKey,
  type PermissionAction,
} from "./permissions";

const STORAGE_KEY = "pcp.active-role";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  can: (action: PermissionAction, entity: EntityKey) => boolean;
  canView: (entity: EntityKey) => boolean;
  label: string;
}

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(DEFAULT_ROLE);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored && stored in ROLE_DEFINITIONS) {
      setRoleState(stored);
    }
  }, []);

  const setRole = React.useCallback((next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = React.useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      can: (action, entity) => can(role, action, entity),
      canView: (entity) => canView(role, entity),
      label: ROLE_DEFINITIONS[role].label,
    }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
