import { NextResponse } from "next/server";

import { requireEntityAction, PermissionDeniedError } from "@/lib/rbac/server-guard";
import {
  getSteeringPackData,
  buildSteeringPackWorkbook,
  buildReportsWorkbook,
} from "@/lib/export/steering-pack";
import {
  buildWorkbookXml,
  excelFileName,
  EXCEL_CONTENT_TYPE,
} from "@/lib/export/excel";

export const dynamic = "force-dynamic";

/**
 * Multi-sheet Excel export.
 *  - default / ?scope=steering -> Steering Pack workbook (summary + datasets)
 *  - ?scope=reports            -> all report datasets only
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

  const scope = new URL(request.url).searchParams.get("scope") ?? "steering";

  let xml: string;
  let filename: string;
  try {
    const data = await getSteeringPackData();
    if (scope === "reports") {
      xml = buildWorkbookXml(buildReportsWorkbook(data.reports));
      filename = excelFileName("om-reports-export");
    } else {
      xml = buildWorkbookXml(buildSteeringPackWorkbook(data));
      filename = excelFileName("om-steering-pack");
    }
  } catch {
    return new NextResponse("Failed to build the workbook.", { status: 500 });
  }

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": EXCEL_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
