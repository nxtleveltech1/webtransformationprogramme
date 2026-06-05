# A. Business Process & Workflow

**Source:** SRC-001, SRC-002 (Day 1); SRC-008 (D2S1), SRC-009 (D2S2) — Day 2 re-baseline.

## End-to-end delivery lifecycle (future state)

```
Define -> Discovery -> Design -> Approval -> Handover -> Support -> Go Live
                                                                      |
                                                          (Go Live + Decommission run in parallel)
```

| Stage | Inputs | Key activities | Exit / completion criteria | Owner(s) |
| --- | --- | --- | --- | --- |
| Define | Brief, scope, problem statement | Capture brief, scope, stakeholder understanding | Scope & problem agreed before discovery | Programme/Product |
| Discovery | Analytics, research, existing content | Stakeholder engagement, SEO, copy, ecosystem review, product, compliance, brand, functional analysis, OMDS input; propose delete/retain/update | Content owner, SME, cluster, SEO, analytics identified | Design/Content |
| Design | Discovery outputs | Desktop+mobile design, copy readiness, SEO readiness, DS/technical review, testing, functional analysis | Copy ready, SEO ready, image standards known, content model confirmed, hardcoded content flagged | Design/OMDS |
| Approval | Designs, content | Route through Group Marketing, internal/external stakeholders, clusters | Business, brand, compliance, cluster, DS approvals complete | Group Marketing/Approvers |
| Handover | Approved design + content pack | Package design-ready, DS approval, final copy, SEO input, sign-offs, build rules | Content pack + URL mapping + rules + sign-offs provided | Design → DS/Web Dev/Publish |
| Support | Built pages | Continuous QA, updates, sign-offs, SEO sign-off, copy/DS validation | QA, redirects, switch-off criteria, validations complete | QA/Support |
| Go Live | Acceptance criteria met | Cutover; simultaneous legacy decommission | Design+content+DS+SEO+build+publishing+support acceptance satisfied | Programme/Execution |

## Current-state pain points
- Publishing is the second-last step, blocked by upstream design/dev/content readiness, asset sign-off, approved URLs.
- BAU (daily/monthly/campaign updates) competes heavily with migration (85 tickets/5 days reference).
- Manual page-by-page tracking in a Google Sheet; no reliable total page count.
- Dual maintenance of current + QA branches during migration (manual dual updates for product/fee changes).
- No centralised/shared knowledge system → delays and lost history.
- Only OMF submits structured design briefs using platform components; others submit unstructured requests.

## Publishing micro-workflow
```
Dev complete (Contentstack) + content/assets/URLs signed off
   -> Build page in Beta (new template ~2h | as-is ~30min)
   -> Track in publishing spreadsheet
   -> Testing (only once ALL pages built in Beta)
   -> Cutover / Go Live
   -> Decommission legacy + redirects
```

## Handoffs, control points & gates
- **Entry/exit gates** required between functions — work transfers only when "ready" (DEC-007).
- **Approval gate:** new templates/sections need approval before bundling/publishing.
- **Desk check:** BAs + designers validate against approved designs before QA.
- **Content gates:** Discovery → Design → Approval → Handover → Support/Go-Live (see content-governance in SRC-002).
- **Switch-off control:** legacy page switch-off tied to URL audit + content sign-off + QA evidence + SEO validation + business approval.

## Automation opportunities
- AI-assisted page creation in Contentstack (feasibility TBD — ASM-006).
- Automation harness + repeatable automated tests + pipeline enforcement.
- Analytics tracking embedded in CMS content (reduce developer reliance).
- Figma→Contentstack→code component name mapping + design-system tagging to enable automation/metadata matching (ACT-047).

## Decommissioning approach (S2/S3)
- **Phased decommissioning** (DEC-012): turn off legacy components as each is migrated, rather than a single end-of-programme switch-off. Process, approval and sequencing to be defined (ACT-040-series); must respect redirect/switch-off controls.

## Design-phase governance exception (S2/S3)
- **Design-skip allowance** (DEC-014): some teams may implement directly without the full design phase, based on dependencies. Needs documented criteria and guardrails to avoid design drift (RSK-012).

## Bottlenecks / rework loops
- Publishing capacity (RSK-002); approval bottlenecks (RSK-007); late content/SEO readiness causing post-build rework (RSK-009/016); component build backlog (RSK-008).

---

# Day 2 re-baseline / update (SRC-008 D2S1, SRC-009 D2S2)

> The Day 1 lifecycle above (Define → Discovery → Design → Approval → Handover → Support → Go Live) remains valid as the macro lifecycle. Day 2 made it **operational**: it defined the concrete delivery *pipeline* used to produce and ship pages, the article/news handling workflow, and the per-section content-audit + URL-mapping step. The detail below supersedes nothing in Day 1 — it instantiates it.

## A1. New delivery pipeline (future-state, instantiated)

Day 2 confirmed an end-to-end pipeline driven by the **modular red/green-zone template system** (DEC-017) and governed publishing gate (DEC-019):

