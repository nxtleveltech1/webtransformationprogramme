# Reference Map — Concepts to Data Fields & Processes

**System of record:** `ReferenceMapping` table  
**UI:** Insight → Governance Reference → **Reference Map** tab (one of two inner tabs alongside
Terms of Reference). Glossary cross-links in this tab navigate to the dedicated
**Glossary & Definitions** tab at `/glossary`.

## Purpose

Links programme concepts, glossary terms, schema fields, and operational processes so agents and stewards share a single vocabulary.

## Seeded mappings

| Concept key | Label | Entity | Field | Process |
|-------------|-------|--------|-------|---------|
| `person.owner` | Task / action owner | Action | `ownerPersonId` | Task allocation |
| `stakeholder.role` | Stakeholder role (RACI) | StakeholderRole | `roleType` | Governance & RACI |
| `programme.role` | Programme role | ProgrammeRoleAssignment | `roleType` | Stakeholder directory |
| `gatekeeper.model` | Gatekeeper model | GovernanceReferenceDoc | — | Publishing gate |
| `directory.area` | Directory area | Person | `areaId` | Stakeholder directory |
| `directory.cluster` | Audience cluster | Person | `clusterId` | Template sign-off |
| `directory.business` | Business area | Person | `businessId` | Stakeholder directory |
| `contact.visibility` | Contact visibility | Person | `contactVisibility` | PII access control |

## Extending mappings

Use server action `upsertReferenceMapping` (requires `governance.configure`). Link optional `glossaryTermId` and `relatedDocSectionId` for cross-navigation in the UI.
