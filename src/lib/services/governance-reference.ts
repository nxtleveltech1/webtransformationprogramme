import { prisma } from "@/lib/db";

export async function getGovernanceReferenceData() {
  const [docs, glossary, mappings] = await Promise.all([
    prisma.governanceReferenceDoc.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        ownerPerson: { select: { id: true, displayName: true } },
        sections: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.glossaryTerm.findMany({
      orderBy: [{ category: "asc" }, { term: "asc" }],
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
    glossary,
    mappings,
    summary: {
      glossaryCount: glossary.length,
      mappingCount: mappings.length,
      publishedDocs: docs.filter((d) => d.status === "PUBLISHED").length,
      categories: [...new Set(glossary.map((g) => g.category))],
    },
  };
}

export type GovernanceReferenceData = Awaited<
  ReturnType<typeof getGovernanceReferenceData>
>;
