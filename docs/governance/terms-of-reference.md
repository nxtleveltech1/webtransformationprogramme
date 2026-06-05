# Web Transformation Programme — Terms of Reference

**Status:** Published (seeded from `WorkshopPack/04_Analysis/stakeholder-and-governance.md`)  
**System of record:** `GovernanceReferenceDoc` slug `programme-terms-of-reference` in the application database.  
**UI:** Insight → Governance Reference → Terms of Reference tab.

## Purpose

Establish programme-wide governance for stakeholder identification, approval routing, sign-offs, forums, escalation, and communications. This document is the human-readable companion to the database ToR sections.

## Scope

- Key stakeholders and groups
- Approval routing (design/content)
- Required sign-offs
- Governance forums to establish
- Escalation route
- Leadership decisions requiring approval
- Communication requirements
- Day 2 re-baseline: template sign-off, gatekeeper model, tenant funding, bank ownership, leadership cadence

## Ownership & maintenance

| Role | Responsibility |
|------|----------------|
| Programme Director / SUPER_ADMIN | Publish ToR versions, approve structural changes |
| Directory data owner (`Person.dataOwnerPersonId`) | Maintain stakeholder contact accuracy |
| All signed-in users | View published ToR (governance.view) |

## Change control

1. Draft updates in the database (`GovernanceReferenceDoc.status = DRAFT`).
2. Programme Director reviews sections.
3. Publish via server action `publishGovernanceDoc` (audited).
4. Export or reconcile with WorkshopPack source markdown when workshop content changes.

## Source traceability

- SRC-001, SRC-002 (Day 1)
- SRC-008 (Day 2 Session 1), SRC-009 (Day 2 Session 2)
