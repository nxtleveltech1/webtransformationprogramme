# Re-Key Cross-Match Dry-Run (READ-ONLY)

> No database writes. Compares the cleaned roadmap dataset against a snapshot of live records to measure how much overlaps (re-key/update) vs is brand-new.

Token-overlap acceptance threshold: **0.45** (Jaccard on title+description tokens).

## Volume comparison

| Entity | Cleaned dataset | Live DB |
|---|--:|--:|
| Programme records / Tasks | 187 (PRG) | 112 (WBS tasks) |
| Risks | 343 (RSK-xxxx) | 32 (RSK-xxx) |
| Dependencies | 199 (DEP-xxxx) | 22 (DEP-xxx) |
| Constraints | 478 (CON-xxxx) | 0 (no live model) |
| Deliverables | (none separate) | 34 (DEL) |

## Overlap (how much of the dataset matches a live record)

| Dataset → Live | MATCH | NEW | distinct live records hit / total live |
|---|--:|--:|--:|
| Master → live Tasks (WBS) | 0 | 187 | 0 / 112 |
| Master → live Deliverables | 0 | 187 | 0 / 34 |
| Risks → live Risks | 0 | 343 | 0 / 32 |
| Dependencies → live Dependencies | 0 | 199 | 0 / 22 |

## Exact externalId string collisions (would overwrite on upsert-by-id)

- Dataset Risk_ID vs live Risk.externalId: **0** []
- Dataset Dependency_ID vs live Dependency.externalId: **0** []
- Dataset Programme_Record_ID vs live Task.externalId (WBS): **0** []

> The dataset uses 4-digit IDs (RSK-0001) and live uses 3-digit (RSK-001) / WBS-### for tasks, so naive upsert-by-externalId does NOT collide — but it also would NOT update any live record; every dataset row would insert as new.

## Per-entity CSVs
- match_master_to_tasks.csv
- match_master_to_deliverables.csv
- match_risks.csv
- match_dependencies.csv
