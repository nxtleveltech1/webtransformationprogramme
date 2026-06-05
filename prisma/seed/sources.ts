import { PrismaClient } from "@prisma/client";
import { SOURCES } from "./utils";

export async function seedSources(prisma: PrismaClient, workshopId: string) {
  for (const [extId, filePath, mime, day, auth, status, excluded] of SOURCES) {
    await prisma.sourceDocument.create({
      data: {
        workshopId,
        externalId: extId,
        filePath,
        mimeType: mime,
        workshopDay: day,
        authoritativeFor: auth ?? undefined,
        ingestStatus: status,
        excludedReason: excluded ?? undefined,
      },
    });
  }

  await prisma.ingestionLogEntry.createMany({
    data: [
      {
        action: "Initial pack build",
        sourceIds: ["SRC-001", "SRC-002", "SRC-003"],
        notes: "Day 1 context, session record, all 8 registers populated.",
        occurredAt: new Date("2026-06-03"),
      },
      {
        action: "Ingest Day 1 Sessions 2 & 3",
        sourceIds: ["SRC-005", "SRC-006"],
        notes: "Extended registers DEC-012–014, ACT-025–054, etc.",
        occurredAt: new Date("2026-06-03"),
      },
      {
        action: "Reconcile SRC-007 + publish exec pack",
        sourceIds: ["SRC-007"],
        notes: "Reconciliation log; full xlsx + HTML export.",
        occurredAt: new Date("2026-06-03"),
      },
      {
        action: "Ingest Day 2 delivery baseline",
        sourceIds: ["SRC-008", "SRC-009"],
        notes:
          "Day 2 phasing, red/green templates, resourcing, readiness and governance updates.",
        occurredAt: new Date("2026-06-04"),
      },
    ],
  });
}
