# Programme Glossary & Definitions

**Primary source:** [WorkshopPack/01_Context/glossary.md](../../WorkshopPack/01_Context/glossary.md)  
**System of record:** `GlossaryTerm` table  
**UI:** Insight → **Glossary & Definitions** (`/glossary`) — a dedicated sidebar tab, distinct from
the Stakeholder Directory and Governance Reference.

> The Glossary is a dictionary of programme terms. It is **not** the Stakeholder Directory (a
> register of real people). Table header rows (`Term`/`Acronym`/`System`/`Area`/`Geography`) are
> filtered out during seeding and are not stored as terms.

## Categories

| Category | Examples |
|----------|----------|
| TERM | Web Transformation, Migration, Red zones / Green zones |
| ACRONYM | OMDS, RAID, MVP, SSO |
| SYSTEM | Contentstack, Figma, ServiceNow |
| PROCESS | Gatekeeper model, Template change-control |
| GEOGRAPHY | Namibia, South Sudan, Hong Kong |

Terms marked `[validate]` in the workshop source retain `REQUIRES_VALIDATION` or `INFERRED` confidence in the database.

## Maintenance

- **View:** All roles with `glossary.view`
- **Edit:** Roles with `glossary.edit` (via `src/server/actions/glossary.ts`)
- **Audit:** All create/update actions write to `AuditEvent`

When workshop glossary markdown changes, re-run:

```bash
npx tsx prisma/seed-governance-incremental.ts
```