```
Design foundations (Personal IA + core templates + content guidelines)   [DEC-022; end-June]
        |
        v
Template build  --> red zones (fixed/governed)  +  green zones (variable)  [DEC-017]
        |   (2-3 standardised product templates; ~2 weeks per template incl. sign-off)
        v
Content package (content + QA, e.g. Personal)                            [ACT-056; DEP-021]
        |
        v
Publishing (governed gate)  --> design & publishing teams sign off every page  [DEC-019]
        |                       only trained builders publish; tenants onboarded to standards
        v
DevOps quality gates --> Playwright automated tests + linting + CI/CD checks  [DEC-021; ACT-061]
        |                  (block changes reaching prod without coverage; report to teams)
        v
Go-live  (+ phased decommission of legacy as migrated)                   [DEC-012; ACT-071]
```

- **Template build → content → publish handover cadence:** drops roughly every two weeks feed content creation and parallel builds (DEP-021). Template + component development run **in parallel** (the component library is built without waiting for full templates — ASM-016).
- **Red/green zones (DEC-017):** red zones are fixed/governed structure & branding; green zones carry variable content. Product pages limited to **2–3 standardised templates** with mandatory and optional elements. ~60% of modules are known and buildable now; the rest firm up section-by-section (ASM-015). Confidence in which components are "red" increases as more sections are built (currently limited — flagged as an open process item).
- **Change-control (DEC-018):** any post-sign-off change to a red zone triggers formal change management propagated across **both content and code** on every affected page (cascade-cost risk RSK-025).
- **Publishing gate (DEC-019):** acts as the control point — every page reviewed/signed off before go-live; pages not meeting standards are not published. Gatekeepers: design + publishing teams (Natalie/Bernice). Firms the Day 1 entry/exit-gate intent (DEC-007).
- **DevOps quality gates (DEC-021):** Playwright automated testing + linting + CI/CD quality gates before production; initial rollout end-June with reporting back to teams (ACT-061). Confirms Day 1 DEC-009. Pen-test/security-review integration into releases remains **unresolved / open** (RSK-022, ACT-072) — flagged.

## A2. Article & news handling workflow (DEC-023, DEC-024)

- **Consolidated article page:** collapse audience-specific article landing pages into a single consolidated article page type to reduce landing-page proliferation (Justin); filtering/analytics used to prioritise content (Kameshnee).
- **Interim styling step:** apply a background-colour **variant change** on new screens/pages to resolve contrast and minimise visual contrast during migration **before** articles are moved/published (ACT-058). Most article views are mobile, so desktop template changes have minimal impact.
- **News treated as distinct from articles:** news = press releases/company info; retained ~1 calendar year; **stays in the footer** (linkable from sections via cards/buttons/banners). News is **retrofitted onto the article template** and migrated (ACT-059, committed for June).
- **Volume:** ~140–150 Personal article pages migrate once URL structure is defined and packages delivered (ACT-058); ~850 remaining pages held/triaged (August considered too late for the 850).
- **URL structure DEFERRED (DEC-024):** final article/news URL structure (e.g. `/articles`, news-vs-articles rules) is **deferred pending IA completion** (target end-June) — open item flagged. Migration and internal-link updates wait on this (ACT-057).

## A3. Content audit + URL mapping per section (ACT-066, DEC-024)

A per-section **content audit + URL mapping** is now an explicit **discovery deliverable** (not publishing admin):

```
Per section:  inventory existing pages  ->  map current URL -> new IA/URL
              tag each page: add / consolidate / rewrite / remove
              use analytics (GA) to prioritise which of ~850 pages migrate vs retire
              -> feeds redirect & legacy switch-off decisions (DEP-005)
```

- Bernice can begin content migration for a section **once IA + URL mapping for that section are provided** (control point / handoff).
- 457 pages use the modular page component; metadata + URL breakdowns required for records.
- Country teams must run the **same** audit: map existing content to new audience groupings, then rewrite/create for new page structures (DEC-025); SA-first, then roll out learnings to other countries (OMAR first).

## A4. Process control points & gates (Day 2 net-new)

| Control point | Gate / criterion | Owner | Ref |
| --- | --- | --- | --- |
| Design foundations sign-off | Personal IA + core templates + content guidelines locked | Design (Seba/Justin) | DEC-022, DEP-017 |
| Template red-zone designation | Red zones agreed per batch; change-control armed | Design/Dev (Seba/Rey) | DEC-017/018 |
| Publishing gate | Every page signed off pre-go-live; trained builders only | Publishing (Natalie/Bernice) | DEC-019 |
| DevOps quality gate | Playwright + linting + coverage pass before prod | Execution (Daniel) | DEC-021 |
| URL/switch-off control | Content audit + URL mapping complete per section | IA/Content (Justin/Bernice/Natalie) | DEC-024, ACT-066 |

## A5. Open / unresolved process items (flagged)
- Pen-test / security-review integration into the release pipeline — **unresolved** (RSK-022, ACT-072).
- Process for **increasing red-zone stability** needs more stakeholder engagement; **not finalised** (links DEC-017).
- Handling of articles/news/**resource** pages consistently across audiences — partially resolved by DEC-023 but cross-audience treatment still open (QST-027).
- Ownership of cross-functional/legacy journeys needs further discussion (ISS-010).
- Optimal cadence/format for ongoing planning sessions still undecided (QST-026).
