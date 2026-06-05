# Decision Log (DEC)

**Source:** SRC-001 (Teams "Decisions" list), SRC-002 (whiteboard synthesis) — Day 1; SRC-008 (Day 2 Session 1), SRC-009 (Day 2 Session 2).
Per Agent.md: only **Confirmed** where the workshop clearly agreed; otherwise **Proposed / Deferred / Unclear**.

> **Day 2 re-baseline (2026-06-04):** The programme moved from the Day 1 scope-boundary debate into a concrete **delivery model**: a phased, audience-based rollout (Personal first) using a modular red/green-zone template system, governed publishing gates, and (resource-permitting) four parallel squads. Several Day 1 "Proposed" decisions are now firmed by Day 2 decisions DEC-015–DEC-028; supersession notes are recorded inline and in [reconciliation-log.md](../05_Executive/reconciliation-log.md). Day 2 IDs reuse in the source docs were **not** adopted — entries continue the pack sequence.

## Quick reference

| ID | Decision | Status | Owner | Session |
| --- | --- | --- | --- | --- |
| DEC-001 | Define web transformation scope (migration / uplift / decommission) | Proposed (unresolved boundary) | Programme (GB) | D1S1 |
| DEC-002 | Set platform & customer success metrics | Confirmed | GB / Programme | D1S1 |
| DEC-003 | MVP = new navigation (4 audiences) + secure web IA | Confirmed | GB / Product | D1S1 |
| DEC-004 | Identify & communicate migration dependencies (OMA, rewards, site owners) | Confirmed (intent) | Programme | D1S1 |
| DEC-005 | Run per-workstream whiteboard exercise → consolidate into programme plan | Confirmed | GB | D1S1 |
| DEC-006 | Establish design foundations (IA, navigation, templates, content standards) | Confirmed | Design / OMDS | D1S1 |
| DEC-007 | Define governance & approval for design handover (entry/exit gates) | Proposed | Design / Programme | D1S1 |
| DEC-008 | Product pages → new templates; other pages move as-is / restyle | Proposed | Design / Execution | D1S1 |
| DEC-009 | Implement automated testing & DevOps pipeline enforcement | Proposed | Execution | D1S1 |
| DEC-010 | Assign dedicated migration publisher; ring-fence from BAU | Proposed | Publishing / Programme | D1S1 |
| DEC-011 | Engage SEO team ≥2 months before QA for tagging & validation | Confirmed (intent) | SEO / Programme | D1S1 |
| DEC-012 | Phased decommissioning — turn off legacy components as migrated (not all at end) | Proposed | Programme/Execution | D1S2/3 |
| DEC-013 | Treat Faoli Bank as a separate brand/entity with its own IA & governance | Proposed | Programme | D1S2/3 |
| DEC-014 | Allow some teams to skip the design phase and implement directly (dependency-based) | Proposed | Programme/Design (GB/Brent) | D1S2/3 |
| DEC-015 | Phased, audience-based delivery — Personal first (foundations end-June, section ~end-July), then Corporate → Business → Wealth (+Secure) | Confirmed | GB / Programme | D2S1 |
| DEC-016 | Four-squad parallel delivery model (one squad per audience; lead designer + designer + content + tech support) | Proposed (resource-gated) | Programme Leadership | D2S1/2 |
| DEC-017 | Modular templates with red zones (fixed/governed) & green zones (variable); limit to 2–3 standardised product templates | Confirmed | Design/Dev (Seba/Rey) | D2S1/2 |
| DEC-018 | Template change-control — post-sign-off red-zone changes trigger change management across content + code on all affected pages | Confirmed | Design / Programme | D2S1 |
| DEC-019 | Publishing governance gate — design & publishing teams are gatekeepers; all pages signed off before go-live; tenants trained to standards | Confirmed | Design/Publishing (GB/Natalie/Bernice) | D2S1 |
| DEC-020 | Co-locate content + analytics tagging in Contentstack to enable automation & SEO | Confirmed | Execution (Rey/Nithin) | D2S1 |
| DEC-021 | DevOps quality gates + automated testing (Playwright) + linting before production; initial rollout end-June with reporting | Confirmed | Execution | D2S1 |
| DEC-022 | Design foundations (IA + core templates + generic content guidelines) for Personal signed off by end-June | Confirmed | Design (Seba/Justin) | D2S1 |
| DEC-023 | Article handling — consolidated article page; interim background-colour variant change; news distinct from articles, ~1-yr retention, stays in footer | Confirmed | Design/Content (GB/Justin) | D2S1 |
| DEC-024 | URL structure for articles/news deferred pending IA (target end-June); content audit + URL mapping per section is a discovery deliverable | Deferred | IA/Content (Justin/Bernice) | D2S1/2 |
| DEC-025 | Country/site delivery — South Sudan = decommission-only; country teams own migration but depend on central for design/IA/nav/content; SA-first then roll out; small sites quick nav+footer retrofit | Confirmed (intent) | Programme/Regional (GB/Reza) | D2S1 |
| DEC-026 | Post-migration tenant operating model — tenants fund & manage their own sites under formal agreements (partnership) | Proposed | Programme (GB/Reza) | D2S1 |
| DEC-027 | Unified tracking & cadence — single Jira construct; stream leads enter milestones/priorities/deps/confidence; twice-weekly 30-min leadership check-ins + weekly playback | Confirmed | Programme (GB/Tsoaeli) | D2S1 |
| DEC-028 | Bank ownership — bank builds its own web pages (team involved only on bank-initiated redesign); confirm if OM finance pages move to bank | Confirmed (intent) | Programme | D2S1 |

