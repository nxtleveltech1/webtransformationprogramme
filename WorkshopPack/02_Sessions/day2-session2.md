# Day 2 — Session 2: Resourcing, Country/Tenant Model, Tracking & Close

**Source:** SRC-009 (Day 2 Session 2 — Otter recording `0603(3)` + Teams notes/summary).
Format per [Agent.md](../../Agent.md) §"Output Format Required". Mirrors the structure of [day1-session1.md](./day1-session1.md).

> **Day 2 framing:** Session 2 took the delivery model agreed in [day2-session1.md](./day2-session1.md) and worked the **resourcing and operating-model** questions needed to make it real — the four-squad model and its resource gate, the key-resource roll-offs, the secure-web portfolio-view dependency, the country/tenant migration and funding model, journey-ownership gaps, and a unified tracking/cadence — before closing the two-day workshop with a feedback round.

---

## 1. Session metadata

| Field | Detail |
| --- | --- |
| Workshop day | Day 2 |
| Date | 3 June 2026 (compiled 4 June 2026) |
| Session | Session 2 (resourcing, four-squad model, country/tenant model, tracking, close) |
| Location | Cape Town (in-person + Teams) |
| Facilitator | Gareth Bew |
| Scribe | Bertus Goosen |
| Speakers (identified) | Gareth Bew, Rey, Seba (Sebastian), Justin, Bernice, Kameshnee, Tebogo (remote, migration), Kevin, Reza (referenced), Nithin (referenced), Tsoaeli (referenced), Bernice (remote), Siva, Elise (referenced); multiple numbered speakers |
| Teams represented | Programme, Design, Content & Publishing, Design System (OMDS), Execution/Engineering, Secure Web/Migration, Cross Channels, Regional/Country |
| Start / end time | `Not confirmed` (workshop aimed to wrap ~3 PM — `Unconfirmed`) |
| Purpose | Resolve the resourcing/squad model and operating model (country, tenant, bank); surface roll-off and dependency risks; agree unified tracking and leadership cadence; close the workshop |

### Agenda items covered
- Migration status update (feature/journey completion) and roll-off risks
- Secure-web portfolio-view dependency and journey-enhancement scope
- Four-squad parallel delivery model and resourcing requirements
- Journey-ownership gaps (compliments, complaints, unclaimed benefits, etc.)
- Country/site migration model (incl. South Sudan decommission-only, SA-first)
- Tenant operating & funding model; bank ownership of bank pages
- Unified Jira/tracking, stream-lead inputs, leadership cadence & playback
- Roadmap consolidation (raw dataset by Friday) and next steps
- Workshop close — feedback round and reflections

### Agenda items not covered / carried beyond the workshop
- Final resourcing **decision** for the four-squad model (escalation — resource-gated)
- Exact secure-web portfolio-view scope (to be clarified before Sept roll-off)
- Per-country sequencing/effort and tenant funding agreements (post-workshop)
- Integrated roadmap finalisation (Friday + next-week collaborative session)

---

## 2. Detailed discussion notes (by topic)

### 2.1 Migration status update & roll-off risks
- **Summary:** Tebogo reported **11 of 21 planned features migrated (52%)** (plus one sales journey), targeting **71–72% by end-June** and **~90% by end-July**.
- **Key points:** The **EasiPlus** journey is built but **cannot deploy until the web team completes the product pages** (dependency/risk). Outstanding withdrawal sub-journeys include **TFSA, EC class and flex**. The **V2 navigation component is ready** and can be applied to pages once completed. The change-of-personnel-details component issue was **resolved** after a conversation.
- **Risk:** **RSK-023** — the dedicated migration/feature team rolls off **~10 September** and the **most knowledgeable QE rolls off in August**; portfolio view, content updates and journey optimisations are at risk.
- **Dependency / risk:** **DEP-018** / **RSK-029** (EasiPlus blocked on product pages).

