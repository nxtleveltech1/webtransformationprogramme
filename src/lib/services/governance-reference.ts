import { prisma } from "@/lib/db";

export async function getGovernanceReferenceData() {
  const [docs, mappings] = await Promise.all([
    prisma.governanceReferenceDoc.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        ownerPerson: { select: { id: true, displayName: true } },
        sections: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.referenceMapping.findMany({
      orderBy: { conceptKey: "asc" },
      include: {
        glossaryTerm: { select: { id: true, term: true } },
        relatedDocSection: {
          select: { id: true, heading: true, docId: true },
        },
      },
    }),
  ]);

  const torDoc =
    docs.find((d) => d.slug === "programme-terms-of-reference") ?? docs[0] ?? null;

  return {
    docs,
    torDoc,
    mappings,
    summary: {
      mappingCount: mappings.length,
      publishedDocs: docs.filter((d) => d.status === "PUBLISHED").length,
      torSections: torDoc?.sections.length ?? 0,
      mappedTerms: mappings.filter((m) => m.glossaryTerm).length,
    },
  };
}

export type GovernanceReferenceData = Awaited<
  ReturnType<typeof getGovernanceReferenceData>
>;
