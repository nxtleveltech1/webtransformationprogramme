# D. Technical & Systems

**Source:** SRC-001, SRC-002 (Day 1); SRC-008 (D2S1), SRC-009 (D2S2) — Day 2 re-baseline. Items marked `Technical clarification required` where unclear.

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

---

# Day 2 re-baseline / update (SRC-008 D2S1, SRC-009 D2S2)

> Day 2 firmed several Day 1 technical proposals into **confirmed architecture decisions**: the red/green-zone modular template model, content+analytics co-location in Contentstack, DevOps quality gates with Playwright, and Figma desktop output as the automation source of truth. The Day 1 systems table and clarifications remain valid; the items below add the Day 2 detail.

## D1. Red/green-zone modular templates (DEC-017) — CONFIRMED

- **Model:** modular templates composed of **red zones** (fixed, governed structure & branding) and **green zones** (variable content). The Day 1 "red/green" concept is now a confirmed decision.
- **Standardisation:** limit product pages to **2–3 standardised product templates** with clearly defined **mandatory and optional** elements; single template structure per similar page type with component-level customisation.
- **Standard product-page elements (stated):** banners, breadcrumbs, navigational links, footers, leads, cross-sell sections, FAQs — consistently applied.
- **Category vs product pages:** same structure/components, only the middle content varies; treated as separate pages for content purposes.
- **Modular template** is the foundation for **both product detail and category pages** (consistency + governance).
- **Confidence:** ~60% of modules known/buildable now (ASM-015); red-zone confidence currently **limited** (few sections completed) and increases batch-by-batch — `flagged as maturing`.
- **Change cascade:** red-zone changes after sign-off propagate across content + code on all affected pages (DEC-018, RSK-025).

## D2. Content + analytics co-location in Contentstack (DEC-020) — CONFIRMED

- **Co-locate content and analytics tagging within Contentstack** so analytics tags are captured **with the content** at authoring time — avoids manual tagging later and enables automation + SEO (ACT-060; Rey/Nithin).
- Analytics tracking fields embedded in CMS components (continues Day 1 ACT-051).
- **Analytics pipeline continuity:** Google Analytics + **Tableau** integration addressed to keep data pipelines functional during migration; Loza has started **observability dashboards** (continues Grafana/Dynatrace from Day 1).
- Co-location is a precondition for SEO/analytics work and is gated by the desktop Figma source of truth (DEP-022).

## D3. DevOps quality gates + Playwright + linting (DEC-021) — CONFIRMED (firms DEC-009)

- **DevOps quality gates** + **automated testing using Playwright** + **linting** + CI/CD checks before production; block changes reaching prod without required coverage (ACT-061; Gareth/Daniel).
- Initial rollout **end-June** with **reporting back to teams**; set up build-pipeline approach for new vs existing builds so teams get visibility and can remediate.
- Validate frameworks for secure software; review/approval processes with access reset as needed.
- **Constraint:** Daniel's limited capacity (RSK-006). **Open:** pen-test/security-review integration into releases **unresolved** (RSK-022, ACT-072, DEP-019) — `Technical clarification / security clarification required`.

## D4. Figma desktop output as source of truth (DEP-022, ACT-075)

- Provide the **desktop Figma output for new pages** as the **source of truth for automation**; tag Figma → Contentstack → code (continues Day 1 ACT-047).
- Required for automation + Contentstack mapping; prevents **template drift** between content stack and design system (governance risk RSK-027).
- Most article views are mobile, so **desktop** template changes have minimal traffic impact (informs the desktop-first source-of-truth choice).

## D5. Secure-web portfolio view (RSK-030, DEP-020, ISS-011)

- Secure-web **portfolio view** technical requirements are **unclear** and needed **before the ~Sept roll-off** for the migration team — `Technical clarification required` (QST-024).
- Blocks secure-web migration planning (ISS-011); aggravated by key-resource roll-off (RSK-023). Owner: Tebogo / Secure Web.

## D6. Day 2 systems / platform additions
| System / element | Day 2 note | Ref |
| --- | --- | --- |
| Contentstack | Now also the home for **co-located analytics tagging**; template interpretation aligned to DS to prevent drift | DEC-020, RSK-027 |
| Playwright | Confirmed automated-testing framework in the DevOps quality gate | DEC-021 |
| Figma (desktop) | Confirmed **source of truth** for automation/metadata mapping | DEP-022 |
| Tableau / GA / Grafana / Dynatrace | Pipeline continuity during migration; observability dashboards started (Loza) | DEC-020 |
| Article/news templates | Consolidated article page; news retrofitted onto article template | DEC-023 |

## D7. Day 2 technical risks / open items
- Red-zone change cascade across content + code (RSK-025).
- Governance/template **drift** between Contentstack ↔ Figma and across new tenants (RSK-027).
- Pen-test/security gating into releases **unresolved** (RSK-022).
- Secure-web portfolio-view scope unknown before roll-off (RSK-030).
- Article/news **URL structure deferred** pending IA → redirect/switch-off decisions blocked (DEC-024, DEP-005).
