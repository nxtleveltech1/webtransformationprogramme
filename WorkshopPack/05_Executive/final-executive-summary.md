# Final Executive Summary — Two-Day Workshop

**Programme:** Old Mutual Web Transformation / Migration Programme
**Two-Day Planning Workshop — Facilitator: Gareth Bew**
**Sources:** Day 1 — SRC-001, SRC-002, SRC-005, SRC-006; Day 2 — SRC-008 (D2S1), SRC-009 (D2S2).
**Status:** **Final two-day record.** Registers re-baselined across both days: DEC-001–028, ACT-001–084, RSK-001–032, ISS-001–011, ASM-001–016, DEP-001–022, QST-001–027, PRK-001–015.
**Overall programme position:** **Amber / At Risk** — clear direction and an agreed delivery model; year-end outcome contingent on a leadership resourcing decision.
Structure per Agent.md "Final Executive Output" (15 sections).

---

## 1. Workshop purpose
To create a shared, end-to-end understanding of the Web Transformation programme — migrating Old Mutual's digital and web estate to a new Contentstack-based platform, uplifting customer experience, and decommissioning legacy — and to convert that understanding into an actionable delivery plan. **Day 1** integrated the delivery teams and surfaced the full landscape, deliverables, dependencies, risks and constraints. **Day 2** turned that landscape into a concrete delivery model, sequencing, governance and resourcing ask ahead of the year-end window.

## 2. Strategic context
The programme spans **business** (audience simplification across Personal/Corporate/Business/Wealth, commercialisation and multi-tenant ambition), **technical** (Contentstack, V2 templates, OMDS design system, environments, observability, automated testing), **process** (publishing workflow, content governance, handover gates, decommissioning), and **governance** (design authority, approval routing, go-live readiness). Day 1's defining tension was strategic — **migration vs transformation**, with full scope implying ~end-2027 against a fixed year-end budget. Day 2 resolved this not with a single scope line but with a **phased, audience-based delivery model** that bounds scope per phase and explicitly manages year-end expectations.

## 3. Key outcomes
- **From scope debate to delivery model.** The central Day 1 question (DEC-001/RSK-019) was answered by a phased audience-based rollout: **Personal first** (foundations end-June; section ~end-July), then **Corporate → Business → Wealth** (+Secure) [DEC-015].
- **A concrete operating model.** Modular **red/green-zone templates** (2–3 standardised) [DEC-017] with **change-control** [DEC-018]; a **publishing gatekeeper gate** [DEC-019]; **content + analytics co-located in Contentstack** [DEC-020]; **DevOps quality gates + Playwright + linting** [DEC-021].
- **A resourcing decision crystallised.** Current capacity covers **Personal only**; a **four-squad parallel model** [DEC-016] can accelerate to year-end *if* leadership approves additional resources [QST-020/ACT-064].
- **Country & ownership clarity.** South Sudan decommission-only, SA-first rollout [DEC-025]; **bank owns its own pages** [DEC-028]; tenant funding model proposed [DEC-026].
- **A working governance rhythm.** Single Jira construct, twice-weekly leadership check-ins, weekly playback [DEC-027].
- **A unified team.** Two days produced a single end-to-end view and the relationships/trust to execute it.
- **Honest year-end position.** Linear delivery will not meet all year-end goals [RSK-024/RSK-031] — the phased model + squad decision is the response.

## 4. Confirmed decisions
**Day 1 (confirmed / directional):** DEC-002 (success metrics), DEC-003 (MVP = navigation + secure-web IA), DEC-004 (migration dependencies — intent), DEC-005 (whiteboard → plan), DEC-006 (design foundations), DEC-011 (SEO ≥2-month lead — intent).

**Day 2 (confirmed / confirmed-intent):** DEC-015 (phased audience delivery), DEC-017 (red/green-zone templates), DEC-018 (template change-control), DEC-019 (publishing gatekeeper gate), DEC-020 (content + analytics co-location), DEC-021 (DevOps quality gates + Playwright + linting), DEC-022 (Personal foundations end-June), DEC-023 (article/news handling), DEC-025 (country model; South Sudan decommission-only — intent), DEC-027 (Jira + leadership cadence + playback), DEC-028 (bank owns its pages — intent).

## 5. Proposed or pending decisions
- **DEC-001** — Programme scope boundary: **reframed** to per-phase bounding via DEC-015; residual ambiguity in later phases remains.
- **DEC-016** — Four-squad parallel model — **Proposed (resource-gated)**; gating leadership decision [QST-020/ACT-064].
- **DEC-026** — Tenant operating/funding model — **Proposed** [ACT-080].
- **DEC-024** — Article/news URL structure — **Deferred** pending IA (target end-June) [ACT-057].
- Day 1 still-open: **DEC-010** (dedicated publisher), **DEC-013** (Faoli Bank brand), **DEC-014** (design-phase skip).
- Outstanding "decisions required" (SRC-002): DS-Build vs Platform-Build ownership, content-pack standard, image/asset standards, theming model, legacy switch-off criteria, secure-web/SSO treatment.