---

## Detailed entries

### DEC-001 — Define web transformation scope
- **Description:** Formally define and bound the programme scope across migration, experience uplift and decommissioning — i.e. resolve whether it is a content migration, a web transformation, or a hybrid.
- **Status:** **Proposed / Unclear → reframed (Day 2).** Day 2 did not draw a single scope line; instead it adopted a **phased, audience-based delivery** (DEC-015) and explicitly acknowledged not all goals land by year-end (RSK-031). Scope is now bounded *per phase* rather than as one boundary; the per-phase definition continues.
- **Day / Session:** Day 1 / Session 1; re-baselined Day 2 / Session 1.
- **Owner:** Programme (Gareth Bew). **Approver:** Executive sponsor / Steering (`Unconfirmed`).
- **Teams impacted:** All.
- **Rationale:** Scope ambiguity changes effort, budget, timeline and risk profile.
- **Options considered:** (a) migration only; (b) full transformation; (c) bounded hybrid.
- **Trade-offs:** Speed/cost vs experience uplift & technical debt reduction.
- **Dependencies:** Drives DEC-007/008/009, resourcing, timeline.
- **Risks created/reduced:** Reduces RSK-001 if resolved; leaving it open sustains Very-High risk.
- **Follow-up:** Day 2 — translate scope into actionable work + resourcing/constraint impact.
- **Reference:** SRC-001 Decisions; SRC-002 Exec Summary / Priority Decisions.

### DEC-002 — Set platform & customer success metrics
- **Description:** Adopt platform metrics (analytics coverage, commercialisation/tenant onboarding, DS compliance, availability, <3s load, automated pipelines, code scanning) and customer metrics (organic traffic, session duration, NPS, friction reduction, active digital users).
- **Status:** **Confirmed** (stated by GB as success measures).
- **Day / Session:** D1S1. **Owner:** GB / Programme.
- **Teams impacted:** All. **Rationale:** Define what "good" looks like; basis for prioritisation.
- **Follow-up:** Use metrics to help prioritise which sections migrate vs deprioritise (links ACT-018).
- **Reference:** SRC-001 (success measures, customer metrics).

### DEC-003 — MVP scope
- **Description:** MVP = new navigation structure for four simplified audiences + secure web information architecture.
- **Status:** **Confirmed** (as MVP intent); detailed MVP deliverable for the 5-month window still to define (QST-004).
- **Day / Session:** D1S1. **Owner:** GB / Product.
- **Teams impacted:** Design, Execution, Publishing, Regional. **Reference:** SRC-001.

