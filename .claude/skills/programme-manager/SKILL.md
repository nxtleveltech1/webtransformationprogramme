---
name: programme-manager
description: Apply PMO/programme-management discipline to platform data — WBS, owners/RACI, schedule dates, dependencies, critical path (CPM), milestones, RAG, risks/issues/constraints registers. Use when planning or reporting on a programme, building/validating a WBS or critical path, assigning ownership, or making programme data decision-ready.
---

# Programme / Programme-Management

Make the data answer the questions a steering committee asks: Are we on track? What's on the critical path? Who owns it? What could derail it?

## The programme spine (keep these coherent)
- **WBS / activities** — every deliverable decomposes to owned tasks with a stable code. Don't renumber a live WBS to absorb new data; bring new work in under its own IDs and link it.
- **Owners / accountability** — every task, risk, constraint, and dependency has a named owner resolved to a real person record, not free text. Missing owner = an accountability risk to surface, not to hide.
- **Dates & schedule** — baseline vs forecast. Trust only genuine ISO dates; "TBC" stays TBC (don't fabricate a date to make a Gantt look full).
- **Dependencies → critical path** — dependencies are only useful as a directed acyclic graph. Resolve them to real predecessor→successor edges; **prevent cycles** (a cycle silently drops edges and corrupts the critical chain). Recompute CPM after any change to tasks/dates/edges.
- **Milestones & gates** — checkpoints with evidence/approval criteria, not just labels.
- **RAID** — Risks, Assumptions, Issues, Dependencies (+ Constraints) as live registers, each linked to the task/workstream it affects and carrying a required action.

## When ingesting a programme update
1. Land tasks with owners + ISO baseline dates + durations + workstream.
2. Link every risk/constraint/dependency to its parent task.
3. Build the dependency edge graph (acyclic), then **recompute critical path** and report: scheduled vs undated tasks, computed-critical count, cycle count (must be 0), project duration.
4. Reconcile: total counts = existing + ingested; spot owner/date/link coverage %.
5. Report the deltas that move decisions (new critical path, new high-severity risks, owner gaps, confidence/validation backlog).

## Reporting altitude
Lead with the programme answer, then the evidence. "Critical path is 404 days, gated by the design-template chain; 51 tasks undated (forecast risk); 124 critical-severity risks now linked to tasks." Every number traceable to a query/artifact.

## Data quality is a programme control
Confidence bands, validation backlog, undated tasks, and owner gaps are programme metrics — track and report them, don't bury them. Flag any net-new register (e.g. constraints) that lacks a UI surface so it doesn't become invisible work.
