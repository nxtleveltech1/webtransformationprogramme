# Roadmap Dataset Ingestion — Report

**Source:** `.dev/uploads-data/cleaned_workstream_roadmap_dataset.xlsx`
**Date:** 2026-06-09
**Mode:** Additive, CREATE-only (existing live data untouched). Fully reversible.

## 1. Why this was a load, not a re-key

The original ask was to "use the dataset's IDs to update live records, keep WBS numbers." A cross-match (`prisma/rekey_crossmatch.py`, `docs/rekey-dryrun/REPORT.md`) measured the actual overlap between the dataset and the live DB:

- Max similarity of **any** dataset row to **any** live record: 0.13 (tasks), 0.29 (one risk), 0.13 (deps).
- The live DB is the **consolidated programme-level WBS** (112 `WBS-###` tasks, 11 programme workstreams); the dataset is **delivery-team detail** (187 records, 10 delivery workstreams) from a different source workbook.

**Conclusion:** the two are different layers with essentially no overlap. There was nothing to re-key; the correct action was an **additive load under the dataset's own IDs**, keeping the existing WBS tasks intact.

## 2. What was ingested

| Entity | Created | IDs | Target model |
|---|--:|---|---|
| Programme tasks | 187 | `PRG-0001…` | `Task` (delivery layer, alongside `WBS-###`) |
| Risks | 343 | `RSK-0001…` | `Risk` |
| Constraints | 478 | `CON-0001…` | **`ProgrammeConstraint`** (new model) |
| Dependencies | 199 | `DEP-0001…` | `Dependency` (register) |
| Workstreams | 9 | `ws_*` | `Workstream` (Publishing matched existing) |
| People | 1 | — | `Person` (Brent van Zitters; 6 owners matched existing) |
| Task dependency edges | 65 | — | `TaskDependency` (acyclic, for CPM) |

## 3. Alignment verified (`prisma/verify-roadmap-ingest.ts`)

- **Totals reconcile:** tasks 299 (112+187), risks 375 (32+343), deps 221 (22+199), constraints 478.
- **Owners:** 185/187 PRG tasks linked to a real `Person`; 2 genuinely TBC. All risk/constraint/dep owners resolved.
- **Linkage:** 343/343 risks, 478/478 constraints, 199/199 deps linked to their parent task. 187/187 tasks linked to a workstream.
- **Dates/schedule:** ISO `baseline*`+`forecast*` set (121 tasks fully dated; rest carry TBC faithfully). Durations on 135.
- **Critical path (CPM recompute):** 299 tasks, 248 scheduled, **0 cycles**, computed-critical chain present, project duration **404 days**. Edges rebuilt with strict matching (containment / jaccard ≥ 0.75) + cycle prevention (`prisma/fix-roadmap-edges.ts`).

## 4. Schema change

Added `ProgrammeConstraint` model — migration `20260609061519_add_programme_constraint` (one new table, FKs to Task/Workstream/Programme/Person; zero changes to existing tables → reversible via `DROP TABLE`).

## 5. Reversibility

- Reversal manifest of every created ID: `docs/rekey-dryrun/ingest-manifest.json`.
- One-command rollback: `npx tsx prisma/rollback-roadmap-ingest.ts --apply` (deletes only ingest-created records; never touches live data).
- Pre-apply snapshot: `docs/rekey-dryrun/pre-apply-snapshot.json`.

## 6. Decisions made (documented for review)

- **PRG records → `Task`** (they carry effort/dates/dependencies and are the link target for risks/constraints/deps).
- **Delivery workstreams kept distinct** from programme-level ones (e.g. "Design Systems" not merged into "Design and Design Systems") — faithful to the delivery taxonomy; can be merged later if desired.
- **Required-actions kept inline** on each risk/constraint/dependency (`mitigationRequired`/`requiredAction`) rather than spawning duplicate `Action` records.
- **No milestones** ingested — the dataset has no milestone data.
- **Confidence:** PRG tasks flagged in `REFERENCE_Validation` set to `REQUIRES_VALIDATION`, else `CONFIRMED`.

## 7. Remaining gap

`ProgrammeConstraint` (478 records) now exists in the DB and is linked, but has **no UI surface yet** (no page/service/nav). All other ingested data flows into existing modules automatically (Tasks, Risk register, Dependency register, CPM/critical path, Capacity, Timeline, People, Workstreams). A Constraints module is the one net-new screen needed to make this data visible in-app.
