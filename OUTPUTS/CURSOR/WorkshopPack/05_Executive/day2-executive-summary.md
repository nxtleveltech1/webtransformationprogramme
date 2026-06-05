# Day 2 — Executive Summary

**Programme:** Old Mutual Web Transformation / Migration Programme
**Day 2 Planning Workshop — Facilitator: Gareth Bew**
**Source:** SRC-008 (Day 2 Session 1), SRC-009 (Day 2 Session 2). **Status:** Day 2 complete — registers re-baselined (DEC-015–028, ACT-055–084, RSK-023–032, ISS-009–011, ASM-012–016, DEP-017–022, QST-020–027, PRK-010–015).
**Overall programme position:** **Amber / At Risk** — direction now concrete, but year-end delivery is contingent on a leadership resourcing decision.

---

## 1. Day 2 executive summary
Day 1 ended on an unresolved strategic question — *is this a migration or a transformation?* — with the full discussed scope implying ~end-2027 delivery against a fixed year-end budget window. **Day 2 answered that question with a delivery model rather than a single scope line.** The programme committed to a **phased, audience-based rollout**: design foundations for the Personal audience signed off by **end-June**, the Personal section live ~**end-July**, then **Corporate → Business → Wealth**, with Secure web sequenced alongside [DEC-015]. To compress the timeline, leadership proposed **four parallel squads** (one per audience), explicitly **resource-gated** — it can be switched on immediately *if* additional capacity is approved [DEC-016].

The team converted the Day 1 whiteboard ("a 1000-piece puzzle") into an operating model with real mechanics: **modular red/green-zone templates** limited to 2–3 standardised product templates [DEC-017] under formal **change-control** [DEC-018]; a **publishing gatekeeper governance gate** [DEC-019]; **content + analytics co-located in Contentstack** [DEC-020]; **DevOps quality gates with Playwright and linting** before production [DEC-021]; a confirmed **end-June Personal design-foundations** target [DEC-022]; concrete **article/news handling** [DEC-023/DEC-024]; a **country model** (South Sudan decommission-only; SA-first rollout) [DEC-025]; a **tenant funding/operating model** [DEC-026]; **unified Jira tracking with a twice-weekly leadership cadence and weekly playback** [DEC-027]; and confirmation that **the bank owns its own pages** [DEC-028].

The candid headline for the executive: with **current** (linear) capacity the programme **will not** meet all year-end goals [RSK-024, RSK-031]. The phased model plus the four-squad option is the response — but the four-squad model needs a leadership decision on additional resources now [QST-020, ACT-064]. The two-day session also delivered something less tangible but material: a team that now shares a single end-to-end view and the trust to deliver against it.

## 2. What changed from Day 1
- **Scope debate → delivery model.** DEC-001's open migration-vs-transformation boundary is reframed as **scope bounded per phase** via the phased audience rollout [DEC-015]; the tactical-vs-strategic dilemma (QST-016) was resolved into phasing, not a single cut.
- **Foundations given a date.** DEC-006's design foundations now carry a concrete **end-June Personal** target [DEC-022].
- **Governance firmed.** DEC-007's governance intent became a confirmed **gatekeeper model** [DEC-019].
- **Page treatment made concrete.** DEC-008 elaborated into **red/green-zone templates** [DEC-017] plus specific **article handling** [DEC-023].
- **Testing confirmed.** DEC-009 moved from Proposed to **Confirmed** as DevOps quality gates + Playwright + linting [DEC-021].
- **Decommissioning reaffirmed.** DEC-012's phased decommissioning reconfirmed; **South Sudan = decommission-only** [DEC-025, ACT-071].
- **Timeline risk confirmed.** RSK-019's scope-vs-timeline mismatch is now an explicit acceptance that linear delivery misses year-end [RSK-024] and that not all goals land in-window [RSK-031].

_Full supersession detail in [reconciliation-log.md](reconciliation-log.md)._

