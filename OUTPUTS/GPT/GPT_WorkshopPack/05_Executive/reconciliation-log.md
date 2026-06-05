# Input Reconciliation Log — Day 1 Provisional

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Date:** 2026-06-03  
**Purpose:** Document audit of all workshop inputs, conflicts resolved, and items requiring human validation before executive publish.

---

## Sources audited

| Src | File | Status |
| --- | --- | --- |
| SRC-001 | `Documents/_extracted/Day 1 Session 1 teams summary.txt` | Authoritative — ingested |
| SRC-002 | `Documents/_extracted/Web_Migration_Workshop_Summary_v5_final_integrated.txt` | Authoritative — ingested |
| SRC-003 | `Documents/_extracted/Day 1 Session 1 teams transcript.txt` | Partial/noisy — attribution only |
| SRC-004 | `Documents/Transcirpts/Web Transformation - 2 Day Planning Workshop (Day 1 ).vtt` | **Excluded** — duplicate of SRC-003 |
| SRC-005 | `Documents/_extracted/Day 1 - Session 2 - Teams notes.txt` | Authoritative — S2 delta + follow-up list |
| SRC-006 | `Documents/_extracted/Day 1 - Session 3 - Teams Notes.txt` | Authoritative — S3 delta + scope debate |
| SRC-007 | `Documents/Transcirpts/Day 1 Session 1.md` | Reconciled — see below |
| — | `Roadmap/ChatGPT Image May 14, 2026, 03_54_11 PM.png` | Visual cross-check only — lifecycle aligns with Define→Go Live; no new IDs |
| — | `Documents/Transcirpts/Day 1 Session 2.md`, `Day 1 Session 3.md` | Stubs — superseded by WorkshopPack session files |

---

## SRC-007 (Session 1.md) — conflict resolution

The Otter/Teams export uses a **different decision numbering** than WorkshopPack (Agent.md IDs). **WorkshopPack IDs are retained** as the single source of truth.

| Session 1.md ID | Session 1.md topic | WorkshopPack disposition |
| --- | --- | --- |
| DEC-001 | Template-based approach with controlled flexibility | **Not merged as DEC-001** — content supports DEC-006, DEC-008, QST-014; template governance in ACT-003/042 |
| DEC-002 | Country sites migrate to new platform | Aligns with **DEC-004** (dependencies) / regional scope — no new ID |
| DEC-003 | Tenant model consideration for foundations | **PRK-002** / future-state — not current migration scope |
| DEC-004 | SEO during design + publishing | Aligns with **DEC-011**, **ACT-040** — no new ID |

### Session 1.md items ingested as deltas (no ID override)

| Topic | Action |
| --- | --- |
| In-scope site list (Onkoza, Myo Mutual, EQG, Symmetry, etc.) | Added to [project-brief.md](../01_Context/project-brief.md) §9 with `[validate]` flags |
| Studio asset request delays (~30 min waits) | Not promoted to ISS-009 — overlaps content/asset readiness (ACT-019, ISS-002); noted here for human validation |
| 99.7% availability SLA; 34% organic traffic | Added to project-brief metrics where stated in SRC-007 |
| Stakeholder SME commitment (ASM-001 theme) | Already ASM-001; reinforced in reconciliation only |

### Session 1.md items rejected (duplicate or weaker evidence)

| Item | Reason |
| --- | --- |
| Alternate ACT/RSK/ISS numbering (ACT-001 foundations stress test as Critical) | Superseded by WorkshopPack ACT-001–054 with SRC-002 whiteboard + S2/S3 tasks |
| "Day 1 incomplete — ended during design deep dive" | **Incorrect** relative to SRC-005/006 — Day 1 continued through S2/S3; Session 1.md is partial export only |
| Speaker name variants (Tobacco→Tebogo, Sebs→Sebabatso, Nitin Z→Nithin) | Normalised in people-and-teams; not treated as new facts |

---

## Cross-artifact gaps found (pre-export)

| Gap | Resolution |
| --- | --- |
| Excel Action Log ~32 rows vs 54 ACT | Full sync via `scripts/export_workshop_pack.py` |
| Excel Dependencies Dep-1..7 vs DEP-016 | Normalise to DEP-xxx; full 16 rows |
| Excel RAID mixed RSK/ISS | Split consistent Type + ID columns |
| HTML RAID tab curated subset of ACTs | Regenerate full ACT-001–054 and RSK-001–022 tables |
| Basic View / Stream Inputs mostly TBC | Workshop callouts only; no invented lead inputs |

---

## Human validation required (do not treat as confirmed)

1. **Faoli Bank** — spelling and legal brand name (QST-017, DEC-013).
2. **Onkoza / Fullertela / Omkom** — site names from SRC-007 transcript (validate spelling).
3. **"Kash"** — OMAR publishing/migration split owner surname.
4. **PGW, QAG, MFC, LV** — acronym expansions in glossary.
5. **Amy / Mary** — S3 transcript names; likely artefacts.
6. **Megan, Marlana, Joanne, Orisha, André** — surnames unconfirmed.
7. **Session 1.md DEC model** — do not use in steering packs; use DEC-001–014 only.

---

## Publish stamp

- **WorkshopPack:** Day 1 provisional — re-baseline after Day 2  
- **xlsx / HTML:** Agent revision 2026-06-03 — source WorkshopPack  
- **Next ingestion:** Day 2 files → SRC-008+ → DEC-015 / ACT-055+
