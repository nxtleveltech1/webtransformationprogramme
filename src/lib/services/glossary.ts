import { prisma } from "@/lib/db";

export async function getGlossaryData() {
  const glossary = await prisma.glossaryTerm.findMany({
    orderBy: [{ category: "asc" }, { term: "asc" }],
  });

  return {
    glossary,
    summary: {
      glossaryCount: glossary.length,
      categories: [...new Set(glossary.map((g) => g.category))],
      confirmed: glossary.filter((g) => g.confidence === "CONFIRMED").length,
      needsValidation: glossary.filter(
        (g) => g.confidence === "REQUIRES_VALIDATION" || g.confidence === "UNCONFIRMED",
      ).length,
    },
  };
}

export type GlossaryData = Awaited<ReturnType<typeof getGlossaryData>>;
