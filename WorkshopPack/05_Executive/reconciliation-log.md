# Input Reconciliation Log — Day 1 Provisional

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

## App database alignment (2026-06-04)

- **Deck SSOT for workstream leads:** [../01_Context/workshop-deck-ownership.md](../01_Context/workshop-deck-ownership.md) — full names (Sebabatso Mtimkulu, Bernice Bryce, Luvuyo Mkumatela, etc.).
- **Seed sync:** `npm run db:sync-seed` regenerates `prisma/seed/workshop-data.generated.ts` from `workshop_data.py` (Day 2 totals: 28 DEC, 84 ACT, 32 RSK, 11 ISS, 22 DEP).
- **Parity check:** `npm run db:audit` compares deck mapping vs Neon `Workstream` rows.
- **RAID narrative:** WorkshopPack registers retain transcript owners; deck overrides **stream lead table only** in the app.

---

## Publish stamp

- **WorkshopPack:** Day 1 provisional — re-baseline after Day 2  
- **xlsx / HTML:** Agent revision 2026-06-03 — source WorkshopPack  
- **Next ingestion:** Day 2 files → SRC-008+ → DEC-015 / ACT-055+

---

# Day 2 Reconciliation (appended 2026-06-04)

**Purpose:** Record the Day 2 ingestion, the reframing/supersession of Day 1 items, and the ID-collision handling between the Day 2 source docs and the WorkshopPack pack sequence.

## Day 2 sources audited

| Src | File | Status |
| --- | --- | --- |
| SRC-008 | `Documents/_extracted/Day 2 - Session 1.txt` | Authoritative — ingested (D2S1: Otter overview/outline, Teams notes, follow-up tasks, embedded "exec summary") |
| SRC-009 | `Documents/_extracted/Day 2 - Session 2.txt` | Authoritative — ingested (D2S2: roadmap/squad/critical-path detail, Teams notes, follow-up tasks) |

> **Input audit updated:** SRC-008 and SRC-009 are added to the master source list (Day 1 = SRC-001–007). All Day-2 register headers cite SRC-008/009.

## Day 2 ID baseline (continue pack sequence — no reset)

| Register | Day 2 range | Count | Pack total after Day 2 |
| --- | --- | ---: | ---: |
| Decisions (DEC) | DEC-015–028 | 14 | 28 |
| Actions (ACT) | ACT-055–084 | 30 | 84 |
| Risks (RSK) | RSK-023–032 | 10 | 32 |
| Issues (ISS) | ISS-009–011 | 3 | 11 |
| Assumptions (ASM) | ASM-012–016 | 5 | 16 |
| Dependencies (DEP) | DEP-017–022 | 6 | 22 |
| Open questions (QST) | QST-020–027 | 8 | 27 |
| Parking lot (PRK) | PRK-010–015 | 6 | 15 |

## CRITICAL — Day 2 source docs reused Day 1 IDs (NOT adopted)

The Day 2 Otter/embedded "exec summary" tables in SRC-008/SRC-009 re-used **Day 1-style IDs** (e.g. "DEC-001 Article background colour", "DEC-004 four-squad", "RSK-004 linear delivery", "ACT-001 IA for Personal", "DEP-001 design foundations"). These are **source-local numbering only** and were **NOT adopted**. WorkshopPack IDs continue the pack sequence (DEC-015+, etc.). Mapping of the most material source-local IDs to adopted pack IDs:

| Day 2 source-local ID (SRC-008/009) | Topic | Adopted WorkshopPack ID |
| --- | --- | --- |
| DEC-001 (D2 doc) | Article background-colour variant (F5→F6) | Folded into **DEC-023** (article handling) |
| DEC-002 / DEC-003 (D2 doc) | Personal-first / phased Personal→Corp→Bus→Wealth | **DEC-015** |
| DEC-003 (D2S1 doc) | Red/green-zone strategy | **DEC-017** |
| DEC-004 (D2 doc) | Four-squad parallel approach | **DEC-016** |
| DEC-004 (D2 exec doc) | Content + analytics co-location | **DEC-020** |
| DEC-005 (D2 doc) | Quality gates before production | **DEC-021** |
| DEC-005 (D2S1 doc) | Bernice/Natalie gatekeepers | **DEC-019** |
| DEC-001 (D2S1 doc) | Personal design foundations end-June | **DEC-022** |
| DEC-006 (D2 doc) | Article/news URL structure pending IA | **DEC-024** |
| RSK-004 (D2S1 doc) | Linear delivery misses year-end | **RSK-024** |
| RSK-001 (D2S1 doc) | Sept/Aug resource roll-offs | **RSK-023** |
| RSK-003 (D2S1 doc) | Single points of failure (Bernice) | **RSK-026** |
| RSK-002 (D2S1 doc) | Template changes affect completed dev | **RSK-025** |
| ACT-001/002/003 (D2 doc) | IA for Personal / colour change / URL mapping | **ACT-065 / DEC-023 / ACT-057** |
| ACT-006 (D2 doc) | Populate spreadsheet by Friday | **ACT-055/070/078** |
| DEP-001/003/005 (D2 doc) | Foundations / IA sign-off / portfolio-view | **DEP-017 / DEP-019 / DEP-020** |
| QST-002 (D2S1 doc) | Additional resources for squads | **QST-020** |