### DEC-004 — Identify & communicate migration dependencies
- **Description:** Identify and communicate migration dependencies including OMA colleagues, rewards, and other site owners; define/communicate specific tasks per business area.
- **Status:** **Confirmed (intent)** — execution actions pending (ACT-002).
- **Day / Session:** D1S1. **Owner:** Programme. **Reference:** SRC-001.

### DEC-005 — Whiteboard exercise → programme plan
- **Description:** Break into workstream teams (30-min timeboxes) to identify deliverables, constraints, dependencies, risks and milestones; consolidate into a working programme plan with RAID/action/decision logs.
- **Status:** **Confirmed** (executed in session). **Owner:** GB. **Reference:** SRC-001.

### DEC-006 — Establish design foundations
- **Description:** Establish design foundations — IA, navigation containers, templates, and standards (SEO, brand, tone, content) — as essential for migration rollout.
- **Status:** **Confirmed** (agreed as foundational). **Day 2:** given a concrete target — Personal-audience IA + core templates + generic content guidelines signed off **by end-June** (see DEC-022). **Owner:** Design / OMDS. **Reference:** SRC-001/002; SRC-008.

### DEC-007 — Governance & approval for design handover
- **Description:** Define governance, approval routing (Group Marketing, internal/external stakeholders, clusters) and clear entry/exit-gate / handover criteria between teams.
- **Status:** **Proposed → firmed (Day 2).** Day 2 confirmed the **gatekeeper model**: design & publishing teams review/sign off every page before go-live; only trained builders publish; new tenants must be onboarded to standards (see DEC-019). SLAs/exception detail still to document (ACT-006).
- **Owner:** Design / Programme. **Reference:** SRC-001/002; SRC-008.

### DEC-008 — Page treatment (new templates vs as-is)
- **Description:** Product-related pages receive new templates; other pages (e.g. About Us, Careers) move as-is / restyled or retain current UI.
- **Status:** **Proposed → elaborated (Day 2).** Day 2 set the concrete page strategy: modular templates with **red/green zones** (DEC-017) and specific **article handling** (consolidated article page + interim colour variant; news distinct; DEC-023). "As-is" definition (QST-002) still required for the 850 non-restyled pages.
- **Owner:** Design / Execution. **Trade-offs:** consistency vs speed; accept rework risk (TO-2). **Reference:** SRC-001/002; SRC-008.

### DEC-009 — Automated testing & DevOps pipeline enforcement
- **Description:** Implement automated testing harness, AI-assisted dev and DevOps pipeline/quality-gate enforcement (code scanning).
- **Status:** **Proposed → Confirmed (Day 2).** Day 2 committed to DevOps quality gates + automated testing (Playwright) + linting **before production**, with initial rollout end-June and reporting to teams (see DEC-021). Still constrained by Daniel's capacity (RSK-006). **Owner:** Execution. **Reference:** SRC-001/002; SRC-008.

### DEC-010 — Dedicated migration publisher
- **Description:** Ring-fence a dedicated publishing resource for migration, separating it from BAU load.
- **Status:** **Proposed** — depends on securing capacity (ACT-003, RSK-002). **Owner:** Publishing / Programme. **Reference:** SRC-001.

### DEC-011 — SEO engagement lead time
- **Description:** Engage the SEO team at least two months before QA to provide tagging guidance/scripts and validation.
- **Status:** **Confirmed (intent)** — SEO owner/tooling still to confirm (RSK-009, QST-009). **Owner:** SEO / Programme. **Reference:** SRC-001.

