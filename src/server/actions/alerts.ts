"use server";

import { revalidatePath } from "next/cache";

import { writeAudit } from "@/lib/audit";
import { evaluateAlertRules } from "@/lib/alerts/engine";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import { fail, ok, type ActionResult } from "@/server/actions/helpers";

/** Roles allowed to run the alert engine: admins and programme directors. */
const ALERT_RUNNER_ROLES = ["SUPER_ADMIN", "PROGRAMME_DIRECTOR"] as const;

/**
 * Runs the automated alerting rule engine. Role-gated to admin / programme
 * director, writes an audit event, and revalidates the notifications surface so
 * any newly created alerts appear immediately.
 */
export async function runAlertEngine(): Promise<
  ActionResult<{ created: number; skipped: number }>
> {
  try {
    const actor = await requireEntityAction("notification", "escalate");
    if (!(ALERT_RUNNER_ROLES as readonly string[]).includes(actor.role)) {
      throw new PermissionDeniedError(
        "Only admins and programme directors can run the alert engine.",
      );
    }

    const result = await evaluateAlertRules();

    await writeAudit({
      entityType: "Notification",
      entityId: "*",
      action: "alert-engine-run",
      payload: {
        created: result.created,
        skipped: result.skipped,
        byRule: result.byRule,
      },
    });

    revalidatePath("/notifications");
    revalidatePath("/", "layout");

    return ok(
      { created: result.created, skipped: result.skipped },
      result.created > 0
        ? `Alert check complete — ${result.created} new alert(s) raised.`
        : "Alert check complete — no new alerts.",
    );
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return fail(error.message);
    }
    return fail("Could not run the alert engine.");
  }
}
