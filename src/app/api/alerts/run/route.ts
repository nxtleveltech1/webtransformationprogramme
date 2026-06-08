import { NextResponse } from "next/server";

import { writeAudit } from "@/lib/audit";
import { evaluateAlertRules } from "@/lib/alerts/engine";

/**
 * Alert engine cron endpoint.
 *
 * This route lets an external scheduler run the automated alerting rule engine
 * without a Clerk session. It is exempt from Clerk session protection in
 * `src/middleware.ts` and instead protects itself with a shared bearer secret.
 *
 * Protection:
 *   Set `ALERTS_CRON_SECRET` in the environment. Callers must send either
 *   `Authorization: Bearer <secret>` or `?secret=<secret>`. If the env var is
 *   not set the endpoint is disabled (returns 503) so it can never run
 *   unauthenticated by accident.
 *
 * How to schedule (no infra is provisioned here — this is documentation only):
 *
 *   1. Vercel Cron — add to `vercel.json`:
 *        {
 *          "crons": [{ "path": "/api/alerts/run", "schedule": "0 7 * * *" }]
 *        }
 *      Vercel cron requests carry the project's `CRON_SECRET` as a Bearer token;
 *      set `ALERTS_CRON_SECRET` to the same value so this handler accepts them.
 *
 *   2. External scheduler (GitHub Actions, cron-job.org, etc.):
 *        curl -X POST https://<host>/api/alerts/run \
 *          -H "Authorization: Bearer $ALERTS_CRON_SECRET"
 *
 * Supports GET (so it can be triggered from a browser/cron that only does GET)
 * and POST; both behave identically.
 */

export const dynamic = "force-dynamic";

async function handle(request: Request): Promise<Response> {
  const secret = process.env.ALERTS_CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Alert endpoint is not configured." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
  const querySecret = new URL(request.url).searchParams.get("secret");
  const provided = bearer ?? querySecret;

  if (provided !== secret) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const result = await evaluateAlertRules();
    await writeAudit({
      entityType: "Notification",
      entityId: "*",
      action: "alert-engine-run",
      actorName: "alert-engine (cron)",
      actorRole: null,
      payload: {
        created: result.created,
        skipped: result.skipped,
        byRule: result.byRule,
      },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Alert engine failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

export async function GET(request: Request): Promise<Response> {
  return handle(request);
}
