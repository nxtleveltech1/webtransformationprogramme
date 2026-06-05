# Project Brief — Web Transformation / Migration Programme

**Source:** SRC-001 (Teams summary), SRC-002 (Whiteboard synthesis) — Day 1; SRC-008 (Day 2 Session 1), SRC-009 (Day 2 Session 2).
**Status:** Established context, **re-baselined after Day 2 (2026-06-04)**. Day 1 content is preserved below; the Day 2 delivery model is captured in **§10**. Items flagged `Clarification required` / `Unconfirmed` / `Open` need owner validation.

> **Day 2 re-baseline (2026-06-04):** The programme moved from the Day 1 scope-boundary debate to a concrete **delivery model** — a phased, audience-based rollout (Personal first) on modular red/green-zone templates, governed publishing gates, and (resource-permitting) four parallel squads. The central scope question (§2) is now managed **per phase** rather than as a single boundary. See §10 and `DEC-015`–`DEC-028`.

---

## 1. Purpose

Old Mutual is running a Web Transformation programme to:

1. **Migrate** existing country / business websites and secure-web journeys onto a new platform (Contentstack-based new-world architecture).
2. **Uplift the customer experience** (information architecture, navigation, design system, templates, findability).
3. **Decommission** the legacy platform once journeys are moved.

The Day 1 workshop existed to create a shared understanding of programme goals, integrate the work teams, and surface dependencies, constraints, risks and deliverables ahead of consolidating a programme plan.

> _GB (Teams summary):_ "the web transformation project aims to migrate to a new platform, improve customer experience, and decommission the old platform."

---

## 2. Central scope tension (the programme's defining question)

The single most important unresolved item across all workstreams:

> **Is this a content migration, a web transformation, or a hybrid with clearly bounded scope?**

Several delivery streams imply transformation (new Design System adoption, V2 templates, IA changes, analytics, observability, automated testing, revised publishing workflow, legacy decommissioning) while the programme is described as a "migration." This distinction must be formally resolved because it changes **scope, effort, budget, timeline and risk profile**. Rated **Very High** on the consolidated risk view. See `RSK-001`, `DEC-001`, `QST-001`.

> **Day 2 update:** Day 2 did **not** draw a single scope line. Instead the programme adopted **phased, audience-based delivery** (`DEC-015`) and explicitly accepted that **not all year-end goals will land in the current window** (`RSK-031`). Scope is now bounded **per phase** (Personal first), with later-phase scope firmed section-by-section. `RSK-001` is now managed rather than resolved; residual ambiguity remains for Corporate / Business / Wealth / Secure. See §10.

---

## 3. Objectives of the workshop

- Achieve clear understanding of programme goals, team integration, dependencies and constraints.
- Break into workstream teams to identify deliverables, constraints, dependencies, risks and milestones (whiteboard / sticky-note exercise).
- Consolidate outputs into a working programme plan with RAID, action and decision logs.
- Define handover / exit-gate criteria between teams.
- Prepare for Day 2 (achievability, team-health needs, stakeholder conversations).

---

## 4. Success metrics (platform) — as stated by GB

- **Analytics coverage** across the platform.
- **Commercialisation** — ability to onboard tenants (multi-tenant platform).
- **Design system compliance**.
- **Platform performance targets**: availability; page load times under 3 seconds.
- **Automated deployment pipelines** and code scanning for quality.

### Customer metrics
- Increase organic traffic.
- Increase session duration.
- Customer satisfaction (NPS).
- Friction reduction.
- Active digital users.

---

## 5. Scope (MVP) — as stated Day 1

- MVP focus: **new navigation structure for four simplified audiences** + **secure web information architecture**.
- Product-related pages receive the new design treatment; non-product pages (e.g. About Us, Careers) retain current UI unless a future redesign is planned. `Clarification required` — confirm with all participants (`QST`).
- "As-is" pages move with minimal change (~30 min/page); new-template pages ~2 h/page.
- Out of (current migration) scope but noted for future: full automated deployment enhancements, some servicing capabilities, future commercial onboarding.

---

