# Programme Glossary & Definitions

**Primary source:** [WorkshopPack/01_Context/glossary.md](../../WorkshopPack/01_Context/glossary.md)  
**System of record:** `GlossaryTerm` table  
**UI:** Insight → Governance Reference → Glossary & Definitions tab

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

- **View:** All roles with `governance.view`
- **Edit:** Roles with `governance.edit` (Programme Director, SUPER_ADMIN, etc.)
- **Audit:** All create/update actions write to `AuditEvent`

When workshop glossary markdown changes, re-run:

```bash
npx tsx prisma/seed-governance-incremental.ts
```
