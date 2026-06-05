/**
 * Auth integration stub.
 *
 * The platform currently runs WITHOUT authentication. Role-aware UI is driven
 * by the dev RoleSwitcher + RoleProvider. This module documents the seams where
 * Clerk (or another provider) will plug in later.
 *
 * To enable Clerk later:
 *   1. npm install @clerk/nextjs
 *   2. Add CLERK_* keys to .env (see .env.example placeholders).
 *   3. Wrap the root layout with <ClerkProvider>.
 *   4. Create src/middleware.ts using clerkMiddleware() to protect routes.
 *   5. Replace getCurrentActor() below with the authenticated Clerk user and
 *      map Clerk roles/orgs to the Role union in src/lib/rbac/roles.ts.
 */
import type { Role } from "@/lib/rbac/roles";

export interface CurrentActor {
  name: string;
  role: Role | null;
  authenticated: boolean;
}

export function getCurrentActor(): CurrentActor {
  // No auth yet — server actions log audit events as "system".
  return { name: "system", role: null, authenticated: false };
}

export const AUTH_ENABLED = false;
