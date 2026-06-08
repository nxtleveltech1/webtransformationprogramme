import { NextResponse } from "next/server";

import { requireEntityAction, PermissionDeniedError } from "@/lib/rbac/server-guard";
import { getSteeringPackData } from "@/lib/export/steering-pack";
import { buildSteeringPackHtml } from "@/lib/export/pdf";

export const dynamic = "force-dynamic";

/**
 * Print-optimised, Old-Mutual-branded Steering Pack HTML. Opened in a new tab;
 * `?print=1` auto-triggers the browser print dialog so the user can "Save as
 * PDF". This is the documented fallback for server-side PDF (no PDF binary
 * could be installed in this environment).
 */
export async function GET(request: Request) {
  try {
    await requireEntityAction("report", "export");
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return new NextResponse(error.message, { status: 403 });
    }
    throw error;
  }

  const autoPrint = new URL(request.url).searchParams.get("print") === "1";

  let html: string;
  try {
    const data = await getSteeringPackData();
    html = buildSteeringPackHtml(data, { autoPrint });
  } catch {
    return new NextResponse("Failed to assemble the steering pack.", { status: 500 });
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
