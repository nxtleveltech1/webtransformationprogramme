import type { Role } from "./roles";

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "assign",
  "approve",
  "reject",
  "escalate",
  "archive",
  "delete",
  "export",
  "configure",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/**
 * Logical entity keys used for permission checks across modules.
 */
export type EntityKey =
  | "programme"
  | "phase"
  | "project"
  | "workstream"
  | "task"
  | "wbs"
  | "deliverable"
  | "milestone"
  | "dependency"
  | "risk"
  | "issue"
  | "decision"
  | "assumption"
  | "question"
  | "parkingLot"
  | "changeRequest"
  | "approval"
  | "readinessGate"
  | "governanceMeeting"
  | "evidence"
  | "statusUpdate"
  | "comment"
  | "attachment"
  | "resource"
  | "document"
  | "notification"
  | "report"
  | "governance"
  | "people"
  | "integration"
  | "admin";

const ALL_ACTIONS: PermissionAction[] = [...PERMISSION_ACTIONS];
const WRITE_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "assign",
  "escalate",
  "export",
];
const VIEW_EXPORT: PermissionAction[] = ["view", "export"];
const VIEW_ONLY: PermissionAction[] = ["view"];

/**
 * Entities that are sensitive and only accessible to elevated roles.
 */
const RESTRICTED_ENTITIES: Partial<Record<EntityKey, Role[]>> = {
  admin: ["SUPER_ADMIN"],
  integration: ["SUPER_ADMIN", "PROGRAMME_DIRECTOR"],
};

/**
 * Role -> default action capabilities (applied to all non-restricted entities).
 */
const ROLE_CAPABILITIES: Record<Role, PermissionAction[]> = {
  SUPER_ADMIN: ALL_ACTIONS,
  PROGRAMME_DIRECTOR: [
    "view",
    "create",
    "edit",
    "assign",
    "approve",
    "reject",
    "escalate",
    "archive",
    "export",
  ],
  PROJECT_MANAGER: [...WRITE_ACTIONS, "archive"],
  WORKSTREAM_LEAD: WRITE_ACTIONS,
  SME: ["view", "create", "edit", "export"],
  CONTRIBUTOR: ["view", "create", "edit"],
  APPROVER: ["view", "approve", "reject", "export"],
  EXECUTIVE_VIEWER: VIEW_EXPORT,
  READ_ONLY_STAKEHOLDER: VIEW_ONLY,
};

/**
 * Approval actions belong to approver-capable roles only.
 */
const APPROVAL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "PROGRAMME_DIRECTOR",
  "APPROVER",
];

export function can(
  role: Role,
  action: PermissionAction,
  entity: EntityKey,
): boolean {
  const restrictedTo = RESTRICTED_ENTITIES[entity];
  if (restrictedTo && !restrictedTo.includes(role)) {
    return false;
  }

  if ((action === "approve" || action === "reject") &&
    !APPROVAL_ROLES.includes(role)) {
    return false;
  }

  if (action === "configure" && role !== "SUPER_ADMIN") {
    return false;
  }

  if (action === "delete" && !["SUPER_ADMIN", "PROGRAMME_DIRECTOR"].includes(role)) {
    return false;
  }

  return ROLE_CAPABILITIES[role].includes(action);
}

export function canView(role: Role, entity: EntityKey): boolean {
  return can(role, "view", entity);
}
