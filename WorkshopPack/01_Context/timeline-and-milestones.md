# Timeline & Milestones

**Source:** SRC-001, SRC-002 (Day 1); SRC-008 (Day 2 Session 1), SRC-009 (Day 2 Session 2).
Dates are as stated in source material. Unstated dates are marked `Not confirmed`.

> **Day 2 re-baseline (2026-06-04):** Day 1 fixed constraints (incl. the end-November migration date) are **preserved unchanged** below. Day 2 added a **phased, audience-based delivery schedule** (Personal first), a template/component cadence, and several dated dependencies and roll-offs — captured in the new **Day 2** section. Day 2 also confirmed that **linear delivery will not meet year-end** (`RSK-024`/`RSK-031`).

---

## Fixed constraints

| Item | Detail | Confidence |
| --- | --- | --- |
| **Migration end date** | **End of November** — budget-constrained, previously considered December. **Will not move.** | Confirmed |
| Effective timeline | Referenced as a **five-month** delivery window; MVP deliverable for the five-month timeline still to be defined (`QST`) | Confirmed (window) / open (MVP) |
| Page baseline date | OMAR ~**1,530 pages as of 1 June** | Confirmed |

---

## Delivery increments (PI)

| Increment | Focus / events | Confidence |
| --- | --- | --- |
| End of current PI | Most Cross Channels **front-end dev resources move out** to Web Platform team | Confirmed |
| PI2 | Calculators nearly ready for Beta deployment; from end of PI2 Cross Channels depends on Web Platform for all front-end work | Confirmed |
| PI3 | Focus on **Contact Us** page + additional calculators without owners (pending discussion with Keshvi & Luvuyo) | Confirmed |

---

## End-to-end lifecycle (target sequencing)

A single interconnected lifecycle with a visible progress tracker is required across:

```
Define -> Discovery -> Design -> Approval -> Handover -> Support -> Go Live
```

The tracker should show **workplan, milestones, assumptions, dependencies and impact** — not just % complete. Beta/Staging readiness must be linked to design, content, DS, platform build and publishing readiness. See [../04_Analysis/process-and-workflow.md](../04_Analysis/process-and-workflow.md).

---

## Environment sequencing

```
Contentstack -> Beta / Staging -> Production -> Live Testing -> Tooling
```

- Beta environment must support parallel/staging validation of navigation, taxonomy, APIs, tooling and design-system components.
- Architecture decision for Beta/Staging/Production + tooling ownership still required (`DEC`, rated Medium-High risk).

---

## Migration progress snapshot (Day 1)

