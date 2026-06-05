import { prisma } from "@/lib/db";

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { displayName: "asc" },
    include: {
      roles: { include: { role: { select: { id: true, key: true, name: true } } } },
      person: { select: { id: true, displayName: true } },
    },
  });
}

export type AdminUser = Awaited<ReturnType<typeof getAdminUsers>>[number];

export async function getAdminRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { users: true, permissions: true } },
      permissions: {
        include: {
          permission: { select: { id: true, key: true, entity: true, action: true } },
        },
      },
    },
  });
  return roles;
}

export type AdminRole = Awaited<ReturnType<typeof getAdminRoles>>[number];

export async function getAdminPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ entity: "asc" }, { action: "asc" }],
  });
}

export type AdminPermission = Awaited<ReturnType<typeof getAdminPermissions>>[number];

export async function getAuditEvents(limit = 500) {
  return prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type AuditEventRecord = Awaited<ReturnType<typeof getAuditEvents>>[number];

export async function getProgrammeSettings() {
  return prisma.programme.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export type ProgrammeSettings = Awaited<ReturnType<typeof getProgrammeSettings>>;

export async function getAdminData() {
  const [users, roles, permissions, auditEvents, programme] = await Promise.all([
    getAdminUsers(),
    getAdminRoles(),
    getAdminPermissions(),
    getAuditEvents(),
    getProgrammeSettings(),
  ]);
  return { users, roles, permissions, auditEvents, programme };
}
