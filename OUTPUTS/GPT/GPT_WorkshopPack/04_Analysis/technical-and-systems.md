# D. Technical & Systems

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001, SRC-002 (Day 1). Items marked `Technical clarification required` where unclear.

## Systems & platforms
| System | Role | Notes |
| --- | --- | --- |
| Contentstack | New-world CMS/platform | Publishing blocked until dev complete; most components not yet present → build/map |
| V2 templates | New page templates | Product pages get V2; as-is pages minimal change |
| Figma | Design source | Audit required (existing/unused/reusable/to-build) |
| Dynatrace | Observability | Reconfigure for browser + server-side post-migration |
| Grafana | Dashboards | Observability dashboards |
| Google Analytics | Web analytics | Doesn't track LLM-search; distinguish from new tracking |
| Glassbox | CX monitoring | To be replaced |
| Tableau | Reporting | Potential country reporting integration |
| ServiceNow | ITSM | Updates required for go-live |
| LLM search (ChatGPT/Copilot) | New visibility channel | Not tracked by GA — new SEO/analytics need |

## Architecture & environments
- Environment sequence: Contentstack → Beta/Staging → Production → Live Testing → Tooling.
- Beta must support parallel/staging validation of navigation, taxonomy, APIs, tooling, DS components.
- Environment strategy & ownership undefined (ACT-009, RSK-010).
- Secure sites run in **separate environments** from main infrastructure; manage public↔secure transitions.
- SSO exists across secure web apps with per-app nuances; need consistent navigation/UX.
- SSO requirements for new-world architecture to confirm; "web secure" vs "secure web" distinction `Technical clarification required`.

## Components & templates
- Most designer components/compositions don't exist in Contentstack → audit + build (RSK-008, ACT-008).
- Template model: red zones (strict) + green zones (modular); decide DS components vs "snowflakes".
- Single desktop image field today (responsive scaling); add **mobile image field** when building new components.
- Asset library referenced by ID; potential move to centralised repository (PRK-005).
- Hardcoded content must be identified & remediated (not replicated).
- New/enhanced components may expand site scope → component impact register (ACT-007).

## Data, URLs & SEO (technical)
- URL audit: every page except home gets a new URL → redirect each; deleted pages also need redirects; prune outdated redirects (SEO).
- URL audit is a migration **control**, not publishing admin (DEP-005).
- Paid Ads URL requirements from Group Marketing needed early (DEP-012).
- Analytics: embed tracking in CMS content; set event tracking/baselines upfront when building components; avoid GA duplication.

## Testing, DevOps & observability
- Automated testing harness + AI-assisted dev + pipeline/quality-gate enforcement + code scanning (DEC-009).
- Desk check (BA + designer) before QA.
- Release governance: criteria to allow/block releases when issues found (to define).
- Observability requirements (Dynatrace browser+server, Grafana, analytics tagging) to define (ACT-011).

## Non-functional requirements (stated)
- Availability target + page load < 3 seconds.
- Security: public pages + application-layer concerns; secure links; avoid reliance on redirects for navigation; manual hyperlink review for best practice.

## Security & go-live technical readiness (S2/S3)
- **Penetration test / crowdsource testing** before go-live — confirmation required from security team (DEP-015, RSK-022).
- **ServiceNow API updates** + QA/security/marketing approvals required before production deployment (DEP-016).
- **~95% of URLs changing** → impacts e-commerce campaigns and GA tracking; notify e-commerce (Nthabi) so exec reporting isn't broken (RSK-021, ACT-046).
- **Phased decommissioning** of legacy components as migrated (DEC-012) — sequence with redirects/switch-off.
- **Figma↔Contentstack↔code mapping** of component names for automation/metadata (ACT-047).

## Technical risks
RSK-004 (URLs/redirects), RSK-008 (components), RSK-010 (environments), RSK-011 (observability timing), RSK-012 (component sprawl), RSK-014 (secure web), RSK-021 (URL change/tracking), RSK-022 (security/ServiceNow readiness).

## Technical clarifications required
- "web secure" vs "secure web" definition; SSO scope for new world.
- DS Build vs Platform Build boundary & acceptance criteria.
- Image repository/aspect-ratio standards.
- Feasibility of AI page creation in Contentstack.