| Metric | Value | Confidence |
| --- | --- | --- |
| OMAR page inventory | ~1,530 (1 Jun) | Confirmed |
| In-scope page count trajectory | Reduced from ~2,500 to ~1,000 so far | Confirmed |
| Pages already moved | ~60 moved; further migration **paused** pending article restyle-vs-retain decision | Confirmed |
| Botswana servicing transactions | 1 of 9 complete | Confirmed |
| New-template build rate | ~2 h / page | Confirmed |
| As-is build rate | ~30 min / page | Confirmed |
| BAU throughput reference | 85 BAU tickets cleared in 5 days (during Natalie's leave) | Confirmed |

---

## Key dated / sequenced dependencies

| Dependency | Lead time / timing | Confidence |
| --- | --- | --- |
| SEO tagging & validation | SEO team needs **≥ 2 months** lead time before QA | Confirmed |
| Publishing start | Only after Contentstack dev complete + content/assets/URLs signed off | Confirmed |
| Testing start | Only after all pages built in Beta | Confirmed |
| EasiPlus sales journey | Depends on Funeral product page template + MFC sign-off | Confirmed |
| Design System V2 to Beta | Blocks Find an Advisor Beta readiness + new template impact | Confirmed |

---

## Day 2 re-baseline — phased delivery schedule (SRC-008 D2S1, SRC-009 D2S2)

### Phased rollout sequence `DEC-015`
```
Personal (foundations END-JUNE → section live ~END-JULY)
   → Corporate → Business → Wealth     (Secure web sequenced alongside)
```

### Key Day 2 dated milestones
| Milestone | Date / timing | Confidence | Source |
| --- | --- | --- | --- |
| Personal **design foundations** sign-off (IA + core templates + generic content guidelines) | **End-June** | Confirmed (target) `DEC-022` | SRC-008 |
| Core template structures (section / category / landing) handed to dev | **End-June** | Confirmed (target) | SRC-008 |
| **Personal section live** | **~End-July** | Confirmed (target) `DEC-015` | SRC-008 |
| Corporate & Wealth landing pages / macro sections "drop" | **First two weeks of July** | Confirmed (target) | SRC-008 |
| DevOps quality gates + Playwright + linting | **Initial rollout end-June**, reporting begins | Confirmed `DEC-021` | SRC-008 |
| Micro-drops of completed templates/components | **Begin first two weeks of June** | Confirmed | SRC-008 |
| Bernice Excel/notes consolidation session | **Jun 5** | Confirmed `ACT-078` | SRC-009 |
| Workstream-leads roadmap review | **Fri Jun 7** | Confirmed | SRC-008/009 |
| Raw-but-usable integrated roadmap dataset | **Fri afternoon (Jun 7)** | Confirmed (target) | SRC-008 |
| PI planning alignment | **~2 weeks out** | Confirmed (reference) | SRC-008 |
| Hong Kong live YouTube integration | **Test June / go-live July** (OMI test June; Vallabh review July) | Confirmed (target) `PRK-012`/`ACT-079` | SRC-008 |

### Template & build cadence (effort references)
| Item | Estimate | Source |
| --- | --- | --- |
| Template structure build | ~**5 days** (component dev takes longer, depends on DS process) | SRC-008 |
| Per-template incl. design + sign-off | ~**2 weeks** (sign-off/testing may extend) | SRC-008 |
| Macro section by a 2-person squad | ~**1 sprint** | SRC-008/009 |
| Full Personal section | ~**5 sprints** | SRC-008 |
| New-template page build | ~**2 h / page** (~850 pages) | SRC-008 |

### Migration progress snapshot (Day 2 — Cross Channels features)
| Metric | Value | Source |
| --- | --- | --- |
| Features migrated | **11 of 21 (52%)** | SRC-008/009 (Tebogo) |
| Target end-June | **71–72%** | SRC-008/009 |
| Target end-July | **~90%** | SRC-008/009 |
| EasiPlus journey | Built; **blocked** on product pages (`RSK-029`, `DEP-018`) | SRC-008/009 |
| Pages to restyle & move | **~150** (~140 personal articles) | SRC-008 |
| Pages remaining unchanged | **~850** (August "too late" for these) | SRC-008 |
| Modular-component pages | **457** (metadata + URL breakdown required) | SRC-008 |

### Critical roll-off / resource dates (timeline risks)
| Event | Timing | Risk | Source |
| --- | --- | --- | --- |
| Migration / feature team roll-off | **~Sept 10** | `RSK-023` | SRC-009 |
| Most knowledgeable QE roll-off | **August** | `RSK-023` | SRC-009 |
| Secure-web portfolio-view requirements needed before roll-off | **Before end-Sept** | `RSK-030`, `DEP-020` | SRC-008 |

### Cadence (governance) `DEC-027`
- **Twice-weekly 30-minute** leadership check-ins (delivery constraints/dependencies).
- **Weekly playback** of template progress to the technical team.
- Single **Jira** construct for unified tracking (Tsoaeli).

> **Timeline reality (Day 2):** the end-November migration constraint is unchanged, but Day 2 confirmed the plan is **flexible and will change repeatedly**, and that **not all goals will be delivered by year-end** under current capacity (`RSK-024`/`RSK-031`). Dates above are **targets** stated in-session, not externally baselined commitments — `Open` until the integrated roadmap is signed off (Fri Jun 7 onward).
