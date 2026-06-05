export const ROLES = [
  "SUPER_ADMIN",
  "PROGRAMME_DIRECTOR",
  "PROJECT_MANAGER",
  "WORKSTREAM_LEAD",
  "SME",
  "CONTRIBUTOR",
  "APPROVER",
  "EXECUTIVE_VIEWER",
  "READ_ONLY_STAKEHOLDER",
] as const;

export type Role = (typeof ROLES)[number];

export interface RoleDefinition {
  id: Role;
  label: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  SUPER_ADMIN: {
    id: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full platform access including administration and configuration.",
  },
  PROGRAMME_DIRECTOR: {
    id: "PROGRAMME_DIRECTOR",
    label: "Programme Director",
    description: "Owns the programme; can approve, escalate and manage delivery.",
  },
  PROJECT_MANAGER: {
    id: "PROJECT_MANAGER",
    label: "Project Manager",
    description: "Manages projects, tasks, RAID and resources within the programme.",
  },
  WORKSTREAM_LEAD: {
    id: "WORKSTREAM_LEAD",
    label: "Workstream Lead",
    description: "Leads a workstream and its actions, risks and dependencies.",
  },
  SME: {
    id: "SME",
    label: "SME",
    description: "Subject matter expert contributing to delivery items.",
  },
  CONTRIBUTOR: {
    id: "CONTRIBUTOR",
    label: "Contributor",
    description: "Creates and updates their own tasks and items.",
  },
  APPROVER: {
    id: "APPROVER",
    label: "Approver",
    description: "Reviews and approves or rejects items in the approval queue.",
  },
  EXECUTIVE_VIEWER: {
    id: "EXECUTIVE_VIEWER",
    label: "Executive / Steering Viewer",
    description: "Read access to dashboards and executive reports, with export.",
  },
  READ_ONLY_STAKEHOLDER: {
    id: "READ_ONLY_STAKEHOLDER",
    label: "Read-only Stakeholder",
    description: "View-only access across the platform.",
  },
};

export const DEFAULT_ROLE: Role = "PROGRAMME_DIRECTOR";
