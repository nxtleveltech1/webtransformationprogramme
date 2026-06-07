"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PermissionDeniedError,
  requireEntityAction,
} from "@/lib/rbac/server-guard";
import {
  programmeRoleAssignSchema,
  stakeholderArchiveSchema,
  stakeholderCreateSchema,
  stakeholderRoleAssignSchema,
  stakeholderUpdateSchema,
  teamAssignSchema,
} from "@/lib/validation/stakeholders";
import { fail, ok, parseInput } from "@/server/actions/helpers";

const REVALIDATE_PATHS = ["/stakeholder-directory", "/people"];

function revalidateStakeholderViews() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

function permissionFail(error: unknown) {
  if (error instanceof PermissionDeniedError) {
    return fail(error.message);
  }
  throw error;
}

export async function createStakeholder(input: unknown) {
  try {
    await requireEntityAction("people", "create");
    const parsed = parseInput(stakeholderCreateSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const person = await prisma.person.create({
      data: {
        displayName: d.displayName,
        surname: d.surname ?? null,
        nickname: d.nickname ?? null,
        email: d.email ?? null,
        phone: d.phone ?? null,
        mobile: d.mobile ?? null,
        primaryContact: d.primaryContact ?? null,
        roleDescription: d.roleDescription ?? null,
        department: d.department ?? null,
        location: d.location ?? null,
        areaId: d.areaId ?? null,
        businessId: d.businessId ?? null,
        clusterId: d.clusterId ?? null,
        primaryWorkstreamId: d.primaryWorkstreamId ?? null,
        dataOwnerPersonId: d.dataOwnerPersonId ?? null,
        contactVisibility: d.contactVisibility ?? "PUBLIC_INTERNAL",
        confidence: d.confidence ?? "INFERRED",
        participantStatus: d.participantStatus ?? "CONFIRMED",
      },
    });

    await writeAudit({
      entityType: "Person",
      entityId: person.id,
      action: "create",
      payload: { displayName: person.displayName },
    });
    revalidateStakeholderViews();
    return ok({ id: person.id }, "Stakeholder created.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function updateStakeholder(input: unknown) {
  try {
    await requireEntityAction("people", "edit");
    const parsed = parseInput(stakeholderUpdateSchema, input);
    if (!parsed.success) return parsed.result;
    const { id, ...d } = parsed.data;

    const person = await prisma.person.update({
      where: { id },
      data: {
        ...(d.displayName !== undefined ? { displayName: d.displayName } : {}),
        ...(d.surname !== undefined ? { surname: d.surname } : {}),
        ...(d.nickname !== undefined ? { nickname: d.nickname } : {}),
        ...(d.email !== undefined ? { email: d.email } : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.mobile !== undefined ? { mobile: d.mobile } : {}),
        ...(d.primaryContact !== undefined ? { primaryContact: d.primaryContact } : {}),
        ...(d.roleDescription !== undefined ? { roleDescription: d.roleDescription } : {}),
        ...(d.department !== undefined ? { department: d.department } : {}),
        ...(d.location !== undefined ? { location: d.location } : {}),
        ...(d.participantStatus !== undefined
          ? { participantStatus: d.participantStatus }
          : {}),
        ...(d.areaId !== undefined ? { areaId: d.areaId } : {}),
        ...(d.businessId !== undefined ? { businessId: d.businessId } : {}),
        ...(d.clusterId !== undefined ? { clusterId: d.clusterId } : {}),
        ...(d.primaryWorkstreamId !== undefined
          ? { primaryWorkstreamId: d.primaryWorkstreamId }
          : {}),
        ...(d.dataOwnerPersonId !== undefined
          ? { dataOwnerPersonId: d.dataOwnerPersonId }
          : {}),
        ...(d.contactVisibility !== undefined
          ? { contactVisibility: d.contactVisibility }
          : {}),
        ...(d.confidence !== undefined ? { confidence: d.confidence } : {}),
      },
    });

    await writeAudit({
      entityType: "Person",
      entityId: person.id,
      action: "update",
      payload: { displayName: person.displayName },
    });
    revalidateStakeholderViews();
    return ok({ id: person.id }, "Stakeholder updated.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function assignStakeholderRole(input: unknown) {
  try {
    await requireEntityAction("people", "assign");
    const parsed = parseInput(stakeholderRoleAssignSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const existing = await prisma.stakeholderRole.findFirst({
      where: {
        personId: d.personId,
        roleType: d.roleType,
        scope: d.scope ?? null,
      },
    });

    const assignment = existing
      ? await prisma.stakeholderRole.update({
          where: { id: existing.id },
          data: { roleLabel: d.roleLabel ?? null },
        })
      : await prisma.stakeholderRole.create({
          data: {
            personId: d.personId,
            roleType: d.roleType,
            roleLabel: d.roleLabel ?? null,
            scope: d.scope ?? null,
          },
        });

    await writeAudit({
      entityType: "StakeholderRole",
      entityId: assignment.id,
      action: "assign",
      payload: { personId: d.personId, roleType: d.roleType },
    });
    revalidateStakeholderViews();
    return ok({ id: assignment.id }, "Stakeholder role assigned.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function assignProgrammeRole(input: unknown) {
  try {
    await requireEntityAction("people", "assign");
    const parsed = parseInput(programmeRoleAssignSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const scope = d.scope ?? "";
    const assignment = await prisma.programmeRoleAssignment.upsert({
      where: {
        personId_roleType_scope: {
          personId: d.personId,
          roleType: d.roleType,
          scope,
        },
      },
      create: {
        personId: d.personId,
        roleType: d.roleType,
        scope: scope || null,
        isPrimary: d.isPrimary ?? false,
        workstreamId: d.workstreamId ?? null,
      },
      update: {
        isPrimary: d.isPrimary ?? false,
        workstreamId: d.workstreamId ?? null,
      },
    });

    await writeAudit({
      entityType: "ProgrammeRoleAssignment",
      entityId: assignment.id,
      action: "assign",
      payload: { personId: d.personId, roleType: d.roleType },
    });
    revalidateStakeholderViews();
    return ok({ id: assignment.id }, "Programme role assigned.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function removeProgrammeRole(input: unknown) {
  try {
    await requireEntityAction("people", "assign");
    const parsed = parseInput(
      programmeRoleAssignSchema.pick({ personId: true, roleType: true, scope: true }),
      input,
    );
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const scope = d.scope ?? "";
    const existing = await prisma.programmeRoleAssignment.findUnique({
      where: {
        personId_roleType_scope: {
          personId: d.personId,
          roleType: d.roleType,
          scope,
        },
      },
    });
    if (!existing) return fail("Programme role assignment not found.");

    await prisma.programmeRoleAssignment.delete({ where: { id: existing.id } });
    await writeAudit({
      entityType: "ProgrammeRoleAssignment",
      entityId: existing.id,
      action: "remove",
      payload: { personId: d.personId, roleType: d.roleType },
    });
    revalidateStakeholderViews();
    return ok(undefined, "Programme role removed.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function assignTeam(input: unknown) {
  try {
    await requireEntityAction("people", "assign");
    const parsed = parseInput(teamAssignSchema, input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const assignment = await prisma.personTeam.upsert({
      where: { personId_teamId: { personId: d.personId, teamId: d.teamId } },
      create: {
        personId: d.personId,
        teamId: d.teamId,
        isPrimary: d.isPrimary ?? false,
      },
      update: { isPrimary: d.isPrimary ?? false },
    });

    await writeAudit({
      entityType: "PersonTeam",
      entityId: assignment.id,
      action: "assign",
      payload: { personId: d.personId, teamId: d.teamId },
    });
    revalidateStakeholderViews();
    return ok({ id: assignment.id }, "Team assignment saved.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function removeTeam(input: unknown) {
  try {
    await requireEntityAction("people", "assign");
    const parsed = parseInput(teamAssignSchema.pick({ personId: true, teamId: true }), input);
    if (!parsed.success) return parsed.result;
    const d = parsed.data;

    const existing = await prisma.personTeam.findUnique({
      where: { personId_teamId: { personId: d.personId, teamId: d.teamId } },
    });
    if (!existing) return fail("Team assignment not found.");

    await prisma.personTeam.delete({ where: { id: existing.id } });
    await writeAudit({
      entityType: "PersonTeam",
      entityId: existing.id,
      action: "remove",
      payload: { personId: d.personId, teamId: d.teamId },
    });
    revalidateStakeholderViews();
    return ok(undefined, "Team assignment removed.");
  } catch (error) {
    return permissionFail(error);
  }
}

export async function archiveStakeholder(input: unknown) {
  try {
    await requireEntityAction("people", "archive");
    const parsed = parseInput(stakeholderArchiveSchema, input);
    if (!parsed.success) return parsed.result;

    const person = await prisma.person.update({
      where: { id: parsed.data.id },
      data: { active: false },
    });

    await writeAudit({
      entityType: "Person",
      entityId: person.id,
      action: "archive",
      payload: { displayName: person.displayName },
    });
    revalidateStakeholderViews();
    return ok({ id: person.id }, "Stakeholder archived.");
  } catch (error) {
    return permissionFail(error);
  }
}