### DEC-012 — Phased decommissioning
- **Description:** Decommission legacy infrastructure progressively — turn off old-platform components as each is migrated, rather than waiting until the end.
- **Status:** **Proposed** — process, approval requirements and sequencing to be defined (ACT-040).
- **Day / Session:** D1 S2/S3. **Owner:** Programme/Execution.
- **Status:** **Proposed → reaffirmed (Day 2).** Nithin to include decommissioning tasks in the plan and coordinate timing by deployment stage; **South Sudan = decommission-only** (DEC-025). Process/sequencing still to define (ACT-040/071).
- **Risks created/reduced:** Reduces big-bang cutover risk; needs careful redirect/switch-off control (RSK-004).
- **Reference:** SRC-005/006 follow-up tasks; SRC-008.

### DEC-013 — Faoli Bank as separate brand
- **Description:** Treat Faoli Bank as a separate entity/brand from Old Mutual, following its own information architecture, branding and governance; confirm ownership of bank-section pages (incl. personal loans).
- **Status:** **Proposed** — brand name/spelling and ownership to validate (QST-017). Supersedes the earlier unclear "Boerewors"/bank-treatment item.
- **Day / Session:** D1 S2/S3. **Owner:** Programme.
- **Reference:** SRC-005/006 follow-up tasks; SRC-002 (bank-page treatment).

### DEC-014 — Allow design-phase skip for some teams
- **Description:** Permit some teams to skip the design phase and implement directly, based on dependencies, to accelerate delivery.
- **Status:** **Proposed** — to be documented with criteria (GB/Brent); tension with DEC-006/007 governance.
- **Day / Session:** D1 S2/S3. **Owner:** Programme/Design.
- **Risks:** Could increase design drift / inconsistency (RSK-012) — needs guardrails.
- **Reference:** SRC-005/006 follow-up tasks.

### DEC-015 — Phased, audience-based delivery
- **Description:** Deliver the transformation in audience-based phases rather than all-at-once: **Personal first** (design foundations signed off end-June, Personal section live ~end-July), then **Corporate → Business → Wealth**, with Secure web sequenced alongside. Explicitly accepts that not all year-end goals land in the current window (RSK-031).
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** GB / Programme.
- **Supersedes/refines:** DEC-001 (scope boundary reframed as per-phase), QST-016 (phasing chosen over single tactical/full split).
- **Reference:** SRC-008 (Otter/Teams notes, exec summary).

### DEC-016 — Four-squad parallel delivery model
- **Description:** Run up to four concurrent squads (one per audience) to compress the timeline. A squad ≈ lead designer + designer + content person + technical support; a two-person squad can complete a macro section per sprint (≈5 sprints for full Personal).
- **Status:** **Proposed (resource-gated)** — contingent on securing additional resources (QST-020, ACT-064, RSK-024). **Day / Session:** D2 S1/S2. **Owner:** Programme Leadership.
- **Trade-offs:** added cost/capacity vs hitting year-end (TO-7). **Reference:** SRC-008/009.

### DEC-017 — Modular red/green-zone templates
- **Description:** Standardise on modular templates composed of **red zones** (fixed, governed structure/branding) and **green zones** (variable content). Limit product pages to **2–3 standardised templates** with mandatory and optional elements; ~60% of modules are known and buildable now, the rest firmed section-by-section.
- **Status:** **Confirmed.** **Day / Session:** D2 S1/S2. **Owner:** Design/Dev (Seba/Rey).
- **Trade-offs:** red-zone stability vs green-zone flexibility (TO-8). **Reference:** SRC-008/009.

### DEC-018 — Template change-control
- **Description:** Any change to a red zone after sign-off triggers formal change management propagated across **both content and code** on every affected page. Establishes templates as governed assets.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Design / Programme.
- **Risks:** cascade cost of late changes (RSK-025). **Reference:** SRC-008.

### DEC-019 — Publishing governance gate (gatekeeper model)
- **Description:** Design and publishing teams act as gatekeepers — every page is reviewed and signed off before go-live; only trained builders publish; new tenants/teams must be onboarded to standards before contributing.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Design/Publishing (GB/Natalie/Bernice).
- **Firms:** DEC-007. **Risks:** governance/template drift if unmanaged (RSK-027). **Reference:** SRC-008.