### 2.2 Secure-web portfolio-view dependency
- **Summary:** A **major dependency** exists on the **secure-web portfolio view**: the required changes are **not yet visible**, and combined with the team's **end-September roll-off** this blocks planning.
- **Issue / risk / dependency:** **ISS-011** (portfolio-view requirements unclear), **RSK-030** (planning blocked before roll-off), **DEP-020** (requirements needed before end-Sept).
- **Open question:** **QST-024** (exact scope of portfolio-view changes).

### 2.3 Journey-enhancement scope & ownership gaps
- **Summary:** Gareth flagged a decision (by end of day) on whether **journey enhancements** identified during research go into the replatforming backlog or are **out of scope**. Several journeys lack clear business ownership.
- **Key points:** **Elise** to send the **unclaimed-benefits journeys** list to Tebogo for assessment. Ownership unclear for **compliments, complaints, unclaimed benefits, investor relations and corporate unclaimed-benefits** journeys.
- **Issue / action / question:** **ISS-010**, **ACT-073** (identify owners + assess in/out of scope), **QST-022**.

### 2.4 Four-squad parallel delivery model & resourcing
- **Summary:** To avoid linear delivery missing year-end, Gareth proposed **up to four concurrent squads** (Personal, Corporate, Business, Wealth — with Secure alongside), each following the same work cycle. Current capacity, run linearly, only reaches **end of year**.
- **Key points:** Rey recommended a **minimum of a designer + a content person per stream**, scaling to **two lead designers + 4–5 designers**. A **two-person squad** can complete a macro section in a sprint; the full **Personal section ≈ 5 sprints**. The four-squad approach can be **enabled immediately if resource constraints are removed**, with core principles/deliverables unchanged. Onboarding new teams must avoid overloading key people.
- **Decision (resource-gated):** **DEC-016** (Proposed — contingent on additional resources). **Risk:** **RSK-024** (linear delivery misses year-end). **Question / action:** **QST-020** (how many additional resources), **ACT-064** (produce resourced four-squad view + immediate hires/onboarding).
- **Issue:** **ISS-009** (current under-resourcing across all workstreams). **Assumptions:** ASM-012 (current capacity = Personal only), ASM-013 (squad/sprint throughput).

