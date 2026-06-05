# Stakeholder Directory & Governance Reference — Implementation Notes

## Summary

Production stakeholder directory and governance reference materials were added to the Web Transformation programme platform. `Person` remains the assignable owner FK for tasks, risks, and decisions; the new Insight tabs provide filtered directory views and ToR/glossary/reference content.

## Schema changes

**Migrations:**
- `20260605101022_add_stakeholder_directory_and_governance_reference`
- `20260605110320_add_person_kind` — adds `PersonKind` enum + `Person.kind` (default `PERSON`) + `@@index([kind])`

| Model / extension | Purpose |
|-------------------|---------|
| `DirectoryArea`, `DirectoryBusiness`, `DirectoryCluster` | Config-driven taxonomy (not hardcoded in UI) |
| `Person` extensions | Contact PII, area/business/cluster FKs, workstream, visibility, data owner |
| `Person.kind` (`PERSON` \| `GROUP`) | Separates real individuals from groups/functions; only `PERSON` rows appear in the directory and owner pickers |
| `ProgrammeRoleAssignment` | Delivery roles (Stream Lead, PO, Gatekeeper, etc.) |
| `GovernanceReferenceDoc` / `GovernanceReferenceSection` | Terms of Reference and policy sections |
| `ReferenceMapping` | Concept → field/process links |
| `GlossaryCategory.GEOGRAPHY` | Geography/site glossary rows |

## Directory vs Glossary — data quality

The Stakeholder Directory and the Glossary are **distinct**: the directory is a contact
register of real people; the glossary is a dictionary of terms. Early seeding conflated them
because `getOrCreatePerson()` minted a `Person` for almost any owner token, polluting the table
with 78 rows (groups like `Business`/`Comms`, parser fragments like `Design (Seba`, and
duplicates like `Gareth`/`Gareth Bew`).

Root cause and fix:

- **Single source of truth:** `prisma/seed/people-canonical.ts` (`CANONICAL_PEOPLE`, alias map,
  `NON_PERSON_TOKENS`, `resolveCanonical()`) is shared by the seeder and the correction script.
- **Seeding hardened:** `getOrCreatePerson()` now resolves to a canonical person or returns
  `null` (owners fall back to `ownerText`); no junk people are ever minted, and rows are stamped
  `kind = PERSON`.
- **Glossary header filtering:** `seedGlossaryAllSections()` skips header rows
  (`Term`/`Acronym`/`System`/`Area`/`Geography`) and empty rows; the legacy `seedGlossary()` that
  leaked `Area`/`System`/`Acronym` was removed.
- **One-time correction:** `prisma/fix-directory-data.ts` deduped/merged people with full FK
  re-pointing, reclassified groups as `kind = GROUP`, hid unresolved leftovers (or deleted
  unreferenced ones), and removed the 3 leaked glossary rows.

Result: **78 → 32 real people** (`kind = PERSON`), 25 `GROUP` rows retained for owner/audit
integrity (hidden from the directory), and a glossary with no header rows.

## API contracts (server actions)

### Stakeholders (`src/server/actions/stakeholders.ts`)

- `createStakeholder`, `updateStakeholder` — `people.create` / `people.edit`
- `assignProgrammeRole`, `removeProgrammeRole`, `assignTeam`, `removeTeam` — `people.assign`
- `archiveStakeholder` — `people.archive` (soft via `active=false`)

All mutations use `requireEntityAction` and `writeAudit`. Contact fields are omitted from audit payloads.

### Governance reference (`src/server/actions/governance-reference.ts`)

- `publishGovernanceDoc` — `governance.edit`
- `upsertReferenceMapping` — `governance.configure`

### Glossary (`src/server/actions/glossary.ts`)

- `upsertGlossaryTerm` — `glossary.edit` (moved out of the governance-reference action)

## Read services

- `getStakeholderDirectory()` — filtered to `kind = PERSON`, with PII redaction for `READ_ONLY_STAKEHOLDER` and `contactVisibility`
- `getGovernanceReferenceData()` — ToR doc + reference mappings (no longer fetches glossary)
- `getGlossaryData()` — glossary terms + category/confidence summary (`src/lib/services/glossary.ts`)

Owner/lead pickers (`tasks`, `registers`, `programme`, `approvals`, `change-control`, `documents`
services) also filter to `kind = PERSON` so groups are never selectable as owners.

## UI routes (Insight sidebar)

