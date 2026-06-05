# Module Agent Brief — Programme Control Platform

You are one of several parallel module agents building an enterprise programme management UI.
The FOUNDATION is already built. Reuse it. Do NOT modify shared files or other agents' folders.

## Stack
- Next.js 15 App Router, React 19, TypeScript (strict), Tailwind v4, shadcn/ui (new-york).
- Prisma 6 + Neon Postgres (already migrated + seeded with REAL data).
- Recharts v3, TanStack Table v8, react-hook-form + zod v4, sonner toasts, lucide-react icons.
- Path alias `@/*` -> `src/*`. Windows host.

## Hard rules
1. Server Components fetch data via `import { prisma } from "@/lib/db"` directly (or a service in `src/lib/services/<module>.ts` that you create).
2. Mutations = Server Actions in `src/server/actions/<module>.ts` with `"use server"`. Validate with zod (schemas in `src/lib/validation/<module>.ts`), then Prisma write, then `revalidatePath(...)`, then `await writeAudit({...})` from `@/lib/audit`. Return `ActionResult` from `@/server/actions/helpers` (`ok()/fail()/parseInput()`).
3. Every list page: search/filter, sortable table, row click -> detail drawer, create/edit dialog (role-gated), empty/loading/error states.
4. Role-aware UI: wrap pages in `ViewGuard` and gate action buttons with `Can` (both from `@/components/shared/can`). Use the entity key assigned to your module.
5. No mock data. Use the seeded DB. If a list is empty, render the shared `EmptyState`.
6. Accessibility: semantic headings, labelled inputs, keyboard-usable. Status never by colour alone (use the shared badges which include text).
7. Each route folder gets a `page.tsx` (Server Component). Heavy interactivity goes in a sibling `*-client.tsx` ("use client"). Add `loading.tsx` where useful.
8. Keep imports correct and types clean — the build runs `tsc` and `next lint`.

## Shared components (import and reuse — do NOT recreate)
- UI primitives in `@/components/ui/*`: button, card, badge, input, textarea, label, select, dialog, sheet, dropdown-menu, tabs, tooltip, popover, avatar, checkbox, scroll-area, progress, switch, separator, skeleton, table, command, sonner, chart.
- `@/components/shared/page-header` -> `PageHeader`, `SectionHeader` (props: title, description, actions).
- `@/components/shared/metric-card` -> `MetricCard` (label, value, icon?, tone?, hint?, href?). tone: default|success|warning|danger|info.
- `@/components/shared/rag-indicator` -> `RagIndicator` (value: "RED"|"AMBER"|"GREEN"|null).
- `@/components/shared/status-badge` -> `StatusBadge` (status: string) — auto-maps enum values to tone.
- `@/components/shared/priority-badge` -> `PriorityBadge` (priority: string).
- `@/components/shared/data-table` -> `DataTable<TData>` (columns: ColumnDef[], data, searchPlaceholder?, onRowClick?, toolbar?, emptyTitle?, emptyDescription?). Client component using TanStack.
- `@/components/shared/detail-drawer` -> `DetailDrawer` (open, onOpenChange, title, description?, footer?, children), plus `DetailField` (label, children) and `DetailGrid`.
- `@/components/shared/confirm-dialog` -> `ConfirmDialog` (open, onOpenChange, title, description?, onConfirm, destructive?, loading?).
- `@/components/shared/states` -> `EmptyState`, `ErrorState`, `PermissionDenied`, `TableSkeleton`, `CardGridSkeleton`.
- `@/components/shared/can` -> `Can` ({action, entity, fallback?, children}) and `ViewGuard` ({entity, entityLabel?, children}).
- `@/components/shared/export-button` -> `ExportButton` (rows: Record<string,unknown>[], filename, entity).
- Chart helpers `@/components/ui/chart`: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, type `ChartConfig`. Use Recharts components inside `ChartContainer`.
- Utils `@/lib/utils`: `cn`, `formatDate`, `relativeDays`, `titleCase`, `initials`.
- Enum option lists + `riskScore(prob,impact)` in `@/lib/enums`.

## RBAC
- `@/lib/rbac/permissions` exports `EntityKey`, `PermissionAction`, `can(role,action,entity)`.
- `@/lib/rbac/role-context` exports `useRole()` -> `{ role, can(action,entity), canView(entity), label }` (client only).
- Entity keys: programme, project, workstream, task, milestone, dependency, risk, issue, decision, assumption, question, parkingLot, changeRequest, approval, resource, document, notification, report, governance, people, integration, admin.
- Actions: view, create, edit, assign, approve, reject, escalate, archive, delete, export, configure.

## Server action pattern (copy this shape)
```ts
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { ok, fail, parseInput } from "@/server/actions/helpers";
import { riskSchema } from "@/lib/validation/risks";

export async function updateRisk(input: unknown) {
  const parsed = parseInput(riskSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...data } = parsed.data;
  const risk = await prisma.risk.update({ where: { id }, data });
  await writeAudit({ entityType: "Risk", entityId: risk.id, action: "update", payload: data });
  revalidatePath("/risks");
  return ok(risk, "Risk updated");
}
```

## Prisma model reference (read prisma/schema.prisma for full detail)
- Original workshop registers use `externalId` (e.g. DEC-001), `ownerPerson`/`ownerText`, `workshopDay`, `sessionRef`, `traceRef`, `workstream` relation, `sourceDocument`.
- Decision(status: CONFIRMED/PROPOSED/DEFERRED/REJECTED/UNCLEAR), Action(status: NEW/IN_PROGRESS/BLOCKED/DONE/UNCONFIRMED/SUGGESTED/OPEN, priority), Risk(category, probability, impact, status string, ownerPerson), Issue(IssueStatus), Assumption, Dependency(DependencyStatus), OpenQuestion(QuestionStatus), ParkingLotItem.
- NEW models: Project(programme, workstream, ownerPerson, status ProjectStatus, priority, rag, deliverables, actions, risks, issues, dependencies, milestones, documents, changeRequests), Deliverable, ChangeRequest(externalId CR-xxx, status ChangeRequestStatus, approverPerson), Approval(externalId APR-xxx, entityType, status ApprovalStatus, approverPerson), Resource + ResourceAllocation(allocationPct), Document(status DocumentStatus, project), Notification(type NotificationType, read), User/Role/Permission/RolePermission/UserRole.
- Programme/Workstream/Project have `rag` (Rag enum). Milestone has workstream + project relations + varianceDays.
- Other: Person, Team, PersonTeam, StakeholderRole, GovernanceForum, Milestone, RoadmapActivity, CriticalPathStep, ExecutiveSummary, Tradeoff, CustomerJourney, GlossaryTerm, SystemPlatform, AnalysisArtifact, RaciRow.

## Deliverable
Working routes with real data, role-gated CRUD where appropriate, build-clean TypeScript. Report the files you created.