### DEC-020 — Content + analytics co-location in Contentstack
- **Description:** Co-locate content and analytics tagging within Contentstack so tagging is created with the page, enabling automation and consistent SEO/measurement.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Execution (Rey/Nithin).
- **Reference:** SRC-008. **Links:** ACT-060, RSK-011.

### DEC-021 — DevOps quality gates & automated testing
- **Description:** Enforce DevOps quality gates with automated testing (**Playwright**) and linting before production; initial rollout end-June with reporting back to teams.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Execution.
- **Firms:** DEC-009. **Reference:** SRC-008.

### DEC-022 — Personal design foundations by end-June
- **Description:** Sign off design foundations for the Personal audience — IA, core templates and generic content guidelines — by **end-June**, then roll templates across the section.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Design (Seba/Justin).
- **Elaborates:** DEC-006. **Dependency:** DEP-017. **Reference:** SRC-008.

### DEC-023 — Article & news handling
- **Description:** Consolidate to a single article page type; apply an interim background-colour variant change for compatibility; treat **news as distinct from articles** (≈1-year retention, remains in the footer). ~140–150 personal article pages migrate once URL structure is set.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Design/Content (GB/Justin).
- **Links:** DEC-024, ACT-057/058/059, QST-027. **Reference:** SRC-008.

### DEC-024 — Defer article/news URL structure pending IA
- **Description:** Defer the final URL structure for articles/news until IA completes (target end-June). A content audit + URL mapping per section is required as a discovery deliverable before switch-off/redirect decisions.
- **Status:** **Deferred.** **Day / Session:** D2 S1/S2. **Owner:** IA/Content (Justin/Bernice).
- **Links:** ACT-057/066, DEP-005. **Reference:** SRC-008/009.

### DEC-025 — Country/site delivery model
- **Description:** Country teams own their own migration but depend on central for design/IA/navigation/content guidelines. **South Sudan = decommission-only.** Deliver **SA-first**, then roll out (OMAR and others); smaller sites get a quick navigation + footer retrofit without full IA rework.
- **Status:** **Confirmed (intent)** — per-country sequencing/effort to confirm (ACT-063/074/083). **Day / Session:** D2 S1. **Owner:** Programme/Regional (GB/Reza).
- **Reference:** SRC-008/009.

### DEC-026 — Tenant operating model (post-migration)
- **Description:** After migration, tenants fund and manage their own sites under formal partnership agreements (business owner + funding model).
- **Status:** **Proposed** — agreements/ownership to define (ACT-080). **Day / Session:** D2 S1. **Owner:** Programme (GB/Reza).
- **Reference:** SRC-008.

### DEC-027 — Unified tracking & leadership cadence
- **Description:** Adopt a single Jira construct across all teams; stream leads enter milestones, priorities, dependencies, confidence and owners into the shared roadmap. Run twice-weekly 30-minute leadership check-ins plus a weekly playback.
- **Status:** **Confirmed.** **Day / Session:** D2 S1. **Owner:** Programme (GB/Tsoaeli).
- **Links:** ACT-055/062/069/070. **Reference:** SRC-008.

### DEC-028 — Bank ownership of bank web pages
- **Description:** The bank builds its own web pages; the team is involved only on a bank-initiated redesign. Confirm whether OM finance pages currently managed by the team move to the bank.
- **Status:** **Confirmed (intent)** — finance-page move to confirm (QST-021, ACT-076). Reinforces DEC-013. **Day / Session:** D2 S1. **Owner:** Programme.
- **Reference:** SRC-008.

---

## Decisions required but not yet taken (tracked as open — see open-questions.md / SRC-002)
DS Build vs Platform Build ownership & acceptance criteria; content-pack minimum standard; image repository & aspect-ratio standards; theming model (incl. dark theme & Wealth CI); article-page skinning & content carousel; legacy switch-off criteria & non-migrated-site rollout; secure-web/SSO treatment; Bank/"Boerewors" ownership. These are captured under QST and as Critical/High controls in [delivery-and-programme.md](../04_Analysis/delivery-and-programme.md).
