import { prisma } from "@/lib/db";

/**
 * Writes an audit event. Auth is not yet wired (Clerk planned), so the actor
 * is optional and defaults to "system". When Clerk is integrated, pass the
 * authenticated user's name/role here.
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
    await prisma.auditEvent.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorName: params.actorName ?? "system",
        actorRole: params.actorRole ?? null,
        payload: params.payload === undefined ? undefined : (params.payload as object),
      },
    });
  } catch {
    // Audit must never break the primary mutation.
  }
}