## 6. Key constraints

- **Hard deadline: end of November** (budget-constrained; not December as previously considered). The migration end date **will not move**.
- **Capacity**: only two publishers (one full-time on migration, one on BAU across 14 sites + secure + app support); no dedicated OMAR publishers identified. Constraints also in copywriting, design, front-end dev and BA.
- **Front-end resource exit** after PI2 (Cross Channels front-end moves to Web Platform team).
- **Page volume**: ~1,530 OMAR pages (as of 1 Jun); reduced from ~2,500 to ~1,000 in scope so far.
- **Upstream dependencies**: publishing blocked by design, development, content readiness, asset sign-off and approved URL structures.

---

## 7. Workstreams (Day 1 structure)

| # | Workstream | Owner (stated) | One-line status |
| --- | --- | --- | --- |
| 1 | Publishing | Publishing team | High-risk capacity bottleneck vs large OMAR inventory |
| 2 | Website Migration & Go-Live Readiness | Programme / Regional teams | Amber / At Risk — critical dependencies, production readiness open |
| 3 | Design & Design System (OMDS) | Design / Brent | Strategic governance layer, not just a UI library |
| 4 | Execution | Nithin | Scope includes transformation + technical uplift, not only migration |
| 5 | Cross Channels Solutions | Tebogo & Wayne | Progressing but exposed to front-end and BA resource constraints |
| 6 | Content Governance & Migration Readiness | Content / Publishing / DS / SEO | Content readiness is a programme control point |

---

## 8. Overall programme position

**Amber / At Risk** due to critical dependencies and unresolved production-readiness activities (secure web migration, servicing transactions, SEO/analytics ownership, environment sequencing, decommission planning).

---

## 9. In-scope sites & properties (SRC-007 supplement — validate spellings)

The following were captured in the parallel Session 1 export; names marked `[validate]` need confirmation with programme leads.

| Category | Sites / properties mentioned |
| --- | --- |
| Primary platforms | Onkoza `[validate]`, Myo Mutual `[validate]`, Call Me Back, lead generation, servicing, Rewards |
| Country / regional | Multiple country implementations (OMAR colleagues) |
| Other | Fullertela `[validate]`, Omkom alternatives `[validate]` |
| Partner / niche (design navigation) | EQG (share trading), IRAS and other insurance entities, investment platforms, Symmetry |
| Out of scope (noted) | Cyber-related sites; sites with independent business propositions |

**Platform metrics (SRC-007):** 99.7% availability SLA stated; organic traffic ~34% of 1.5M monthly visitors; load-time target &lt;3s (&lt;2s ideal per research). Align with DEC-002 success measures.

---

## 10. Day 2 re-baseline — the delivery model (SRC-008 D2S1, SRC-009 D2S2)

Day 2 converted the Day 1 "1000-piece puzzle" into a working delivery model. The headline shift: from *debating the scope boundary* to *committing a phased, squad-based execution plan* with governance, quality gates and a unified tracker.

### 10.1 Phased, audience-based rollout `DEC-015` (Confirmed)
Delivery is sequenced by audience rather than delivered as one block:

```
Personal  →  Corporate  →  Business  →  Wealth   (Secure web sequenced alongside)
```

- **Personal first:** design foundations (IA + core templates + generic content guidelines) signed off **end-June** (`DEC-022`); **Personal section live ~end-July**.
- Build starts from the **~60% of modules already known** and firms section-by-section as more becomes clear (avoids a single end-of-June "big bang").
- Explicitly accepts not all goals land by year-end (`RSK-031`); the plan is expected to change repeatedly before completion.

### 10.2 Four-squad parallel model `DEC-016` (Proposed — resource-gated)
- Up to **four concurrent squads**, one per audience (Personal, Corporate, Business, Wealth; Secure alongside), each running the same work cycle to avoid linear-delivery delays.
- Indicative squad ≈ **lead designer + designer + content person + technical support**; a two-person squad ≈ one **macro section** per sprint; full Personal ≈ **5 sprints**.
- **Contingent on securing additional resources** (`QST-020`, `ACT-064`). If capacity is not unlocked, current-capacity (linear) delivery **will not meet year-end** (`RSK-024`). Two additional developers are confirmed for engineering.

