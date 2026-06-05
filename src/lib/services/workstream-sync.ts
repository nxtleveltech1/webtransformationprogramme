import type { Project, Workstream } from "@prisma/client";

import { prisma } from "@/lib/db";

type ProjectSyncFields = Pick<
  Project,
  "workstreamId" | "code" | "name" | "description" | "rag" | "ownerPersonId" | "ownerText"
>;

type WorkstreamSyncFields = Pick<
  Workstream,
  "id" | "code" | "name" | "oneLineStatus" | "rag" | "leadPersonId" | "leadText"
>;

export function canonicalProjectCode(workstreamCode: string): string {
  return `PRJ-${workstreamCode}`;
}

function isCanonicalProject(
  project: Pick<Project, "code">,
  workstream: Pick<Workstream, "code">,
): boolean {
  return project.code === canonicalProjectCode(workstream.code);
}

/**
 * Programme seed creates one canonical project per workstream (`PRJ-{code}`).
 * Keep the workstream dashboard in sync when that project is edited.
 */
export async function syncWorkstreamFromCanonicalProject(
  project: ProjectSyncFields,
): Promise<string | null> {
  if (!project.workstreamId) return null;

  const workstream = await prisma.workstream.findUnique({
    where: { id: project.workstreamId },
    select: { id: true, code: true },
  });
  if (!workstream || !isCanonicalProject(project, workstream)) return null;

  await prisma.workstream.update({
    where: { id: workstream.id },
    data: {
      name: project.name,
      oneLineStatus: project.description,
      rag: project.rag,
      leadPersonId: project.ownerPersonId,
      leadText: project.ownerText,
    },
  });

  return workstream.id;
}

/** Mirror workstream edits back onto the canonical programme project. */
export async function syncCanonicalProjectFromWorkstream(
  workstream: WorkstreamSyncFields,
): Promise<string | null> {
  const code = canonicalProjectCode(workstream.code);
  const project = await prisma.project.findFirst({
    where: { code, workstreamId: workstream.id },
    select: { id: true },
  });
  if (!project) return null;

  await prisma.project.update({
    where: { id: project.id },
    data: {
      name: workstream.name,
      description: workstream.oneLineStatus,
      rag: workstream.rag,
      ownerPersonId: workstream.leadPersonId,
      ownerText: workstream.leadText,
    },
  });

  return project.id;
}