### 2.5 Country / site migration model
- **Summary:** **Country teams own their own migrations** but depend on the central team for **design, IA, navigation structure and content guidelines**. Delivery is **SA-first**, then learnings are applied to roll out other sections/countries (starting with OMAR).
- **Key points:** **South Sudan = decommission-only** (not migration); **Malawi and South Sudan** share similar work requirements, with a **like-for-like "Malawi" option vs full template rework** to be offered with effort/cost. **Kenya** and other countries may have **unique requirements/caveats** to address when applying new templates. Country teams must **audit existing content, map to new audience groupings, and rewrite/create** content as needed, including **legal compliance**. **Smaller sites (e.g. Bull & Taylor)** can be quickly **retrofitted with new navigation + footer** and taken live **without IA change**. For countries **without dedicated content teams**, complete SA sections first then adapt/roll out.
- **Decision:** **DEC-025** (Confirmed intent). **Risk:** **RSK-032** (country teams without content/design resources can't self-migrate). **Actions:** **ACT-063** (country rollout options), **ACT-074** (per-country completion/sequencing), **ACT-083** (migration-process workshop with country teams).
- **Parking lot:** **PRK-012** (Hong Kong YouTube — test June / live July; OMI testing), **PRK-013** (smaller-site retrofits), **PRK-014** (Personal vs "personal Coetzee" reuse).

### 2.6 Tenant operating & funding model
- **Summary:** Sites migrated to the new platform require **formal agreements** clarifying **business ownership and future funding**; post-migration optimisation becomes a **partnership**, with **tenants funding and managing** their own sites going forward.
- **Decision / action:** **DEC-026** (Proposed); **ACT-080** (clarify ownership models + formal agreements). **Asset-ownership follow-up:** **ACT-081** / **PRK-011** (fund tables & Bulletin).

### 2.7 Bank ownership of bank web pages
- **Summary:** The **bank builds its own web pages**; the team is involved **only on a bank-initiated redesign**, with no current timeline. Confirm whether **OM finance pages** currently managed by the team **move to the bank**.
- **Decision / question:** **DEC-028** (Confirmed intent; reinforces Day 1 DEC-013); **QST-021** / **ACT-076** (finance-page move).

### 2.8 Unified tracking, stream-lead inputs & cadence
- **Summary:** Adopt a **single Jira construct** across all teams; **stream leads enter** milestones, priorities, deadlines, dependencies, confidence and owners into the shared roadmap. Run **twice-weekly 30-minute leadership check-ins** focused on delivery constraints/dependencies, plus a **weekly playback**.
- **Key points:** **Tsoaeli** to integrate all team boards into one Jira construct. Stream leads create tickets representing committed deliverables/dependencies. Two additional developers confirmed; planning aligns with **PI planning in ~2 weeks**.
- **Decision / actions:** **DEC-027** (Confirmed); **ACT-062** (cadence + invite), **ACT-069** (single Jira construct), **ACT-070** (stream-lead inputs), **ACT-055** (populate roadmap), **ACT-082** (weekly template playback).
- **Open question:** **QST-026** (optimal cadence/format for ongoing planning sessions).

### 2.9 Roadmap consolidation & next steps
- **Summary:** Gareth set the expectation of a **raw-but-usable integrated dataset by Friday afternoon** rather than a fully concrete one, using "Composer" as a pattern to understand data treatment/structure. A **collaborative review session next week** will refine the integrated roadmap.
- **Key points:** Gareth + Bertus to compile all notes/extractions/recordings into a single spreadsheet; **book consolidation time with Bernice (Jun 5)** and a **Friday leads review (Jun 7)** to hand over refined outputs. **Pen-test scope** for public web (content + journeys) to be clarified with **Nzama**.
- **Actions:** **ACT-078** (Bernice consolidation + Friday review), **ACT-055** (roadmap dataset), **ACT-072** (pen-test scope — links **RSK-022**, **DEP-019**).

### 2.10 Workshop close — reflections & feedback
- **Summary:** Gareth ran a feedback round reflecting on the two days. Participants valued **having all key people in the room** — enabling everyone to be heard and understood and building a shared end-to-end view, relationships and trust.
- **Key points:** **Siva** cautioned against repeating past mistakes and urged **realistic planning** and acknowledgement of all efforts. Justin echoed the value of in-person collaboration. Gareth noted the plan is **flexible and will change multiple times** before year-end, the team is now aligned on goal/approach, and **not all goals will be delivered by year-end** — but the team will have evidence/support to communicate what can be achieved and its value. Written + virtual participant feedback to be collected.
- **Risk:** **RSK-031** (not all year-end goals delivered → sponsor expectation management). **Action:** **ACT-084** (collect participant feedback).

---

## 3. Decisions (this session)
See [../03_Registers/decision-log.md](../03_Registers/decision-log.md). Primary Session 2 IDs:
- **DEC-016** — Four-squad parallel delivery model — **Proposed (resource-gated)**
- **DEC-025** — Country/site delivery (South Sudan decommission-only; SA-first; central design/IA/nav/content) — **Confirmed (intent)**
- **DEC-026** — Tenant operating model (tenants fund & manage own sites) — **Proposed**
- **DEC-027** — Unified Jira + twice-weekly leadership cadence + weekly playback — **Confirmed**
- **DEC-028** — Bank owns its own web pages — **Confirmed (intent)**
- **DEC-024** — Article/news URL structure deferred pending IA — **Deferred** (shared with Session 1)

Per Agent.md, **DEC-016** and **DEC-026** remain **Proposed** (resource/agreement decisions not finalised); the others are agreed as intent/confirmed.

## 4. Actions (this session)
See [../03_Registers/action-register.md](../03_Registers/action-register.md). Session 2 IDs include: **ACT-062** (cadence), **ACT-063** (country rollout options), **ACT-064** (resourced four-squad view), **ACT-069** (single Jira construct), **ACT-070** (stream-lead inputs), **ACT-072** (pen-test scope), **ACT-073** (journey owners), **ACT-074** (per-country completion/sequencing), **ACT-076** (OM finance pages → bank), **ACT-078** (Bernice consolidation + Friday review), **ACT-079** (Hong Kong YouTube), **ACT-080** (tenant ownership/agreements), **ACT-081** (fund tables & Bulletin owners), **ACT-083** (country-team workshop), **ACT-084** (feedback). Full Day 2 range is ACT-055–ACT-084.

## 5. Risks (this session)
See [../03_Registers/risk-log.md](../03_Registers/risk-log.md). Surfaced/most relevant here: **RSK-023** (key-resource roll-offs ~Sept 10 / QE August), **RSK-024** (linear delivery misses year-end), **RSK-029** (EasiPlus blocked on product pages), **RSK-030** (secure-web portfolio-view unclear before roll-off), **RSK-031** (not all year-end goals delivered), **RSK-032** (country teams without content/design resources), **RSK-022** (pen-test scope unconfirmed). Full Day 2 range is RSK-023–RSK-032.

## 6. Issues (this session)
See [../03_Registers/issue-log.md](../03_Registers/issue-log.md). Day 2 live issues: **ISS-009** (under-resourcing across all workstreams), **ISS-010** (unclear ownership of compliments/complaints/unclaimed-benefits/investor-relations/corporate-unclaimed-benefits journeys), **ISS-011** (secure-web portfolio-view requirements unclear).

## 7. Dependencies (this session)
See [../03_Registers/dependency-log.md](../03_Registers/dependency-log.md). Session 2 IDs: **DEP-018** (product pages before EasiPlus), **DEP-019** (IA sign-off per audience, sequential), **DEP-020** (secure-web portfolio-view requirements before Sept roll-off), **DEP-021** (template handover cadence feeds content/build). Full Day 2 range is DEP-017–DEP-022.

## 8. Open questions (this session)
See [../03_Registers/open-questions.md](../03_Registers/open-questions.md). Session 2 IDs: **QST-020** (additional resources for four squads), **QST-021** (OM finance pages → bank), **QST-022** (journey ownership), **QST-023** (financial-toolkit/news naming), **QST-024** (portfolio-view scope), **QST-026** (planning cadence/format). Full Day 2 range is QST-020–QST-027.

## 9. Parking lot (this session)
See [../03_Registers/parking-lot.md](../03_Registers/parking-lot.md). Session 2 IDs: **PRK-010** (investor-relations journey ownership), **PRK-011** (fund tables & Bulletin), **PRK-012** (Hong Kong YouTube integration), **PRK-013** (smaller-site quick retrofit), **PRK-014** (Personal vs "personal Coetzee" reuse), **PRK-015** (LTD business-effect check). Full Day 2 range is PRK-010–PRK-015.

## 10. Clarifications required
- **Session date:** **3 June 2026** (confirmed; recording filename `0603`). The "4 June" seen in some source summaries is the compilation/capture date, not the session date.
- **Migration % attribution:** the 52% / 11-of-21 status is attributed to **Tebogo** in the meeting notes but to **Kameshnee** in one Otter overview — Tebogo adopted here per the risk log (RSK-023) — `Clarification required`.
- **Roll-off dates:** "~10 September" (team) and "August" (QE) are as stated in source notes — owner/exact dates `Unconfirmed`.
- **Squad count vs sections:** "four squads" maps to Personal/Corporate/Business/Wealth, with Secure referenced as additional/alongside — exact squad-to-section mapping `Open` pending the resourced four-squad view (ACT-064).
- **Site/name spellings:** "personal Coetzee", "Bull & Taylor", "Bernice", "Tsoaeli", "Nzama", "Vallabh", "Reza" are transcribed names — spellings/roles `Unconfirmed`.
- **Tenant funding model:** DEC-026 remains **Proposed**; agreements and named owners not yet defined (`Open`, ACT-080/081).
