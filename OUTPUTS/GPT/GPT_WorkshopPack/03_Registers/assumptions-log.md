# Assumptions Log (ASM)

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001, SRC-002 (Day 1). Assumptions implied by Day 1 discussion that require validation.

| ID | Assumption | Area impacted | Owner to validate | Validation required | Risk if wrong | Reference |
| --- | --- | --- | --- | --- | --- | --- |
| ASM-001 | End-November deadline is fixed and achievable within current/escalated capacity | Programme/Timeline | Programme/Sponsor | Confirm scope vs capacity vs date trade-off | Deadline missed or scope/quality cut | SRC-001 |
| ASM-002 | All content must be moved because the old platform must be decommissioned (Definition of Done) | Execution/Scope | Programme/Execution | Confirm full vs selective migration scope | Over-migration of low-value pages; wasted effort | SRC-002 |
| ASM-003 | New-template page ≈ 2h and as-is page ≈ 30min hold at scale | Publishing/Capacity | Publishing | Validate against real throughput + remediation (hardcoded content) | Capacity model & timeline invalid | SRC-001/002 |
| ASM-004 | "As-is" means minimal change (not V2 with new nav/footer) | Design/Publishing | Design/Programme | Formally define as-is (ACT-004) | Estimates, testing & decommission scope wrong | SRC-002 |
| ASM-005 | Interim brand is sufficient to proceed with build pending full CI | Design/Brand | Brand/Group Marketing | Confirm approval level + exception route | Rework if CI changes after build | SRC-001 |
| ASM-006 | AI-assisted page creation in Contentstack is feasible and will reduce per-page effort | Execution/Automation | Execution (Daniel) | Feasibility spike | Capacity assumptions optimistic | SRC-001 |
| ASM-007 | Default platform analytics dashboard is sufficient for migrated sites without Dynatrace licence | Analytics | Execution/Analytics | Confirm coverage vs requirements | Monitoring gaps post-migration | SRC-001 |
| ASM-008 | Web Platform team will absorb Cross Channels front-end work after PI2 | Resourcing | Programme/Web Platform | Confirm capacity & prioritisation model | Delivery velocity drop post-PI2 | SRC-002 |
| ASM-009 | Most country sites have simple navigation (except Kenya) and can migrate as-is with minimal updates | Regional/Scope | Regional | Validate per-country complexity | Underestimated regional effort | SRC-001 |
| ASM-010 | A reduced/tactical scope (e.g. navigation-only) can deliver meaningful value within the 5-6 month window | Programme/Scope | Programme/Sponsor | Validate via options + gap analysis (ACT-028) | If false, deadline unachievable at any useful scope | SRC-006 |
| ASM-011 | Phased decommissioning can run safely alongside migration without breaking live journeys | Execution/Ops | Programme/Execution | Validate sequencing + redirect/switch-off controls | Broken journeys / premature switch-off | SRC-005/006 |

---
> Add Day 2 assumptions as ASM-012+.