## 6. Critical actions
| ID | Action | Owner | Due | Priority |
| --- | --- | --- | --- | --- |
| ACT-064 | Resourced four-squad view (plan + immediate hires/onboarding) — gates DEC-016 | Seba/Programme | ASAP | Critical |
| ACT-065 | Finalise Personal design foundations + buildable templates | Gareth/Bertus/Design | End-June | Critical |
| ACT-001 | Resolve & document scope decision; revise plan (now per-phase via DEC-015) | Programme (GB) | In progress | Critical |
| ACT-003 | Secure dedicated OMAR publishing capacity | Programme/Publishing | Not confirmed | Critical |
| ACT-004 | Define & approve "as-is" page definition (the ~850 pages) | Programme/Design | Not confirmed | Critical |
| ACT-017 | Complete URL audit (≈95% of URLs changing) | Natalie/Execution | Not confirmed | Critical |
| ACT-055/070 | Populate roadmap; stream leads enter milestones/deps/confidence | GB + leads | Fri midday | High |
| ACT-060/061 | Content+analytics co-location; DevOps quality gates + linting | Rey/Nithin; Gareth/Daniel | June / end-June | High |
| ACT-057/058 | Map article/news URLs; migrate ~140–150 Personal articles | Justin/Bernice | End-June / June | High |
| ACT-012 | SEO & analytics ownership workshop | Programme/SEO | Not confirmed | High |
| ACT-013 | Go-live readiness checklist (ServiceNow, security, comms, decommission) | Programme | Not confirmed | High |
| ACT-072/073 | Pen-test scope; identify owners for additional journeys | Gareth/Tebogo | This week | High |

## 7. Major risks & issues
**Very High / High — scope & timeline:** RSK-001 (scope ambiguity — now managed per-phase), RSK-019 (scope-vs-year-end), **RSK-024 (linear delivery misses year-end)**, RSK-031 (not all goals deliverable → expectation management).
**Resource:** RSK-002 (publishing capacity), RSK-005 (regional cuts), RSK-017 (front-end post-PI2), RSK-018 (BA), **RSK-023 (Sept/Aug roll-offs)**, **RSK-026 (single points of failure — Gareth/Natalie/Bernice)**, RSK-032 (OMAR self-migration).
**Technical/Process:** RSK-004/021 (URL/redirect/tracking), RSK-008 (component build), RSK-010 (environments), **RSK-025 (template change cascade)**, RSK-027 (governance drift), RSK-022 (security/ServiceNow).
**Delivery:** RSK-013 (go-live readiness), RSK-014 (secure web), RSK-015 (servicing), RSK-028 (sign-off delays), RSK-029 (EasiPlus dependency), **RSK-030 (secure-web portfolio-view clarity)**.
**Live issues (ISS-001–011):** Brand/CI (ISS-001), page-count reliability (ISS-002), secure-web incomplete (ISS-003), Botswana servicing 1/9 (ISS-004), go-live readiness open (ISS-005), BA leave (ISS-006), **single publisher (ISS-007)**, **no knowledge system (ISS-008)**, **under-resourcing (ISS-009)**, **journey ownership (ISS-010)**, **portfolio-view (ISS-011)**.

## 8. Dependencies
Critical-path: **DEP-017** (Personal design foundations before build — end-June), **DEP-019** (IA sign-off per audience, sequential), **DEP-021** (template-drop cadence feeds content/build), **DEP-022** (Figma source-of-truth for automation). Carried from Day 1: DEP-001 (publishing readiness), DEP-002 (testing in Beta), DEP-003 (DS V2 to Beta), DEP-005 (URL audit), DEP-006 (content packs), DEP-007 (Web Platform post-PI2), DEP-009 (SEO lead time), DEP-011 (service tree). Delivery-blocking: **DEP-018** (product pages → EasiPlus), **DEP-020** (secure-web portfolio-view before Sept roll-off), DEP-013/015/016 (e-commerce GA, pen-test, ServiceNow before go-live).

## 9. Ownership & accountability
**Clear:** facilitation (GB); product (Keshvi); OMDS (Brent); execution/engineering (Nithin/Rey); Cross Channels (Wayne/Tebogo); SEO (Bernice); IA & URL structure (Justin); content migration & page build (Bernice); design foundations (Seba/Justin); template build + gatekeeping (Gareth/Natalie); Jira integration (Tsoaeli); tenant agreements (Gareth/Reza).
**Unresolved (RACI incomplete — clarification required):** OMAR/international content creation, banking-platform integration coordination, legacy decommissioning ownership, SEO/analytics ownership (RSK-009), several journeys (ISS-010), ownerless calculators, secure-web service-tree solution. See [../04_Analysis/raci.md](../04_Analysis/raci.md).

