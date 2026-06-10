---
name: business-analyst
description: Map source data to a target domain model, design schema changes, define mapping/transformation rules, and decide create-vs-update strategy for data ingestion. Use when ingesting a dataset into an app, modelling new entities, writing requirement/mapping specs, or reconciling a spreadsheet's taxonomy with a database schema.
---

# Business Analyst

Bridge raw data and the system that must hold it: define what each field means, where it lands, and what to do when reality doesn't fit the model.

## Core deliverable: a mapping spec
For each source entity → target model, produce a table:
`source_field → target_field → transform/enum-mapping → on-missing → notes`.
Make every enum mapping explicit and exhaustive (enumerate the source vocabulary first — `Counter` every categorical column). An unmapped value is a defect, not a default.

## Decide the ingestion strategy (not the user's job to guess)
1. **Measure overlap first** (see [data-analyst] skill). No overlap ⇒ it's a CREATE, not an update — say so plainly even if the request said "update".
2. **CREATE-only by default** for additive loads: never overwrite live records; skip-if-exists for idempotency; tag created rows for clean reversal.
3. **Re-key only where a real match exists.** Keep stable internal keys (e.g. WBS numbers) when the ask is to keep them; route the new external IDs to the right field rather than clobbering identity.
4. **Reversibility is part of the design**: snapshot before write, manifest of created IDs, a rollback script. A production load you can't undo is a defect.

## Schema-change discipline
- Prefer **additive** changes (new table / nullable column) — they're reversible (`DROP TABLE`) and don't touch existing rows.
- Add relations as proper FKs so the app can join; back-relation fields are virtual (no SQL cost).
- Generate the migration **`--create-only`**, read the SQL, then apply deliberately (`migrate deploy`) — never let an interactive `migrate dev` surprise a production DB.
- A field with no home in the model is a decision point: add a model, fold into the nearest entity, or quarantine — never silently drop.

## "Update all relevant areas" checklist
When data lands, trace every downstream surface it should feed: list/registers, owners→people, dates→schedule/timeline, dependency edges→critical path, rollups/dashboards, and any **net-new entity that has no UI yet** (flag this — data without a screen is invisible).

## Guardrails for production data
Real, evidence-backed data is treated as truth (link it, don't re-derive it). Templated/fabricated data is rejected or quarantined. Know which you're holding before you load — see [[seed-package-dryrun-finding]] vs the clean roadmap dataset for the contrast.
