# Web Transformation Workshop Pack — Master Index

**Programme:** Old Mutual Web Transformation / Migration Programme
**Workshop:** Two-Day Planning Workshop (Cape Town) — **Day 1: 2 June 2026, Day 2: 3 June 2026** (pack compiled 4 June 2026)
**Facilitator:** Gareth Bew
**Pack compiled by:** Workshop AI Notetaking & Analysis Agent (per [Agent.md](../Agent.md))
**Status:** Day 1 & Day 2 fully populated and re-baselined — two-day pack published.
**Last updated:** 2026-06-04

---

## How to use this pack

This is the single source of truth for the workshop. It is built and maintained strictly according to the capture framework, register schemas, ID conventions and quality rules defined in [Agent.md](../Agent.md).

Every register entry carries a source reference (day / session / speaker / topic) for traceability. Items are never invented: where ownership, dates, or decision status are unclear they are explicitly marked `Unconfirmed`, `Open / unresolved`, or `Clarification required`.

---

## Navigation

### 01 — Context (persistent memory)
| File | Purpose |
| --- | --- |
| [project-brief.md](01_Context/project-brief.md) | Programme purpose, scope, objectives, success metrics, constraints |
| [glossary.md](01_Context/glossary.md) | Terms, acronyms, systems — with validation flags |
| [people-and-teams.md](01_Context/people-and-teams.md) | Stakeholders, roles, teams represented |
| [timeline-and-milestones.md](01_Context/timeline-and-milestones.md) | Deadlines, PIs, milestones, sequencing |

### 02 — Sessions
| File | Purpose |
| --- | --- |
| [day1-session1.md](02_Sessions/day1-session1.md) | Day 1 Session 1 full record (per Agent.md output format) |
| [day1-session2.md](02_Sessions/day1-session2.md) | Day 1 Session 2 record (Cross Channels detail + follow-up task list) |
| [day1-session3.md](02_Sessions/day1-session3.md) | Day 1 Session 3 record (closing reflections, scope-options debate) |
| [day2-session1.md](02_Sessions/day2-session1.md) | Day 2 Session 1 record (delivery model, red/green-zone templates, phasing, governance) |
| [day2-session2.md](02_Sessions/day2-session2.md) | Day 2 Session 2 record (resourcing, roll-offs, secure web, ownership, close) |

### 03 — Registers (RAID + decisions/actions/questions/parking lot)
| File | ID Prefix | Purpose |
| --- | --- | --- |
| [decision-log.md](03_Registers/decision-log.md) | DEC | Decisions (confirmed / proposed / deferred / rejected / unclear) |
| [action-register.md](03_Registers/action-register.md) | ACT | Actions with owners, due dates, priority |
| [risk-log.md](03_Registers/risk-log.md) | RSK | Risks with probability/impact/mitigation |
| [issue-log.md](03_Registers/issue-log.md) | ISS | Live issues |
| [assumptions-log.md](03_Registers/assumptions-log.md) | ASM | Assumptions to validate |
| [dependency-log.md](03_Registers/dependency-log.md) | DEP | Cross-team / workstream dependencies |
| [open-questions.md](03_Registers/open-questions.md) | QST | Open questions |
| [parking-lot.md](03_Registers/parking-lot.md) | PRK | Deferred / parked items |

### 04 — Analysis (cross-cutting lenses A–G)
| File | Lens |
| --- | --- |
| [process-and-workflow.md](04_Analysis/process-and-workflow.md) | A. Business process & workflow |
| [raci.md](04_Analysis/raci.md) | B. Team responsibilities & RACI |
| [resourcing-and-capacity.md](04_Analysis/resourcing-and-capacity.md) | C. Resourcing & capacity |
| [technical-and-systems.md](04_Analysis/technical-and-systems.md) | D. Technical & systems |
| [delivery-and-programme.md](04_Analysis/delivery-and-programme.md) | E. Delivery & programme management |
| [stakeholder-and-governance.md](04_Analysis/stakeholder-and-governance.md) | F. Stakeholder & governance |
| [change-adoption-comms.md](04_Analysis/change-adoption-comms.md) | G. Change, adoption & communications |