## 3. Final decision log (Day 2: DEC-015–DEC-028)
**Confirmed (14 Day-2 decisions, of which 9 Confirmed / Confirmed-intent):**
- DEC-015 Phased audience-based delivery — Personal first (foundations end-June; section ~end-July), then Corporate → Business → Wealth (+Secure). **Confirmed.**
- DEC-017 Modular red/green-zone templates; 2–3 standardised product templates. **Confirmed.**
- DEC-018 Template change-control (red-zone changes → change management across content + code). **Confirmed.**
- DEC-019 Publishing governance gate / gatekeeper model. **Confirmed.**
- DEC-020 Content + analytics co-location in Contentstack. **Confirmed.**
- DEC-021 DevOps quality gates + Playwright + linting before production (rollout end-June). **Confirmed.**
- DEC-022 Personal design foundations (IA + core templates + content guidelines) by end-June. **Confirmed.**
- DEC-023 Article & news handling (consolidated article page; interim colour variant; news distinct, ~1-yr retention, footer). **Confirmed.**
- DEC-025 Country/site model (South Sudan decommission-only; SA-first; central provides design/IA/nav/content). **Confirmed (intent).**
- DEC-027 Unified Jira + twice-weekly leadership cadence + weekly playback. **Confirmed.**
- DEC-028 Bank owns its own web pages. **Confirmed (intent).**

**Proposed / Deferred:**
- DEC-016 Four-squad parallel model — **Proposed (resource-gated)**; needs leadership approval [QST-020, ACT-064].
- DEC-026 Tenant operating model (tenants fund/manage post-migration) — **Proposed**; agreements to define [ACT-080].
- DEC-024 Article/news URL structure — **Deferred** pending IA (target end-June) [ACT-057].

## 4. Final action register (Day 2: ACT-055–ACT-084)
**Critical:**
- ACT-064 — Produce resourced four-squad view (resourcing plan + immediate hires/onboarding). _Owner: Seba/Programme._ **Gates DEC-016 / RSK-024.**
- ACT-065 — Finalise Personal design foundations + buildable templates. _Owner: Gareth/Bertus/Design — end-June._

**High (selected):**
- ACT-055 / ACT-070 — Populate shared roadmap; stream leads enter milestones/priorities/deps/confidence (raw dataset by Friday midday).
- ACT-057 — Map article/site URLs; propose consolidated /articles structure (end-June).
- ACT-058 — Migrate ~140–150 Personal article pages (June).
- ACT-060 — Implement content + analytics co-location automation in Contentstack (June).
- ACT-061 — Implement DevOps quality gates + CI/CD checks + linting; begin reporting (end-June).
- ACT-068 — Hand over four production-ready template sections to dev within 1–2 sprints.
- ACT-069 — Integrate all team boards into a single Jira construct (Tsoaeli).
- ACT-072 — Clarify public-web pen-test scope with Nzama.
- ACT-073 — Identify business owners for additional journeys (compliments/complaints/unclaimed benefits/IR).
- ACT-078 — Bernice consolidation (Jun 5) + Friday (Jun 7) leads review.

**Resourcing ask (single most important leadership action):** Approve the additional resources required to stand up the four-squad model [ACT-064 / DEC-016 / QST-020]. Without it, the programme defaults to linear delivery and accepts the year-end shortfall [RSK-024/RSK-031].

## 5. Final risk log (Day 2: RSK-023–RSK-032)
| ID | Risk | Prob/Impact | Escalate |
| --- | --- | --- | --- |
| RSK-024 | Linear (current-capacity) delivery will not meet year-end; full scope extends beyond | High/High | Yes |
| RSK-023 | Key-resource roll-offs — migration team ~Sept 10; most knowledgeable QE in August | High/High | Yes |
| RSK-026 | Single points of failure — only Gareth & Natalie build templates; Bernice overloaded | High/Med-High | Yes |
| RSK-030 | Secure-web portfolio-view requirements unclear before Sept roll-off | High/High | Yes |
| RSK-031 | Not all year-end goals deliverable → sponsor expectation management | Med/Med | Yes |
| RSK-025 | Post-sign-off template (red-zone) changes cascade across content + code | Med/High | Yes |
| RSK-032 | Country teams without dedicated content/design (OMAR) cannot self-migrate | High/High | Yes |
| RSK-028 | Stakeholder sign-off delays extend template sign-off (sequential Personal outreach) | Med/High | Yes |
| RSK-029 | EasiPlus & dependent journeys blocked until Funeral/product pages complete | Med/High | Yes |
| RSK-027 | Governance/template drift without controls (Contentstack ↔ Figma; new tenants) | Med/Med | Unclear |

