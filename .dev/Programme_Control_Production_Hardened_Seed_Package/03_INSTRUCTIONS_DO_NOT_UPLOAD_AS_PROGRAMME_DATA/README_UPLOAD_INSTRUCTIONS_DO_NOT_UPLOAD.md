# Production Upload Runbook

## Objective

Create or update programme-management platform records using only the production programme payload files.

## Non-negotiable rule

Only files in `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/` are payload files. Do not create programme records from the control, instruction, reference, source, README, manifest, or prompt files.

## Load sequence

1. Load `data_file_contract_CONTROL_ONLY.json`.
2. Load `upload_order_CONTROL_ONLY.json`.
3. Load `platform_update_map_CONTROL_ONLY.csv` for routing only.
4. For each entity in upload order, read the corresponding CSV/JSONL file from `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/`.
5. Use `record_id` / entity ID as the internal seed identifier.
6. Use the control map to determine whether the row updates an existing platform record or needs review/create handling.
7. Do not persist any control-only fields as programme attributes unless the platform has explicit system fields for routing metadata.

## Update rules

- `UPDATE_EXISTING`: update the matching platform record using programme payload fields only.
- `REVIEW_UPDATE_CANDIDATE`: place in review queue unless the platform owner confirms the match.
- `REVIEW_REQUIRED`: do not update automatically.
- `CREATE_NEW`: create a new programme record only after confirming there is no platform duplicate.

## Programme payload rules

- Preserve all programme descriptions exactly as supplied in the payload files.
- Do not upload prompts, runbooks, manifests, QA reports, control maps, source workbooks, or baseline exports as programme records.
- Do not overwrite existing owner, status, start date, end date, or slipping indicator from the baseline without approval.
- Treat blank, `Unknown`, and `To be confirmed` fields as legitimate programme placeholders requiring follow-up, not as instructions.
- Keep register relationships intact: activities link to deliverables, milestones, actions, dependencies, risks, issues, constraints, and decisions by ID where available.

## Post-load checks

- Record counts by entity match the manifest.
- No instruction/control/reference files appear as programme records.
- No platform baseline rows were duplicated as new records.
- Update candidates and weak matches remain in review if not approved.
- Risk, issue, action, dependency, and decision descriptions are present and readable.