## 10. Resourcing implications
Current capacity is sufficient for the **Personal segment only** [ASM-012]; **two additional developers** confirmed for engineering. Concurrent multi-segment delivery to year-end requires the **four-squad model** and **net-new capacity** with immediate onboarding [DEC-016/ACT-064/ACT-067]. Binding constraints persist: under-resourced publishing/copywriting/design/BA; front-end exit post-PI2; **single points of failure** (Gareth/Natalie/Bernice) [RSK-026]; and **key-resource roll-offs** (~Sept 10 migration team; QE in August) [RSK-023]. See [../04_Analysis/resourcing-and-capacity.md](../04_Analysis/resourcing-and-capacity.md).

## 11. Process & workflow implications
A confirmed template lifecycle — **design foundations → template creation → stakeholder engagement → sign-off → development handover → content creation → publishing** — with the **publishing team as final gatekeepers** [DEC-019] and **red-zone change control** [DEC-018]. Delivery via continuous **micro-drops** from early June, multiple handovers to ~September; **content audit + URL mapping per section** is a discovery deliverable [DEC-024/ACT-066]; **phased decommissioning** alongside migration, South Sudan decommission-only [DEC-012/DEC-025]. See [../04_Analysis/process-and-workflow.md](../04_Analysis/process-and-workflow.md).

## 12. Technical & data implications
Contentstack build with **co-located content + analytics tagging** [DEC-020]; **modular red/green-zone** templates with **Figma as source of truth** [DEC-017/DEP-022]; **DevOps quality gates + Playwright + linting** before production [DEC-021]; observability dashboards underway (Loza); GA + Tableau maintained through migration; **457** pages on the modular component; **~150** to restyle/move now, **~850** to follow; ≈2h/page build assumption [ASM-014]; URL audit with ~95% of URLs changing [RSK-021]; environment sequencing and SSO/secure-web still to finalise. See [../04_Analysis/technical-and-systems.md](../04_Analysis/technical-and-systems.md).

## 13. Governance implications
OMDS design authority + approval routing (Group Marketing/internal/external/clusters); **gatekeeper sign-off** before go-live [DEC-019]; **template change-control** [DEC-018]; **single Jira construct + twice-weekly leadership check-ins + weekly playback** [DEC-027]; leadership review/sign-off for cross-version outputs; audience-cluster IA sign-off including legal/compliance; release governance and **go-live readiness** (security, ServiceNow, comms, decommission) [ACT-013]. See [../04_Analysis/stakeholder-and-governance.md](../04_Analysis/stakeholder-and-governance.md).

## 14. Recommended next steps (1–2 weeks)
1. **Leadership decision on four-squad resourcing** [ACT-064/DEC-016/QST-020] — the gating call for year-end ambition.
2. **Consolidate the roadmap** — Bernice consolidation (Jun 5); stream leads enter data; Friday (Jun 7) leads review; raw integrated dataset by Friday afternoon [ACT-055/070/078].
3. **Finalise Personal design foundations** by end-June [ACT-065/DEC-022/DEP-017].
4. **Map article/news URLs**; begin Personal article migration [ACT-057/058].
5. **Stand up DevOps quality gates + analytics co-location** [ACT-060/061].
6. **Establish cadence + single Jira board** [ACT-062/069].
7. **Close ownership gaps** — additional journeys [ACT-073]; pen-test scope [ACT-072]; SEO/analytics ownership [ACT-012].
8. **Confirm "as-is" definition** and dedicated publishing capacity [ACT-004/003].

## 15. Executive escalation items
- **Resource approval for the four-squad model** [DEC-016/ACT-064/QST-020/ISS-009] — without it, the programme defaults to linear delivery.
- **Sponsor expectation management** — not all year-end goals will be delivered [RSK-031/RSK-024].
- **Key-resource roll-offs** (Sept/Aug) and **single points of failure** [RSK-023/RSK-026].
- **Secure web & regional servicing** risk, incl. **portfolio-view clarity** before Sept roll-off [RSK-014/RSK-015/RSK-030/ISS-011].
- **Security pen-test scope + ServiceNow updates** before go-live [RSK-022/ACT-072].
- **Tenant funding/operating model & bank ownership** [DEC-026/DEC-028].
- **Brand/CI approval route** for confident template scaling [ISS-001].
- **SEO/analytics ownership** [RSK-009/ACT-012].

---
_This document is the official two-day workshop record. Per-day detail: [day1-executive-summary.md](day1-executive-summary.md), [day2-executive-summary.md](day2-executive-summary.md). Full registers with inline supersession notes: [../03_Registers/](../03_Registers/). Reconciliation & QA: [reconciliation-log.md](reconciliation-log.md), [qa-report.md](qa-report.md)._