### 05 — Executive outputs
| File | Purpose |
| --- | --- |
| [day1-executive-summary.md](05_Executive/day1-executive-summary.md) | Day 1 executive summary |
| [day2-executive-summary.md](05_Executive/day2-executive-summary.md) | Day 2 executive summary (scaffold) |
| [final-executive-summary.md](05_Executive/final-executive-summary.md) | Final two-day executive output, 15-section (scaffold) |
| [reconciliation-log.md](05_Executive/reconciliation-log.md) | Input audit, SRC-007 conflicts, human-validation flags |
| [qa-report.md](05_Executive/qa-report.md) | Cross-artifact QA (Day 1 publish) |

### Published artefacts (Day 1 provisional)
| File | Purpose |
| --- | --- |
| [Web_Transformation_Workshop Working Doc - 2_export.xlsx](Web_Transformation_Workshop%20Working%20Doc%20-%202_export.xlsx) | Full register export (54 ACT, 30 RAID, 16 DEP) — **replace main xlsx when unlocked** |
| [Web_Transformation_Workshop Working Doc - 2.xlsx](Web_Transformation_Workshop%20Working%20Doc%20-%202.xlsx) | Facilitator working tracker (overwrite from `_export` when file not locked) |
| [../Roadmap/portfolio-exec-2026-06-03.html](../Roadmap/portfolio-exec-2026-06-03.html) | Executive HTML dashboard |
| [scripts/export_workshop_pack.py](scripts/export_workshop_pack.py) | Re-export xlsx + HTML from `workshop_data.py` |

---

## Source register / traceability index

| Src ID | Source file | Type | Day | Authoritative for | Status |
| --- | --- | --- | --- | --- | --- |
| SRC-001 | `Documents/Transcirpts/Day 1 Session 1 teams summary.docx` | Teams auto-summary + structured notes | 1 | Day 1 decisions, open questions, meeting notes | Ingested |
| SRC-002 | `Documents/Transcirpts/Web_Migration_Workshop_Summary_v5_final_integrated.docx` | Whiteboard synthesis (6 workstreams) | 1 | Day 1 workstream notes, risks, actions, consolidated risk view | Ingested |
| SRC-003 | `Documents/Transcirpts/Day 1 Session 1 teams transcript.docx` | Partial Teams transcript | 1 | Speaker attribution (partial) | Ingested (partial / noisy) |
| SRC-004 | `Documents/Transcirpts/Web Transformation - 2 Day Planning Workshop (Day 1 ).vtt` | Raw VTT transcript | 1 | — (duplicate of SRC-003) | Excluded — confirmed duplicate |
| SRC-005 | `Documents/Transcirpts/Day 1 - Session 2 - Teams notes.docx` | Teams notes (S2 transcript head + meeting-wide summary + follow-up task list) | 1 | Day 1 follow-up task list (owners), Cross Channels detail | Ingested |
| SRC-006 | `Documents/Transcirpts/Day 1 - Session 3 - Teams Notes.docx` | Teams notes (S3 transcript head + meeting-wide summary + follow-up task list) | 1 | Day 1 closing reflections, scope-options debate, secure-web/EasiPlus detail | Ingested |
| SRC-007 | `Documents/Transcirpts/Day 1 Session 1.md` | Parallel Otter/Teams AI export (~790 lines) | 1 | Site list, template-governance detail, metrics — **reconciled; IDs not adopted** | Reconciled — see [reconciliation-log.md](05_Executive/reconciliation-log.md) |
| SRC-008 | `Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 SESSION 1.docx` | Day 2 Session 1 (Otter summary + Teams notes + exec summary + follow-up tasks) | 2 | Day 2 delivery model, red/green-zone templates, phasing, governance, automation, foundations | Ingested |
| SRC-009 | `Documents/Transcirpts/daY 2/DAYS 2 - SESSION 2/DAY 2 - SESSION 2.docx` | Day 2 Session 2 (Otter summary + Teams notes + exec summary + follow-up tasks) | 2 | Day 2 resourcing/roll-offs, secure-web portfolio view, country model, ownership, close | Ingested |

> Note: Day 2 source docs reused Day 1 register IDs (DEC-001 etc.). These were **not** adopted — Day 2 entries continue the existing pack sequence (DEC-015+, ACT-055+, …) with supersession recorded in the [reconciliation-log.md](05_Executive/reconciliation-log.md).

