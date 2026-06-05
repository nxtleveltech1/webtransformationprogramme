# Day 2 — Session 1: Delivery Model, Templates & Design Foundations

**Source:** SRC-008 (Day 2 Session 1 — Otter recording + Teams notes/summary).
Format per [Agent.md](../../Agent.md) §"Output Format Required". Mirrors the structure of [day1-session1.md](./day1-session1.md).

> **Day 2 framing:** Day 1 ended on the unresolved scope-boundary debate (migration vs transformation, ~2027 if taken at full scope). Day 2 Session 1 converted that tension into a concrete **delivery model** — a phased, audience-based rollout (Personal first) built on modular red/green-zone templates, governed publishing gates, co-located content + analytics, and DevOps quality gates. The squad/resourcing model and country/tenant model are carried into [day2-session2.md](./day2-session2.md).

---

## 1. Session metadata

| Field | Detail |
| --- | --- |
| Workshop day | Day 2 |
| Date | 3 June 2026 (compiled 4 June 2026) |
| Session | Session 1 (delivery model, templates, design foundations) |
| Location | Cape Town (in-person + Teams) |
| Facilitator | Gareth Bew |
| Scribe | Bertus Goosen |
| Speakers (identified) | Gareth Bew, Bernice, Justin, Seba (Sebastian), Rey, Kameshnee, Bertus Goosen, Nithin, Loza (referenced), Natalie (referenced); multiple numbered speakers |
| Teams represented | Programme, Design, Content & Publishing, Design System (OMDS), Execution/Engineering, Analytics/Observability, Cross Channels |
| Start / end time | `Not confirmed` (source notes reference an approx. 06:15–10:50 morning block — `Unconfirmed`) |
| Purpose | Consolidate Day 1 inputs into a "version one" roadmap; agree the delivery model, template/component approach, design-foundation targets, automation/governance and article/content handling |

### Agenda items covered
- Programme magnitude recap; "1000-piece puzzle" consolidation into a clear plan
- Handover, issue-management and escalation processes between streams
- MVP-per-stream and phased, audience-based delivery (Personal first)
- Design foundations for Personal (IA + core templates + generic content guidelines) — end-June target
- Template & component strategy: red zones / green zones; 2–3 product templates; modularity
- Template change-control and template governance (gatekeeper model)
- Article / news handling, interim styling, and consolidated article page
- Content audit & URL mapping per section (discovery deliverable)
- Content + analytics co-location in Contentstack
- DevOps quality gates, automated testing (Playwright) and linting
- Micro-drops / staggered handovers; build estimates (~2h/page)
- Documentation/master-log consolidation approach

### Agenda items not covered / carried to Session 2
- Four-squad resourcing model and capacity decision (resource-gated)
- Key-resource roll-offs (Sept/Aug) and secure-web portfolio-view dependency
- Country/tenant operating & funding model; journey-ownership gaps
- Unified Jira/tracking, leadership cadence, and workshop close/feedback

---

## 2. Detailed discussion notes (by topic)

### 2.1 From scope debate to a phased delivery model
- **Summary:** Gareth reframed Day 1's open scope boundary into a **phased, audience-based delivery**: Personal first (design foundations end-June, Personal section ~end-July), then Corporate → Business → Wealth, with Secure web sequenced alongside. The team explicitly accepted that **not all year-end goals will land** in the current window.
- **Key points:** Bertus likened Day 1's whiteboard output to a 1000-piece puzzle — all pieces present, needing consolidation into a clear plan. Day's deliverables = a "version one" roadmap, clarified critical path, responsibilities and scope. Gareth stressed converting requirements into clear outputs/artifacts and identifying stakeholders by business area/cluster per stream.
- **Programme implication:** Scope is now bounded **per phase** rather than as a single line; delivery proceeds from the ~60% of known modules, firming the rest section-by-section.
- **Decision:** **DEC-015** (phased audience-based delivery, Confirmed) — reframes DEC-001 and resolves the QST-016 tactical-vs-full tension in favour of phasing.

