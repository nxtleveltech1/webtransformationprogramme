"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import {
  scenarioChangeDeleteSchema,
  scenarioChangeSchema,
  scenarioDeleteSchema,
  scenarioSchema,
} from "@/lib/validation/scenarios";
import { fail, ok, parseInput, type ActionResult } from "@/server/actions/helpers";

function revalidateScenarios() {
  revalidatePath("/scenarios");
}

function permissionFail(error: unknown) {
  if (error instanceof PermissionDeniedError) {
    return fail(error.message);
  }
  throw error;
}

export async function upsertScenario(input: unknown): Promise<ActionResult> {
  try {
    await requireEntityAction("scenario", input && (input as { id?: string }).id ? "edit" : "create");
    const parsed = parseInput(scenarioSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const scenario = d.id
      ? await prisma.scenario.update({
          where: { id: d.id },
          data: {
            name: d.name,
            description: d.description ?? null,
            ...(d.status ? { status: d.status } : {}),
          },
        })
      : await prisma.scenario.create({
          data: {
            name: d.name,
            description: d.description ?? null,
            status: d.status ?? "DRAFT",
          },
        });

    await writeAudit({
      entityType: "Scenario",
      entityId: scenario.id,
      action: d.id ? "update" : "create",
      payload: { name: scenario.name },
    });
    revalidateScenarios();
    return ok({ id: scenario.id }, "Scenario saved.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function deleteScenario(input: unknown): Promise<ActionResult> {
  try {
    await requireEntityAction("scenario", "delete");
    const parsed = parseInput(scenarioDeleteSchema, input);
    if (!parsed.success) return parsed.result;

    const existing = await prisma.scenario.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, name: true },
    });
    if (!existing) return fail("Scenario not found.");

    // ScenarioChange rows cascade on delete (FK ON DELETE CASCADE).
    await prisma.scenario.delete({ where: { id: existing.id } });
    await writeAudit({
      entityType: "Scenario",
      entityId: existing.id,
      action: "delete",
      payload: { name: existing.name },
    });
    revalidateScenarios();
    return ok({ id: existing.id }, "Scenario deleted.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function addScenarioChange(input: unknown): Promise<ActionResult> {
  try {
    await requireEntityAction("scenario", "edit");
    const parsed = parseInput(scenarioChangeSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const scenario = await prisma.scenario.findUnique({
      where: { id: d.scenarioId },
      select: { id: true },
    });
    if (!scenario) return fail("Scenario not found.");

    const change = await prisma.scenarioChange.create({
      data: {
        scenarioId: d.scenarioId,
        targetType: d.targetType,
        targetId: d.targetId,
        targetLabel: d.targetLabel ?? null,
        deltaDays: d.deltaDays,
        note: d.note ?? null,
      },
    });
    // Bump the scenario's updatedAt so list ordering reflects the edit.
    await prisma.scenario.update({
      where: { id: d.scenarioId },
      data: { updatedAt: new Date() },
    });

    await writeAudit({
      entityType: "ScenarioChange",
      entityId: change.id,
      action: "create",
      payload: { scenarioId: d.scenarioId, targetType: d.targetType, deltaDays: d.deltaDays },
    });
    revalidateScenarios();
    return ok({ id: change.id }, "What-if change added.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function deleteScenarioChange(input: unknown): Promise<ActionResult> {
  try {
    await requireEntityAction("scenario", "edit");
    const parsed = parseInput(scenarioChangeDeleteSchema, input);
    if (!parsed.success) return parsed.result;

    const existing = await prisma.scenarioChange.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, scenarioId: true },
    });
    if (!existing) return fail("Change not found.");

    await prisma.scenarioChange.delete({ where: { id: existing.id } });
    await prisma.scenario.update({
      where: { id: existing.scenarioId },
      data: { updatedAt: new Date() },
    });

    await writeAudit({
      entityType: "ScenarioChange",
      entityId: existing.id,
      action: "delete",
      payload: { scenarioId: existing.scenarioId },
    });
    revalidateScenarios();
    return ok({ id: existing.id }, "Change removed.");
  } catch (error) {
    return permissionFail(error);
  }
}
