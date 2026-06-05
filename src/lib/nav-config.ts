import type { EntityKey } from "@/lib/rbac/permissions";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Network,
  ListChecks,
  CalendarRange,
  Flag,
  GitBranch,
  Route,
  ShieldAlert,
  AlertTriangle,
  Bug,
  Gavel,
  Lightbulb,
  HelpCircle,
  ParkingSquare,
  FileEdit,
  CheckSquare,
  Users2,
  BarChart3,
  FileText,
  Bell,
  Contact,
  Plug,
  Settings,
  Landmark,
  Table2,
  Workflow,
  Replace,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  entity: EntityKey;
}

export interface NavGroup {
  label: string;
  accent?: "heritage" | "naartjie" | "cerise" | "sky" | "sun";
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    accent: "heritage",
    items: [
      { label: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard, entity: "report" },
      { label: "Programme Workspace", href: "/programme", icon: Briefcase, entity: "programme" },
    ],
  },
  {
    label: "Delivery",
    accent: "naartjie",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban, entity: "project" },
      { label: "Workstreams", href: "/workstreams", icon: Network, entity: "workstream" },
      { label: "WBS Baseline", href: "/wbs", icon: Workflow, entity: "wbs" },
      { label: "Deliverables", href: "/deliverables", icon: CheckSquare, entity: "deliverable" },
      { label: "Tasks / Actions", href: "/tasks", icon: ListChecks, entity: "task" },
      { label: "Gantt / Roadmap", href: "/timeline", icon: CalendarRange, entity: "milestone" },
      { label: "Milestones", href: "/milestones", icon: Flag, entity: "milestone" },
      { label: "Critical Path", href: "/critical-path", icon: Route, entity: "milestone" },
      { label: "Dependencies", href: "/dependencies", icon: GitBranch, entity: "dependency" },
      { label: "Readiness / Go-No-Go", href: "/readiness", icon: ShieldAlert, entity: "readinessGate" },
    ],
  },
  {
    label: "RAID & Governance",
    accent: "cerise",
    items: [
      { label: "RAID", href: "/raid", icon: ShieldAlert, entity: "risk" },
      { label: "Risks", href: "/risks", icon: AlertTriangle, entity: "risk" },
      { label: "Issues", href: "/issues", icon: Bug, entity: "issue" },
      { label: "Decisions", href: "/decisions", icon: Gavel, entity: "decision" },
      { label: "Assumptions", href: "/assumptions", icon: Lightbulb, entity: "assumption" },
      { label: "Open Questions", href: "/open-questions", icon: HelpCircle, entity: "question" },
      { label: "Parking Lot", href: "/parking-lot", icon: ParkingSquare, entity: "parkingLot" },
      { label: "Change Control", href: "/change-control", icon: FileEdit, entity: "changeRequest" },
      { label: "Approvals", href: "/approvals", icon: CheckSquare, entity: "approval" },
      { label: "Governance", href: "/governance", icon: Landmark, entity: "governance" },
      { label: "Governance Calendar", href: "/governance-calendar", icon: CalendarRange, entity: "governanceMeeting" },
      { label: "RACI Matrix", href: "/raci", icon: Table2, entity: "governance" },
      { label: "Delivery Lifecycle", href: "/lifecycle", icon: Workflow, entity: "governance" },
    ],
  },
  {
    label: "Insight",
    accent: "sky",
    items: [
      { label: "Reports / Analytics", href: "/reports", icon: BarChart3, entity: "report" },
      { label: "Migration Tracker", href: "/migration", icon: Replace, entity: "report" },
      { label: "Resources", href: "/resources", icon: Users2, entity: "resource" },
      { label: "Documents", href: "/documents", icon: FileText, entity: "document" },
      { label: "Evidence Library", href: "/evidence", icon: FileText, entity: "evidence" },
    ],
  },
  {
    label: "System",
    accent: "sun",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell, entity: "notification" },
      { label: "People & Teams", href: "/people", icon: Contact, entity: "people" },
      { label: "Integrations", href: "/integrations", icon: Plug, entity: "integration" },
      { label: "Admin / Settings", href: "/admin", icon: Settings, entity: "admin" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
