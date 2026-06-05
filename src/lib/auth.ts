import { auth, currentUser } from "@clerk/nextjs/server";

import { DEFAULT_ROLE, ROLES, type Role } from "@/lib/rbac/roles";

export interface CurrentActor {
  name: string;
  role: Role | null;
  authenticated: boolean;
  userId: string | null;
}

function resolvePlatformRole(
  metadata: Record<string, unknown> | undefined,
): Role | null {
  const candidate = metadata?.platformRole;
  if (typeof candidate === "string" && (ROLES as readonly string[]).includes(candidate)) {
    return candidate as Role;
  }
  return null;
}

export async function getCurrentActor(): Promise<CurrentActor> {
  const { isAuthenticated, userId, sessionClaims } = await auth();

  if (!isAuthenticated || !userId) {
    return { name: "system", role: null, authenticated: false, userId: null };
  }

  const user = await currentUser();
  const sessionMetadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  const role =
    resolvePlatformRole(sessionMetadata) ??
    resolvePlatformRole(user?.publicMetadata as Record<string, unknown> | undefined) ??
    DEFAULT_ROLE;

  const name =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    "Signed-in user";

  return { name, role, authenticated: true, userId };
}

export const AUTH_ENABLED = true;
