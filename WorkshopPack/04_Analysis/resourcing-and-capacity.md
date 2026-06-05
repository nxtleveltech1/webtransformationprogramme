# C. Resourcing & Capacity

**Source:** SRC-001, SRC-002 (Day 1); SRC-008 (D2S1), SRC-009 (D2S2) — Day 2 re-baseline.

## Confirmed capacity position

| Function | Current capacity | Constraint |
| --- | --- | --- |
| Publishing | 2 publishers: 1 FT migration, 1 BAU (14 sites + secure + app support) | No dedicated OMAR publisher; Wealth has one |
| Copywriting | Constrained | Heavy consolidation workload |
| Design | Constrained | Volume vs parallel rollout demand |
| Front-end dev (Cross Channels) | Exiting after PI2 → Web Platform | Continuity risk |
| Business Analysis (Cross Channels) | Reduced — extended medical leave; recruitment in progress | Slows requirements |
| Automation/testing | Daniel — limited capacity | Blocks AI/automated testing ambitions |
| Cluster / Product SMEs | Not dedicated | Content/sign-off bottleneck |

## Capacity facts
- New-template page ~2h; as-is page ~30min.
- ~1,530 OMAR pages (1 Jun); scope reduced 2,500 → ~1,000.
- 85 BAU tickets cleared in 5 days (during Natalie's leave) — illustrates BAU drag.
- GB position: capacity discussion should focus on **what's required to hit goals**, not just current capacity; right skills must be in place; quality must not be compromised by capacity.

## Required roles / additional support (surfaced)
- Dedicated OMAR publishing capacity (ACT-003).
- Interim BA capacity (ACT-022).
- Post-PI2 front-end transition plan + Web Platform capacity/prioritisation model (ACT-021).
- Dedicated SMEs for content creation.
- Dedicated cluster capacity for content validation/sign-off/localisation.

## Capacity risks (cross-ref)
RSK-002 (publishing), RSK-005 (regional cuts), RSK-006 (automation), RSK-017 (front-end exit), RSK-018 (BA). No clear capacity if design/DS/content/publishing scale in parallel.

## Resourcing decisions vs concerns
- **Decision (proposed):** ring-fence dedicated migration publisher (DEC-010).
- **Concerns (not decided):** overall under-resourcing; need to re-baseline demand by stage and secure dedicated capacity from clusters + central teams.

## Capacity model action
Build a capacity model against the 1,530-page baseline incl. remediation for hardcoded content, carousel decisions, template/component complexity (ACT-005).

## Sessions 2 & 3 additions
- **Single-publisher exposure (Natalie):** one person covers publishing across everything; any small change (e.g. adding an ad) means touching every page, and the end-loaded timeline is a concern (ISS-007, reinforces RSK-002).
- **Team-structure change:** from the upcoming IP/PI sprint, new resources (e.g. **Debs**) join the new team structure; Cross Channels front-end shifts to Web Platform (RSK-017).
- **Coordination capacity:** cross-stream coordination is the identified grey area, not in-stream skill (delivery risk).

---

# Day 2 re-baseline / update (SRC-008 D2S1, SRC-009 D2S2)

> Day 1 established that the programme is under-resourced. Day 2 converted that into a **sizing model**: a defined squad composition, a four-squad parallel target, an explicit assumption that *current capacity covers Personal only*, named key-resource roll-offs, and identified single points of failure. The four-squad model is **proposed but resource-gated** (DEC-016) — not yet a confirmed resourcing decision.

## C1. Four-squad model & sizing (DEC-016)

- **Squad composition (stated):** **lead designer + designer + content person + technical support** per squad (Rey's minimum: designer + content person per stream; recommended structure of lead designers + 4–5 designers across squads).
- **Target:** up to **four concurrent squads — one per audience** (Personal, Corporate, Business, Wealth; Secure sequenced alongside) to avoid linear delivery.
- **Sizing rules (assumptions, to validate):**
  - A **two-person squad ≈ one macro section per sprint** (ASM-013).
  - **Full Personal section ≈ 5 sprints** (ASM-013).
  - ~**2 hours/page** build over ~**850 pages** once templates/components are ready (ASM-014).
  - ~**60% of modules known now**, remainder firmed section-by-section (ASM-015); template/component parallel build feasible (ASM-016).
- **Status:** **Proposed (resource-gated)** — can be enabled *immediately if resource constraints are removed*; core principles/deliverables unchanged either way. Contingent on QST-020 (how many extra resources) and ACT-064 (resourced four-squad view). Owner: Programme Leadership / Seba.

## C2. Capacity-for-Personal-only assumption (ASM-012)

- **Current team capacity is assumed sufficient for the Personal segment ONLY**, not all segments concurrently. With current capacity, the end-to-end view runs **to the end of the year** (Seba).
- **Risk if wrong:** year-end slip if more segments are expected in parallel without added capacity → ties to RSK-024 (linear delivery misses year-end) and ISS-009 (under-resourcing across all workstreams).
- Validation route: the four-squad resourcing view (ACT-064).

## C3. Key-resource roll-offs (RSK-023)

| Resource | Roll-off | Impact |
| --- | --- | --- |
| Migration/feature delivery team (Tebogo's area) | ~**September 10** | Portfolio view, content updates, journey optimisations at risk; secure-web planning pressure |
| Most knowledgeable **QE** | **August** | Quality-engineering knowledge loss before peak delivery |

- Mitigation: accelerate delivery, **knowledge transfer**, backfill (ACT-064); aggravates secure-web portfolio-view dependency (DEP-020, RSK-030, ISS-011).

## C4. Single points of failure (RSK-026)

- **Template build:** only **Gareth & Natalie** currently build templates.
- **Publishing + content:** **Natalie** (single publisher across everything — ISS-007) and **Bernice** (publishing + content migration) are overloaded; any small change can mean touching every page.
- **Gareth** is the de-facto coordination hub across all streams.
- Mitigation: additional capacity + training + tenant/team **onboarding to standards** (ACT-064, ACT-067).

## C5. Migration-team capacity snapshot (D2S1, Tebogo)
- **11 of 21 features migrated (52%)**; target **71–72% by end-June**, **~90% by end-July**.
- Easy Plus journey built but **cannot deploy until product pages complete** (DEP-018, RSK-029).
- Two additional developers confirmed to proceed with remaining tasks/iterative releases; align with upcoming PI planning (~2 weeks).

## C6. Resourcing decisions vs concerns (Day 2)
- **Decision (proposed, resource-gated):** four-squad parallel model (DEC-016).
- **Assumption (to validate):** capacity covers Personal only (ASM-012).
- **Concerns / open:** onboarding/support for **external/country teams with limited resources** is undecided (RSK-032); capacity allocation for the four-squad approach unresolved (QST-020); cross-stream coordination remains the grey area.