### 10.3 Template & content model
- **Modular templates with red zones (fixed/governed) & green zones (variable)**; limit to **2–3 standardised product templates** with mandatory/optional elements `DEC-017` (Confirmed).
- **Template change-control:** post-sign-off red-zone changes trigger change management across **both content and code** on all affected pages `DEC-018` (Confirmed) — see `RSK-025`.
- **Article/news handling** `DEC-023`: consolidated article page; interim background-colour variant change for visual compatibility; **news treated as distinct from articles** (~1-year retention, remains in footer). ~**140–150 personal articles** restyle/move once URL structure is set; **URL structure deferred pending IA** `DEC-024`.
- Page inventory framing: **~150 pages restyled & moved, ~850 remain** (≈2 h/page build); **457 pages** use the modular page component. August is "too late" for the 850.

### 10.4 Governance, quality & operating cadence
- **Publishing gatekeeper governance** `DEC-019`: design & publishing teams sign off every page before go-live; only trained builders publish; new tenants onboarded to standards first.
- **Content + analytics co-located in Contentstack** `DEC-020` to enable automation and SEO/measurement.
- **DevOps quality gates + automated testing (Playwright) + linting** before production; **initial rollout end-June** with reporting `DEC-021`.
- **Unified Jira + leadership cadence** `DEC-027`: single Jira construct (Tsoaeli); stream leads enter milestones/priorities/dependencies/confidence; **twice-weekly 30-min leadership check-ins** + **weekly playback**.

### 10.5 Country / tenant / bank model
- **South Sudan = decommission-only**; country teams own their migration but depend on central for design/IA/navigation/content guidelines; **SA-first** then roll out; **smaller sites** (e.g. "Bull and Taylor" `[validate]`) get a quick **nav + footer retrofit** without full IA rework `DEC-025`.
- **Tenant operating model** `DEC-026` (Proposed): post-migration, tenants fund and manage their own sites under formal partnership agreements.
- **Bank owns its own pages** `DEC-028`: the team engages only on a bank-initiated redesign; confirm whether OM finance pages move to the bank (`QST-021`). Reinforces `DEC-013` (Faoli Bank as separate brand).

### 10.6 Delivery reality & key dates (status as at Day 2)
| Item | Status / date | Source |
| --- | --- | --- |
| Feature migration (Cross Channels) | **11 of 21 features live (52%)**; target **71–72% end-June**, **~90% end-July** | SRC-008/009 (Tebogo) |
| EasiPlus journey | **Built but blocked** until product pages complete (`RSK-029`, `DEP-018`) | SRC-008/009 |
| Migration/feature team roll-off | **~Sept 10** (`RSK-023`) | SRC-009 |
| Most knowledgeable QE roll-off | **August** (`RSK-023`) | SRC-009 |
| Hong Kong live YouTube integration | **Test June / go-live July**; OMI test June, Vallabh review July (`PRK-012`, `ACT-079`) | SRC-008 |
| Bernice consolidation session | **Jun 5** (`ACT-078`) | SRC-009 |
| Workstream-leads roadmap review | **Fri Jun 7** | SRC-008/009 |
| Year-end delivery | Linear delivery **misses** year-end; not all goals land in window (`RSK-024`/`RSK-031`) | SRC-008/009 |

> **Open / unresolved after Day 2:** public-web pen-test scope (with Nzama, `RSK-022`); red-zone stability process not finalised; cross-functional/legacy journey ownership; squad resourcing/capacity decision (`QST-020`); external-team onboarding/support; optimal ongoing planning cadence. The "personal Coetzee" section reference in source is `Transcript unclear — requires human validation`.

---

> **Re-baseline status:** Updated after Day 2 (2026-06-04). Day 1 baseline (§1–9) preserved; §10 reflects the Day 2 delivery model. Further re-baselines expected as the integrated roadmap is consolidated and the four-squad resourcing decision is taken.
