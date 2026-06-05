# Stakeholder Directory & Governance Reference — Implementation Notes

## Summary

Production stakeholder directory and governance reference materials were added to the Web Transformation programme platform. `Person` remains the assignable owner FK for tasks, risks, and decisions; the new Insight tabs provide filtered directory views and ToR/glossary/reference content.

## Schema changes

**Migration:** `20260605101022_add_stakeholder_directory_and_governance_reference`

| Model / extension | Purpose |
|-------------------|---------|
| `DirectoryArea`, `DirectoryBusiness`, `DirectoryCluster` | Config-driven taxonomy (not hardcoded in UI) |
| `Person` extensions | Contact PII, area/business/cluster FKs, workstream, visibility, data owner |
| `ProgrammeRoleAssignment` | Delivery roles (Stream Lead, PO, Gatekeeper, etc.) |
| `GovernanceReferenceDoc` / `GovernanceReferenceSection` | Terms of Reference and policy sections |
| `ReferenceMapping` | Concept → field/process links |
| `GlossaryCategory.GEOGRAPHY` | Geography/site glossary rows |

## API contracts (server actions)

### Stakeholders (`src/server/actions/stakeholders.ts`)

- `createStakeholder`, `updateStakeholder` — `people.create` / `people.edit`
- `assignProgrammeRole`, `removeProgrammeRole`, `assignTeam`, `removeTeam` — `people.assign`
- `archiveStakeholder` — `people.archive` (soft via `active=false`)

All mutations use `requireEntityAction` and `writeAudit`. Contact fields are omitted from audit payloads.

### Governance reference (`src/server/actions/governance-reference.ts`)

- `upsertGlossaryTerm` — `governance.edit`
- `publishGovernanceDoc` — `governance.edit`
- `upsertReferenceMapping` — `governance.configure`

## Read services

- `getStakeholderDirectory()` — filtered query + PII redaction for `READ_ONLY_STAKEHOLDER` and `contactVisibility`
- `getGovernanceReferenceData()` — ToR doc, glossary, mappings

## UI routes (Insight sidebar)

| Tab | Route |
|-----|-------|
| Stakeholder Directory | `/stakeholder-directory` |
| Governance Reference | `/governance-reference` |

Existing `/people` under System delegates to `getStakeholderDirectorySummary()`.

## Security & privacy

- PII (`email`, `phone`, `mobile`) redacted server-side when role is `READ_ONLY_STAKEHOLDER` or `contactVisibility` is `RESTRICTED` / `NAME_ONLY`
- Server-side RBAC on all write actions via `src/lib/rbac/server-guard.ts`
- No hard delete of persons with ownership FKs — use `archiveStakeholder`

## Data maintenance

1. **Workshop source changes:** Update WorkshopPack markdown, then `npx tsx prisma/seed-governance-incremental.ts`
2. **Full reset:** `SEED_RESET=1 npm run db:seed` (destructive) includes extended seed pipeline
3. **Directory steward:** Set `Person.dataOwnerPersonId` for maintenance accountability

## Validation performed

- [x] `npm run typecheck`
- [x] `npx tsx prisma/seed-governance-incremental.ts`
- [x] `npm run lint`
- [x] `npm run db:verify` (glossary=77 after full-section seed)

## Changed files

### Schema & seed
- `prisma/schema.prisma`
- `prisma/migrations/20260605101022_add_stakeholder_directory_and_governance_reference/`
- `prisma/seed/governance-reference.ts` (new)
- `prisma/seed/fromMarkdown.ts`
- `prisma/seed-governance-incremental.ts` (new)

### Backend
- `src/lib/rbac/server-guard.ts`
- `src/lib/services/stakeholder-directory.ts`
- `src/lib/services/governance-reference.ts`
- `src/lib/services/people.ts`
- `src/lib/validation/stakeholders.ts`
- `src/lib/validation/governance-reference.ts`
- `src/server/actions/stakeholders.ts`
- `src/server/actions/governance-reference.ts`

### Frontend
- `src/lib/nav-config.ts`
- `src/app/(platform)/stakeholder-directory/*`
- `src/app/(platform)/governance-reference/*`

### Documentation
- `docs/governance/*.md`

## Assumptions

1. Workshop markdown contains few phone numbers; contact fields are populated post-go-live by authorised editors.
2. Clerk session `platformRole` remains authoritative for RBAC until DB User sync is implemented.
3. Programme role enum values are extended via migration when new evidenced roles appear.

## Completion report

Implementation is complete per plan: data model, migration, seed pipeline, server actions with validation and audit, two Insight sidebar tabs, governance documentation, and incremental seed script for safe updates on existing databases.