**For exec attention:** RSK-024 (year-end), RSK-023 (roll-offs), RSK-025 (template cascade), RSK-026 (single points of failure), RSK-030 (secure-web clarity), RSK-031 (expectation management).

## 6. Final issue log (Day 2: ISS-009–ISS-011)
- **ISS-009** — Under-resourcing across all workstreams; teams operating beyond capacity (resolution: ACT-064). **Escalate.**
- **ISS-010** — Unclear business ownership for several journeys (compliments, complaints, unclaimed benefits, investor relations, corporate unclaimed benefits) blocks migration planning (ACT-073). **Escalate.**
- **ISS-011** — Portfolio-view dependencies/requirements unclear for Secure Web; aggravated by Sept roll-off (QST-024, DEP-020). **Escalate.**

## 7. Final assumptions log (Day 2: ASM-012–ASM-016)
- **ASM-012** — Current capacity is sufficient for **Personal only**, not all segments concurrently (validate via ACT-064).
- **ASM-013** — A two-person squad completes a macro section per sprint; full Personal ≈ 5 sprints.
- **ASM-014** — ~2h/page build holds for the ~850 remaining pages once templates/components are ready.
- **ASM-015** — ~60% of modules are known and can start now; remainder firmed section-by-section.
- **ASM-016** — Template/component parallel development is feasible (component library built without full templates).

## 8. Final dependency log (Day 2: DEP-017–DEP-022)
- **DEP-017** — Personal design foundations must complete before dev/build (end-June). _Critical path._
- **DEP-018** — Product pages complete before EasiPlus & dependent sales journeys (reaffirms DEP-008).
- **DEP-019** — IA sign-off per audience required before each downstream stream (sequential).
- **DEP-020** — Secure-web portfolio-view technical requirements needed before Sept roll-off.
- **DEP-021** — Template handover cadence (~2-weekly drops) feeds content creation & parallel builds.
- **DEP-022** — Desktop Figma output (source of truth) required for automation & Contentstack mapping.

## 9. Final open questions log (Day 2: QST-020–QST-027)
- **QST-020** — How many additional resources can be secured for the four parallel squads? _(Determines delivery approach — ASAP.)_
- **QST-021** — Will OM finance pages move to the bank?
- **QST-022** — Who owns compliments/complaints/unclaimed-benefits/IR journeys (in/out of scope)?
- **QST-023** — Naming/structure for financial toolkit & news sections?
- **QST-024** — Exact scope of portfolio-view changes for secure web?
- **QST-025** — What specific approvals are required for template sign-off, and how to accelerate?
- **QST-026** — Optimal cadence/format for ongoing planning sessions?
- **QST-027** — How are articles/news/resource pages handled consistently across audiences?

## 10. Final parking lot (Day 2: PRK-010–PRK-015)
PRK-010 Investor-relations journey ownership; PRK-011 Fund tables & Bulletin asset ownership; PRK-012 Hong Kong YouTube integration (test June / live July); PRK-013 Smaller-site (e.g. Bull & Taylor) quick nav+footer retrofit; PRK-014 Personal vs "personal Coetzee" content-reuse analysis; PRK-015 LTD business-effect check.

## 11. Process & workflow summary (Day 2 delta)
A concrete template lifecycle emerged: **design foundations → template creation → stakeholder engagement → sign-off → development handover → content creation → publishing**, with the **publishing team as final gatekeepers** [DEC-019] and **change control** on red zones [DEC-018]. Delivery is **continuous "micro-drops"** of completed templates/components (starting first two weeks of June), with multiple handovers expected until at least September. Content migration is gated on **content audit + URL mapping per section** as a discovery deliverable [DEC-024, ACT-066]. _Detailed update: [../04_Analysis/process-and-workflow.md](../04_Analysis/process-and-workflow.md)._

## 12. Team responsibility & RACI summary (Day 2 delta)
Clearer Day-2 ownership: **Justin** (IA & URL structure), **Bernice** (content migration & page build), **Seba/Justin** (design foundations), **Rey/Nithin** (engineering, analytics co-location, quality gates), **Gareth & Natalie** (template build + gatekeeping), **Tsoaeli** (Jira integration), **Reza** (tenant agreements with Gareth). Open ownership: OMAR/international content creation, banking-platform integration coordination, legacy decommissioning, several journeys (ISS-010). _RACI remains incomplete for international/cross-platform — see [../04_Analysis/raci.md](../04_Analysis/raci.md)._