## Day 1 → Day 2 supersession / firming (reframed, not deleted)

Day 1 entries are **retained**; the following were reframed or firmed by Day 2 (inline supersession notes already added to the registers):

| Day 1 item | Day 2 disposition | Day 2 ID(s) |
| --- | --- | --- |
| **DEC-001** scope boundary (migration/transformation) | Reframed — scope bounded **per phase** via phased audience delivery; single boundary not drawn | DEC-015 |
| **DEC-006** design foundations | Given concrete **end-June Personal** target | DEC-022 |
| **DEC-007** governance/approval gates | Firmed into **gatekeeper model** | DEC-019 |
| **DEC-008** page treatment (templates vs as-is) | Elaborated into **red/green zones** + **article handling** | DEC-017, DEC-023 |
| **DEC-009** automated testing | **Confirmed** — DevOps gates + Playwright + linting | DEC-021 |
| **DEC-012** phased decommissioning | Reaffirmed; **South Sudan = decommission-only** | DEC-025, ACT-071 |
| **RSK-001 / RSK-019** scope-vs-timeline | Confirmed — linear misses year-end; phased + four-squad response; expectation management | RSK-024, RSK-031, DEC-015/016 |
| **RSK-022** security pen-test scope | Action to clarify public-web pen-test scope with Nzama | ACT-072 |
| **QST-016** tactical-vs-strategic appetite | Resolved into **phasing** (not a single tactical cut) | DEC-015 |
| **DEC-010** dedicated publisher / **ISS-007** single publisher | Reinforced by **single points of failure** + under-resourcing | RSK-026, ISS-009 |

## Day 2 items NOT promoted / requiring human validation

1. **"DEC-007 Banking platform integration" / "DEC-009 decommissioning sequence" (D2 embedded exec doc)** — captured as **DEC-028** (bank ownership, intent) and **DEC-012/DEC-025** (decommissioning); banking-platform integration coordination remains an **ownership gap** (not a confirmed decision).
2. **Speaker attributions** — D2 docs use "Speaker 2/7/9/12/16" placeholders; named owners adopted only where the Teams notes/outline name them (e.g. Justin, Bernice, Seba, Rey, Nithin, Tsoaeli, Reza, Tebogo). Unresolved speaker numbers left unattributed.
3. **Name spellings** — "Toboco"→**Tebogo**, "Seba/Sebastian"→Seba (Sebabatso per Day 1 normalisation), "Bernice"→Bernice, "Tsoaeli", "Vallabh", "Loza", "Reza/Rey" — carried as `Unconfirmed` where Day 1 had not already validated.
4. **Page counts** — 150 restyle / 850 remaining / 457 modular / ~140 personal articles / "1000+ pages" are **as stated in SRC-008**; treat as workshop estimates pending the content audit (ACT-066).
5. **DEC-016 four-squad** kept **Proposed (resource-gated)** — NOT promoted to Confirmed; the D2 docs themselves mark it "Proposed / requires additional resources".
6. **DEC-024 article/news URL structure** kept **Deferred** — explicitly deferred pending IA.
7. **DEC-025/DEC-028** kept **Confirmed (intent)** — direction agreed; per-country sequencing and the OM-finance-pages-to-bank question (QST-021) remain open.

## Updated human-validation list (Day 2 additions)
- South Sudan / Malawi decommission-vs-migration split (DEC-025) — confirm per-country.
- "Bull & Taylor" small-site name (PRK-013) and "personal Coetzee" (PRK-014) — validate spelling/meaning.
- OMAR vs "Omar" — confirm the international/Africa-regions entity naming.
- Four-squad sizing (lead designer + designer + content + tech support; 2-person squad = 1 macro section/sprint; Personal ≈ 5 sprints) — validate against actual throughput (ASM-013).

## Day 2 publish stamp
- **Workshop dates confirmed (user-validated):** Day 1 = **2 June 2026**, Day 2 = **3 June 2026**; pack compiled **4 June 2026**. The "4 June" appearing in some Day 2 source summaries is the capture/compilation date, not the session date — prior `Clarification required` flag on the session date is now **resolved**.
- **WorkshopPack:** Day 2 ingested — registers re-baselined; two-day record finalised in [final-executive-summary.md](final-executive-summary.md).
- **Sources:** SRC-008 (D2S1), SRC-009 (D2S2) added to input audit.
- **ID continuity:** pack sequence continued (no reset); Day 2 source-local IDs not adopted.
