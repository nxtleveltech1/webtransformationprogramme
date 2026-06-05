import { getCurrentActor } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Writes an audit event. When actorName/actorRole are omitted, the signed-in
 * Clerk user is recorded automatically.
 */
export async function writeAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorName?: string | null;
  actorRole?: string | null;
  payload?: unknown;
}) {
  try {
    const actor =
      params.actorName === undefined && params.actorRole === undefined
        ? await getCurrentActor()
        : null;

    await prisma.auditEvent.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorName:
          params.actorName ?? (actor?.authenticated ? actor.name : "system"),
        actorRole: params.actorRole ?? actor?.role ?? null,
        payload: params.payload === undefined ? undefined : (params.payload as object),
      },
    });
  } catch {
    // Audit must never break the primary mutation.
  }
}
