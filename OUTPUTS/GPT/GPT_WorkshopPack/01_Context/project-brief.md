# Project Brief — Web Transformation / Migration Programme

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001 (Teams summary), SRC-002 (Whiteboard synthesis) — Day 1.
**Status:** Established context. Items flagged `Clarification required` need owner validation.

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

> **Provisional:** Day 1 of 2 — re-baseline after Day 2 scope decision (DEC-001).