## 13. Resourcing & capacity summary (Day 2 delta)
Current capacity is deemed sufficient for **Personal only** [ASM-012]; **two additional developers** are confirmed for engineering. The four-squad model (≈ lead designer + designer + content + tech support per squad) requires **net-new capacity** and immediate onboarding [ACT-064/ACT-067]. Acute constraints: **single points of failure** (Gareth/Natalie/Bernice) [RSK-026] and **key-resource roll-offs** (~Sept 10 migration team; QE in August) [RSK-023]. _Detail: [../04_Analysis/resourcing-and-capacity.md](../04_Analysis/resourcing-and-capacity.md)._

## 14. Technical & systems summary (Day 2 delta)
Contentstack with **co-located content + analytics tagging** [DEC-020]; **modular red/green-zone** template architecture with Figma as source of truth [DEC-017, DEP-022]; **DevOps quality gates + Playwright + linting** [DEC-021]; observability dashboards already started (Loza); analytics via GA + Tableau maintained through migration; **457 pages** on the modular page component; **~150** pages to restyle/move, **~850** to follow once templates/components are ready. _Detail: [../04_Analysis/technical-and-systems.md](../04_Analysis/technical-and-systems.md)._

## 15. Governance & stakeholder summary (Day 2 delta)
A working governance rhythm was established: **single Jira construct**, **twice-weekly 30-minute leadership check-ins**, and a **weekly playback** [DEC-027]; **gatekeeper sign-off** before any page goes live [DEC-019]; **leadership review/sign-off** for cross-version outputs. Stakeholders to be organised into **audience clusters** (Personal, Corporate, Business, Wealth) for IA sign-off and content audit, including legal/compliance. _Detail: [../04_Analysis/stakeholder-and-governance.md](../04_Analysis/stakeholder-and-governance.md)._

## 16. Recommended next steps (next 1–2 weeks)
1. **Leadership decision on four-squad resourcing** [ACT-064 / DEC-016 / QST-020] — the gating decision for year-end ambition.
2. **Consolidate the roadmap** — Bernice consolidation Jun 5; stream leads enter data; Friday Jun 7 leads review [ACT-055/070/078].
3. **Finalise Personal design foundations** by end-June [ACT-065 / DEC-022 / DEP-017].
4. **Map article/news URLs** and begin Personal article migration [ACT-057/058].
5. **Stand up DevOps quality gates + analytics co-location** [ACT-060/061].
6. **Establish the cadence + single Jira board** [ACT-062/069].
7. **Resolve ownership gaps** — additional journeys [ACT-073] and pen-test scope [ACT-072].

## 17. Items requiring executive escalation
- **Resource approval for the four-squad model** [DEC-016 / ACT-064 / QST-020 / ISS-009].
- **Sponsor expectation management** — not all year-end goals will land [RSK-031 / RSK-024].
- **Key-resource roll-offs** (Sept/Aug) and **single points of failure** [RSK-023 / RSK-026].
- **Secure-web portfolio-view clarity** before Sept roll-off [RSK-030 / ISS-011 / QST-024].
- **Security pen-test scope + ServiceNow updates** before go-live [RSK-022 / ACT-072].
- **Tenant funding/operating model & bank ownership** [DEC-026 / DEC-028].

## 18. Follow-up meeting recommendations
- **Friday (Jun 7)** workstream-leads roadmap review (validate consolidated outputs), then a **broader team playback**.
- **Twice-weekly 30-min leadership check-ins** on delivery constraints/dependencies + **weekly template playback** [DEC-027 / ACT-082].
- **PI planning** (~2 weeks) to align the phased model and squad decision.
- **Country-team workshop** on migration process & content audit [ACT-083].
- **Dedicated sessions:** SEO/analytics ownership [ACT-012]; secure-web portfolio-view scope [QST-024]; tenant operating-model agreements [ACT-080].

---
_See [final-executive-summary.md](final-executive-summary.md) for the consolidated two-day record and [../03_Registers/](../03_Registers/) for full register detail with inline supersession notes._
