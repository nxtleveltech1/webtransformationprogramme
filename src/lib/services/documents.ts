import { prisma } from "@/lib/db";

export async function getDocuments() {
  return prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { id: true, name: true, code: true } },
      ownerPerson: { select: { id: true, displayName: true } },
    },
  });
}

export type DocumentWithRelations = Awaited<ReturnType<typeof getDocuments>>[number];

export async function getDocumentFormOptions() {
  const [projects, people] = await Promise.all([
    prisma.project.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.person.findMany({
      where: { kind: "PERSON" },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
  ]);
  return { projects, people };
}

export function summariseDocuments(documents: DocumentWithRelations[]) {
  return {
    total: documents.length,
    approved: documents.filter((d) => d.status === "APPROVED").length,
    inReview: documents.filter((d) => d.status === "IN_REVIEW").length,
    draft: documents.filter((d) => d.status === "DRAFT").length,
  };
}