### 2.2 Handover, issue-management & escalation processes
- **Summary:** Gareth emphasised clear handover processes between streams (how deliverables are transferred and received) and a clear issue-management/escalation process to resolve problems efficiently and protect delivery perception.
- **Process implication:** Stream-to-stream entry/exit criteria and an escalation path are prerequisites for the parallel delivery model; reinforces the Day 1 design-handover governance work (DEC-007).

### 2.3 Design foundations for Personal (end-June)
- **Summary:** Information architecture **and** generic content guidelines for the **Personal** audience are targeted for sign-off **by end-June**, with templates then rolled out across the section. Seba confirmed the design team is driving foundations to that date.
- **Key points:** The Personal landing page and its IA must be **locked down as a priority** (a key deliverable for multiple stakeholders). The team needs to stress-test templates in additional sections and engage stakeholders to build confidence before rolling out foundational elements. Two Personal pages already done (referenced).
- **Decision / dependency:** **DEC-022** (Confirmed); **DEP-017** (foundations must complete before dev/build, end-June). Elaborates Day 1 **DEC-006**.

### 2.4 Template & component strategy — red zones / green zones
- **Summary:** The platform standardises on **modular templates** composed of **red zones** (fixed, governed structure/branding) and **green zones** (variable content). Product pages are limited to **2–3 standardised templates** with clearly defined mandatory and optional elements.
- **Key points:** Standard product-page elements consistently applied: banners, breadcrumbs, navigational links, footers, leads, cross-sell sections, FAQs. Category and product pages share the **same structure/components** (only middle content varies) but are treated as separate pages for content purposes. Templates have been **stress-tested across audiences** — Gareth noted the main challenges are with **content, not template structure**. Page templates remain flexible at component level while keeping a single structure per page type (avoid "snowflakes").
- **Confidence caveat:** Current confidence in fixing "red zones" is **limited** because only a small number of sections are complete; confidence increases as more sections are built — so the **first batch designates red zones cautiously**, expanding scope in later batches after stakeholder engagement.
- **Decision:** **DEC-017** (Confirmed). **Trade-off:** red-zone stability vs green-zone flexibility (TO-8).

### 2.5 Template change-control
- **Summary:** Any change to a **red zone after sign-off** triggers formal change management propagated across **both content and code** on every affected page.
- **Risk:** Late changes cascade in cost/effort (**RSK-025**). Establishes templates as governed assets.
- **Decision:** **DEC-018** (Confirmed).

### 2.6 Template governance & gatekeeper model
- **Summary:** Design and publishing teams act as **gatekeepers** — every page is reviewed and signed off before go-live; pages that do not meet standards are **not** published. Only trained builders publish.
- **Key points:** Today **only Gareth and Natalie build templates** — a single point of failure (**RSK-026**); any new teams/tenants must be **trained to the established standards** before publishing. Need to formalise a way of working for onboarding new tenants/teams. Align template interpretation between **Contentstack and the design system** to prevent template/Figma drift (**RSK-027**).
- **Decision:** **DEC-019** (Confirmed). Firms Day 1 **DEC-007**.

### 2.7 Article & news handling
- **Summary:** Move to a **consolidated article page**; apply an **interim background-colour variant change** (referenced as F5→F6) so article pages match the new template and minimise visual contrast during migration; treat **news as distinct from articles**.
- **Key points:** Justin explained the current article structure is **audience-based** and proposed a consolidated article page to reduce landing pages; analytics/filtering needed to prioritise content. **News** = press releases/company information, kept ~**1 calendar year**, remaining in the **footer** (linkable from sections via cards/buttons/banners). Older/low-traffic corporate & personal articles already removed per existing rules. Most article views are **mobile**, so desktop template changes have minimal impact. ~**150 article pages** will be restyled and moved (~**140 personal articles**); ~**850 pages** remain unchanged for now (August considered **too late** for the 850). **457 pages** use the modular page component.
- **Decisions:** **DEC-023** (article/news handling, Confirmed); URL structure deferred under **DEC-024**.
- **Open question:** consistent handling of articles/news/resource pages across audiences (**QST-027**).