> Note: SRC-005 and SRC-006 share an identical meeting-wide summary/decisions/open-questions/follow-up body (Teams attaches the whole-meeting summary to each session). Only the transcript head of each and the follow-up task list carry new information beyond SRC-001/002.

> **Agent deliverables (Cursor):** All agent-owned versions live in **[OUTPUTS/CURSOR](../OUTPUTS/CURSOR/README.md)** — xlsx, HTML, and full WorkshopPack mirror. Re-export via `scripts/export_workshop_pack.py`.

> **Publish status:** Two-day pack (Day 1 + Day 2) published. Executive xlsx + HTML + CURSOR mirror regenerated 2026-06-04 from WorkshopPack via `scripts/export_workshop_pack.py` (Actions 84, RAID 43, Dependencies 22). Canonical in-pack xlsx was locked at regeneration time — current copy lives in `OUTPUTS/CURSOR/` and the `_export.xlsx` staging file; overwrite the canonical when Excel is closed.

> New Day 2 files dropped into `Documents/` are appended here as SRC-005, SRC-006, … before ingestion.

---

## ID allocation tracker

To prevent ID collisions as Day 2 entries are added. "Next free" is the next ID to assign.

| Register | Prefix | Highest used | Next free |
| --- | --- | --- | --- |
| Decisions | DEC | DEC-028 | DEC-029 |
| Actions | ACT | ACT-084 | ACT-085 |
| Risks | RSK | RSK-032 | RSK-033 |
| Issues | ISS | ISS-011 | ISS-012 |
| Assumptions | ASM | ASM-016 | ASM-017 |
| Dependencies | DEP | DEP-022 | DEP-023 |
| Open questions | QST | QST-027 | QST-028 |
| Parking lot | PRK | PRK-015 | PRK-016 |
| Trade-offs (data SSOT) | TO | TO-9 | TO-10 |

---

## Ingestion log

| Date | Action | Sources | Notes |
| --- | --- | --- | --- |
| 2026-06-03 | Initial pack build | SRC-001, SRC-002, SRC-003 | Day 1 context, session record, all 8 registers, analysis views and Day 1 executive summary populated. VTT (SRC-004) confirmed duplicate and excluded. |
| 2026-06-03 | Ingest Day 1 Sessions 2 & 3 | SRC-005, SRC-006 | Added Session 2 & 3 records; extended registers (DEC-012–014, ACT-025–054, RSK-019–022, ISS-007–008, ASM-010–011, DEP-013–016, QST-016–019, PRK-008–009); enriched owners (Natalie, Nithin, Wayne, Megan, Daniel, Orisha) and surnames (Wayne Moodley, Bertus Goosen); added Faoli Bank, new stakeholders; refreshed analysis views and Day 1 executive summary. |
| 2026-06-03 | Reconcile SRC-007 + publish exec pack | SRC-007 + WorkshopPack | Reconciliation log; project-brief site supplement; full xlsx + HTML export (ACT-001–054, RAID parity). |
| 2026-06-04 | Ingest Day 2 + full two-day re-baseline | SRC-008, SRC-009 | Extracted Day 2 text to `Documents/_extracted`. Extended all 8 registers (DEC-015–028, ACT-055–084, RSK-023–032, ISS-009–011, ASM-012–016, DEP-017–022, QST-020–027, PRK-010–015) + trade-offs TO-7–9. Re-baselined Day 1 statuses (DEC-001/006/007/008/009/012, RSK-001/019/022) with supersession notes. Added Day 2 session records; refreshed context, analysis, executive outputs; updated data SSOT and regenerated xlsx + HTML + CURSOR mirror. |

---

## Conventions (from Agent.md)

- **Decision status:** Confirmed / Proposed / Deferred / Rejected / Unclear. Only mark Confirmed if the workshop clearly agreed it.
- **Action status:** New / In progress / Blocked / Done / Unconfirmed. Unstated owner = `Unassigned`; unstated due date = `Not confirmed`; implied-only = `Suggested action`.
- **Uncertainty flags:** `Unconfirmed`, `Open / unresolved`, `Clarification required`, `Transcript unclear — requires human validation`.
- **Traceability:** every major entry references Day, Session, Speaker (if identifiable) and Topic.