| Tab | Route | Content |
|-----|-------|---------|
| Stakeholder Directory | `/stakeholder-directory` | Real people only (`kind = PERSON`) |
| Governance Reference | `/governance-reference` | Terms of Reference + Reference Map (2 inner tabs) |
| Glossary & Definitions | `/glossary` | Dedicated glossary tab (`glossary` EntityKey) |

Existing `/people` under System delegates to `getStakeholderDirectorySummary()` and inherits the
clean `kind = PERSON` set.

## Security & privacy

- PII (`email`, `phone`, `mobile`) redacted server-side when role is `READ_ONLY_STAKEHOLDER` or `contactVisibility` is `RESTRICTED` / `NAME_ONLY`
- Server-side RBAC on all write actions via `src/lib/rbac/server-guard.ts`
- No hard delete of persons with ownership FKs — use `archiveStakeholder`

## Data maintenance

1. **New real person?** Add them to `CANONICAL_PEOPLE` in `prisma/seed/people-canonical.ts`
   (with any first-name/alias). Anything not in that allowlist is treated as a group/fragment and
   will not be minted.
2. **Workshop source changes:** Update WorkshopPack markdown, then `npx tsx prisma/seed-governance-incremental.ts`
3. **Re-run correction (idempotent):** `npx tsx prisma/fix-directory-data.ts --dry-run` to preview
   (transaction rolls back), then `npx tsx prisma/fix-directory-data.ts` to apply.
4. **Full reset:** `SEED_RESET=1 npm run db:seed` (destructive) includes extended seed pipeline
5. **Directory steward:** Set `Person.dataOwnerPersonId` for maintenance accountability

## Validation performed

- [x] `npm run typecheck`
- [x] `npx prisma migrate deploy` (applied `add_person_kind`)
- [x] `npx tsx prisma/fix-directory-data.ts` — 78 → 32 `PERSON`, 25 `GROUP`, 3 leaked glossary rows removed
- [x] DB checks: 0 fragment surnames, 0 duplicate display names, 0 leaked glossary rows

## Changed files

### Schema & seed
- `prisma/schema.prisma`
- `prisma/migrations/20260605101022_add_stakeholder_directory_and_governance_reference/`
- `prisma/migrations/20260605110320_add_person_kind/`
- `prisma/seed/people-canonical.ts` (new — canonical source of truth)
- `prisma/seed/governance-reference.ts`
- `prisma/seed/utils.ts` (canonical-resolving `getOrCreatePerson`)
- `prisma/seed/fromMarkdown.ts` (legacy `seedGlossary` removed)
- `prisma/seed-governance-incremental.ts`
- `prisma/fix-directory-data.ts` (new — one-time idempotent correction)

### Backend
- `src/lib/rbac/server-guard.ts`
- `src/lib/rbac/permissions.ts` (`glossary` EntityKey)
- `src/lib/services/stakeholder-directory.ts` (`kind = PERSON` filter)
- `src/lib/services/governance-reference.ts` (ToR + mappings only)
- `src/lib/services/glossary.ts` (new)
- `src/lib/services/people.ts`
- `src/lib/services/{tasks,registers,programme,approvals,change-control,documents}.ts` (owner pickers filter `kind = PERSON`)
- `src/server/actions/stakeholders.ts`
- `src/server/actions/governance-reference.ts`
- `src/server/actions/glossary.ts` (new)

### Frontend
- `src/lib/nav-config.ts` (3 Insight tabs)
- `src/app/(platform)/stakeholder-directory/*`
- `src/app/(platform)/governance-reference/*` (2 inner tabs)
- `src/app/(platform)/glossary/*` (new)

### Documentation
- `docs/governance/*.md`

## Assumptions

1. Workshop markdown contains few phone numbers; contact fields are populated post-go-live by authorised editors.
2. Clerk session `platformRole` remains authoritative for RBAC until DB User sync is implemented.
3. Programme role enum values are extended via migration when new evidenced roles appear.

## Completion report

Implementation is complete per plan: data model, migrations (incl. `Person.kind`), hardened seed
pipeline with a canonical source of truth, an idempotent FK-safe data-correction script, server
actions with validation and audit, three Insight sidebar tabs (Stakeholder Directory, Governance
Reference, Glossary & Definitions), and governance documentation. The Stakeholder Directory and
Glossary are now cleanly separated: 32 real, deduplicated people vs a header-free glossary.
