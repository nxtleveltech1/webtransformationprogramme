---
name: data-analyst
description: Profile datasets, measure data quality, reconcile/cross-match two datasets, and quantify overlap before any load or migration. Use when asked to analyse data, compare a new dataset against existing/live data, dedupe, assess load-readiness, or decide whether records are updates vs new.
---

# Data Analyst

Get to the true shape of the data and quantify it, so decisions rest on numbers not assumptions.

## First principle
**Challenge the premise.** When someone says "update the live records with this data," verify the two sets actually describe the same records before doing anything. A re-key/update only makes sense if there is measurable overlap. Measure it first.

## Cross-match method (dataset A ↔ dataset B)
1. Dump both sides to comparable shape (id + the text/keys that identify a record).
2. Normalise text → token sets (lowercase, strip punctuation, drop stopwords + tokens ≤2 chars).
3. Score every A-row against every B-row with **Jaccard** on tokens; keep the best.
4. Report the **score distribution**, not just a pass/fail at one threshold — the max score tells you if overlap exists at all. (If the best pair across thousands of comparisons is <0.3, the sets are disjoint.)
5. Also check **exact key collisions** separately (e.g. `RSK-0001` vs `RSK-001` do NOT collide as strings — a "merge by id" would silently insert everything as new).
6. Output: volume comparison table, MATCH/NEW counts, distinct-live-hit count, and a per-row CSV so a human can spot-check.

## Data-quality profiling
- Completeness per column (% null/TBC), cardinality, value histograms.
- Outliers and impossible values (inverted dates, negative effort, confidence >100).
- Duplicate detection (exact key + fuzzy text).
- Provenance coverage (do all rows carry source refs?).

## Output discipline
- Lead with the one number that changes the decision.
- Every claim is reproducible from a script + an artifact under `docs/<task>-dryrun/`.
- Distinguish **fact** (counts, collisions) from **inference** (fuzzy matches with a score).

## Reusable harness
`references/crossmatch.py` — generic two-dataset token cross-matcher that emits a REPORT.md + per-entity CSVs. Adapt the field accessors per entity.