### 2.8 Content audit & URL mapping (discovery deliverable)
- **Summary:** A **content audit + URL mapping** (existing URLs → new IA structure) per section is required as a **discovery deliverable** before switch-off/redirect decisions; it tracks which pages are added, consolidated, rewritten or removed.
- **Key points:** Bernice can begin content migration **once IA and URL mapping for a section are provided**. Analytics will be used to prioritise which of the remaining ~850 pages to migrate or remove. Final article/news **URL structure is deferred pending IA** (target end-June).
- **Decision / actions:** **DEC-024** (Deferred); **ACT-057** (map & propose consolidated URL structure), **ACT-066** (comprehensive content audit + URL mapping).

### 2.9 Content + analytics co-location
- **Summary:** Co-locate **content and analytics tagging within Contentstack** so tagging is created **with** the page — enabling automation and consistent SEO/measurement, and avoiding manual tagging later.
- **Key points:** GA + Tableau data pipelines must remain functional during migration; Loza has started building observability dashboards, with remaining work to create templates to apply across migrated sites.
- **Decision:** **DEC-020** (Confirmed). **Action:** **ACT-060**. **Risk reduced:** late analytics tagging (**RSK-011**).

### 2.10 Automation, DevOps quality gates & testing
- **Summary:** Enforce **DevOps quality gates** with **automated testing (Playwright — referenced as "Play Live")** and **linting** before production; initial rollout end-June with reporting back to teams.
- **Key points:** Need automation in template updates and content injection; validate frameworks for secure software; review/approval processes in place with access reset as needed. Engineering confidence levels and dependencies to be captured in the spreadsheet. Provide **desktop Figma output as the source of truth** for automation/Contentstack mapping.
- **Decision:** **DEC-021** (Confirmed) — firms Day 1 **DEC-009**. **Actions:** **ACT-061** (quality gates/CI-CD), **ACT-075** (Figma source-of-truth). Still constrained by Daniel's capacity (**RSK-006**).

### 2.11 Drops, handover cadence & build estimates
- **Summary:** Delivery is via **staggered "drops"** of completed templates/components, starting in the **first two weeks of June**; **multiple handovers** expected until **at least September**, with variability decreasing over time — hence the emphasis on **modular** templates.
- **Key points:** Template **structure** can be completed in ~5 days, but **component development takes longer** and depends on design-system processes; each template incl. design + sign-off ≈ **2 weeks**. Template and component development run **in parallel** (component library built without waiting for full templates). New pages can be built once technical, design and content pieces are ready — average **~2h/page** for ~**850 pages**. 100% component completion per section enables full build and stress-testing.
- **Assumptions:** ASM-013 (squad-of-two = macro section/sprint; full Personal ≈ 5 sprints), ASM-014 (~2h/page at scale), ASM-015 (~60% modules known now), ASM-016 (parallel template/component build feasible).

### 2.12 Decommissioning (sequenced by staging)
- **Summary:** Decommissioning must be factored into the plan with a **piecemeal approach based on staging**; "done" requires defining what completely switching off old sites means.
- **Decision / action:** reaffirms Day 1 **DEC-012**; **ACT-071** (Nithin to include decommissioning tasks and coordinate timing by deployment stage).

### 2.13 Documentation & master-log consolidation
- **Summary:** Working leads capture all discussed items in the project spreadsheet; multiple sources (Teams transcripts, board/sticky photos, compiled notes) feed a single comprehensive record. The working document is a **draft** to be cleaned up over the next few days, with Day 2 content still to be added; a consolidated master log combining team tabs will be created for both days.
- **Process implication:** Underpins the unified-tracking decision carried into Session 2 (**DEC-027**).

---

## 3. Decisions (this session)
See [../03_Registers/decision-log.md](../03_Registers/decision-log.md). Primary Session 1 IDs:
- **DEC-015** — Phased, audience-based delivery (Personal first) — **Confirmed**
- **DEC-017** — Modular red/green-zone templates; 2–3 product templates — **Confirmed**
- **DEC-018** — Template change-control — **Confirmed**
- **DEC-019** — Publishing governance gate / gatekeeper model — **Confirmed**
- **DEC-020** — Content + analytics co-location in Contentstack — **Confirmed**
- **DEC-021** — DevOps quality gates + Playwright + linting — **Confirmed**
- **DEC-022** — Personal design foundations by end-June — **Confirmed**
- **DEC-023** — Article & news handling (consolidated page, interim variant, news distinct) — **Confirmed**
- **DEC-024** — Defer article/news URL structure pending IA — **Deferred**
- **DEC-012** — Phased decommissioning — **reaffirmed** (carried with DEC-025 in Session 2)

