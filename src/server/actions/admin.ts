"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput, type ActionResult } from "@/server/actions/helpers";
import {
  userUpdateSchema,
  userRoleSchema,
  programmeSettingsSchema,
} from "@/lib/validation/admin";

export async function updateUser(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(userUpdateSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...data } = parsed.data;
  try {
    const user = await prisma.user.update({ where: { id }, data });
    await writeAudit({
      entityType: "User",
      entityId: user.id,
      action: "update",
      payload: data,
    });
    revalidatePath("/admin");
    return ok(user, "User updated");
  } catch {
    return fail("Could not update the user.");
  }
}

export async function assignRole(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(userRoleSchema, input);
  if (!parsed.success) return parsed.result;
  const { userId, roleId } = parsed.data;
  try {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      create: { userId, roleId },
      update: {},
    });
    await writeAudit({
      entityType: "User",
      entityId: userId,
      action: "assign-role",
      payload: { roleId },
    });
    revalidatePath("/admin");
    return ok(null, "Role assigned");
  } catch {
    return fail("Could not assign the role.");
  }
}

export async function removeRole(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(userRoleSchema, input);
  if (!parsed.success) return parsed.result;
  const { userId, roleId } = parsed.data;
  try {
    await prisma.userRole.deleteMany({ where: { userId, roleId } });
    await writeAudit({
      entityType: "User",
      entityId: userId,
      action: "remove-role",
      payload: { roleId },
    });
    revalidatePath("/admin");
    return ok(null, "Role removed");
  } catch {
    return fail("Could not remove the role.");
  }
}

export async function updateProgrammeSettings(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(programmeSettingsSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...data } = parsed.data;
  try {
    const programme = await prisma.programme.update({
      where: { id },
      data: {
        name: data.name,
        hardDeadline: data.hardDeadline || null,
        rag: data.rag ?? null,
        mvpSummary: data.mvpSummary || null,
      },
    });
    await writeAudit({
      entityType: "Programme",
      entityId: programme.id,
      action: "update-settings",
      payload: data,
    });
    revalidatePath("/admin");
    return ok(programme, "Settings saved");
  } catch {
    return fail("Could not save programme settings.");
  }
}
