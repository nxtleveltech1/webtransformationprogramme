"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { revalidateProjectViews } from "@/lib/revalidate-paths";
import { syncWorkstreamFromCanonicalProject } from "@/lib/services/workstream-sync";
import { ok, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
} from "@/lib/validation/projects";

function buildData(data: Omit<CreateProjectInput, never>): Prisma.ProjectUncheckedCreateInput {
  return {
    name: data.name,
    code: data.code ?? null,
    description: data.description ?? null,
    status: data.status,
    priority: data.priority,
    rag: data.rag ?? null,
    programmeId: data.programmeId ?? null,
    workstreamId: data.workstreamId ?? null,
    ownerPersonId: data.ownerPersonId ?? null,
    ownerText: data.ownerText ?? null,
    sponsor: data.sponsor ?? null,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    budgetNote: data.budgetNote ?? null,
  };
}

export async function createProject(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(createProjectSchema, input);
  if (!parsed.success) return parsed.result;

  const project = await prisma.project.create({ data: buildData(parsed.data) });
  const syncedWorkstreamId = await syncWorkstreamFromCanonicalProject(project);

  await writeAudit({
    entityType: "Project",
    entityId: project.id,
    action: "create",
    payload: { name: project.name, code: project.code },
  });
  revalidateProjectViews(project.id, project.workstreamId, syncedWorkstreamId);
  return ok(project, "Project created");
}

export async function updateProject(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(updateProjectSchema, input);
  if (!parsed.success) return parsed.result;

  const { id, ...rest } = parsed.data;
  const prior = await prisma.project.findUnique({
    where: { id },
    select: { workstreamId: true },
  });
  const project = await prisma.project.update({ where: { id }, data: buildData(rest) });
  const syncedWorkstreamId = await syncWorkstreamFromCanonicalProject(project);

  await writeAudit({
    entityType: "Project",
    entityId: project.id,
    action: "update",
    payload: rest,
  });
  revalidateProjectViews(
    project.id,
    prior?.workstreamId,
    project.workstreamId,
    syncedWorkstreamId,
  );
  return ok(project, "Project updated");
}

export async function archiveProject(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(
    updateProjectSchema.pick({ id: true }),
    input,
  );
  if (!parsed.success) return parsed.result;

  const project = await prisma.project.update({
    where: { id: parsed.data.id },
    data: { status: "CANCELLED" },
  });

  await writeAudit({
    entityType: "Project",
    entityId: project.id,
    action: "archive",
  });
  revalidateProjectViews(project.id, project.workstreamId);
  return ok(project, "Project archived");
}