Per Agent.md, only items the workshop clearly agreed are marked **Confirmed**; DEC-024 is explicitly **Deferred**.

## 4. Actions (this session)
See [../03_Registers/action-register.md](../03_Registers/action-register.md). Session 1 IDs include: **ACT-055** (populate roadmap), **ACT-056** (Personal content package, target end-July), **ACT-057** (article/site URL mapping), **ACT-058** (migrate ~140–150 Personal articles), **ACT-059** (retrofit news onto article template), **ACT-060** (content+analytics co-location), **ACT-061** (quality gates/CI-CD), **ACT-065** (finalise Personal design foundations), **ACT-066** (content audit + URL mapping), **ACT-067** (onboarding for new teams/tenants), **ACT-068** (hand over four template sections), **ACT-071** (decommissioning tasks), **ACT-075** (Figma source-of-truth), **ACT-082** (weekly template playback). Full Day 2 range is ACT-055–ACT-084.

## 5. Risks (this session)
See [../03_Registers/risk-log.md](../03_Registers/risk-log.md). Surfaced/most relevant here: **RSK-025** (template change cascade), **RSK-026** (single points of failure — only Gareth & Natalie build templates), **RSK-027** (governance/template drift, Contentstack ↔ Figma), **RSK-028** (stakeholder sign-off delays), **RSK-031** (not all year-end goals delivered), and the carried **RSK-006** (Daniel automation capacity), **RSK-011** (late analytics tagging). Full Day 2 range is RSK-023–RSK-032.

## 6. Issues (this session)
See [../03_Registers/issue-log.md](../03_Registers/issue-log.md). Day 2 live issues are **ISS-009–ISS-011** (under-resourcing; unclear journey ownership; secure-web portfolio-view) — primarily surfaced in Session 2 but underpinning the Session 1 governance/capacity discussion.

## 7. Dependencies (this session)
See [../03_Registers/dependency-log.md](../03_Registers/dependency-log.md). Session 1 IDs: **DEP-017** (Personal design foundations before dev/build, end-June), **DEP-021** (template handover cadence feeds content/build), **DEP-022** (desktop Figma source-of-truth for automation). Full Day 2 range is DEP-017–DEP-022.

## 8. Open questions (this session)
See [../03_Registers/open-questions.md](../03_Registers/open-questions.md). Session 1 IDs: **QST-025** (approvals required to accelerate template sign-off), **QST-027** (consistent articles/news/resource-page handling). Full Day 2 range is QST-020–QST-027.

## 9. Parking lot (this session)
See [../03_Registers/parking-lot.md](../03_Registers/parking-lot.md). Relevant: **PRK-011** (fund tables & Bulletin ownership), **PRK-013** (smaller-site quick nav+footer retrofit), **PRK-014** (Personal vs "personal Coetzee" content reuse). Full Day 2 range is PRK-010–PRK-015.

## 10. Clarifications required
- **Session date:** **3 June 2026** (confirmed). The "4 June" seen in some source summaries is the compilation/capture date, not the session date.
- **Start/end times:** an approx. 06:15–10:50 block is referenced in source notes but not confirmed as Session 1 boundaries — `Unconfirmed`.
- **Speaker attribution:** several contributions are recorded only as numbered speakers (e.g. "Speaker 2" for the article background-colour change) — named attribution `Unconfirmed`.
- **Colour values (F5→F6):** the article background-colour variant values appear in a source exec summary only — treat as `Unconfirmed` until design confirms.
- **"Play Live" vs Playwright:** the testing framework is transcribed as "Play Live"; interpreted as **Playwright** per the decision log — `Clarification required`.
- **Confidence level on red zones:** explicitly limited by the small number of completed sections; the first-batch red-zone set is provisional and `Open`.
