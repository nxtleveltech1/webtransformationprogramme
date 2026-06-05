"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { revalidateProjectViews, revalidateWorkstreamViews } from "@/lib/revalidate-paths";
import { syncCanonicalProjectFromWorkstream } from "@/lib/services/workstream-sync";
import { ok, fail, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  createWorkstreamSchema,
  updateWorkstreamSchema,
  type CreateWorkstreamInput,
} from "@/lib/validation/workstreams";

function buildData(
  data: Omit<CreateWorkstreamInput, never>,
): Prisma.WorkstreamUncheckedCreateInput {
  return {
    code: data.code,
    name: data.name,
    oneLineStatus: data.oneLineStatus ?? null,
    rag: data.rag ?? null,
    leadPersonId: data.leadPersonId ?? null,
    programmeId: data.programmeId ?? null,
  };
}

export async function createWorkstream(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(createWorkstreamSchema, input);
  if (!parsed.success) return parsed.result;

  const existing = await prisma.workstream.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });
  if (existing) return fail(`Workstream code "${parsed.data.code}" is already in use.`);

  const workstream = await prisma.workstream.create({ data: buildData(parsed.data) });
  const syncedProjectId = await syncCanonicalProjectFromWorkstream(workstream);

  await writeAudit({
    entityType: "Workstream",
    entityId: workstream.id,
    action: "create",
    payload: { code: workstream.code, name: workstream.name },
  });
  revalidateWorkstreamViews(workstream.id);
  if (syncedProjectId) revalidateProjectViews(syncedProjectId, workstream.id);
  return ok(workstream, "Workstream created");
}

export async function updateWorkstream(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(updateWorkstreamSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...rest } = parsed.data;

  const clash = await prisma.workstream.findFirst({
    where: { code: rest.code, NOT: { id } },
    select: { id: true },
  });
  if (clash) return fail(`Workstream code "${rest.code}" is already in use.`);

  const workstream = await prisma.workstream.update({ where: { id }, data: buildData(rest) });
  const syncedProjectId = await syncCanonicalProjectFromWorkstream(workstream);

  await writeAudit({
    entityType: "Workstream",
    entityId: workstream.id,
    action: "update",
    payload: rest,
  });
  revalidateWorkstreamViews(workstream.id);
  if (syncedProjectId) revalidateProjectViews(syncedProjectId, workstream.id);
  return ok(workstream, "Workstream updated");
}
