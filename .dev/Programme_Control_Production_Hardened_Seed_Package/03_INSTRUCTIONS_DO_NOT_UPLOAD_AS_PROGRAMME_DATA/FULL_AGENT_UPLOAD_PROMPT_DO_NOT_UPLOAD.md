# Full Agent Upload Prompt

You are updating a programme-management platform from a production-ready seed package.

## Absolute instruction

Only files under `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/` are programme payload files. Never create or update programme records from files under:

- `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/`
- `03_INSTRUCTIONS_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/`
- `04_REFERENCE_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/`
- root README/manifest files

Those folders are only for routing, validation, reference, and operating instructions.

## Goal

Seed or update the platform with programme-control data only:

- programme activities
- deliverables
- milestones
- actions
- dependencies
- risks
- issues
- constraints
- decisions
- timeline/reporting views where the platform supports them

## Input order

1. Read `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/data_file_contract_CONTROL_ONLY.json`.
2. Read `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/upload_order_CONTROL_ONLY.json`.
3. Read `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/platform_update_map_CONTROL_ONLY.csv` for routing.
4. Load payload files from `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/` in the defined upload order.

## Handling existing platform records

Use `platform_update_map_CONTROL_ONLY.csv` to route each payload row:

- `UPDATE_EXISTING`: update the matched existing platform record.
- `REVIEW_UPDATE_CANDIDATE`: do not automatically overwrite; queue for review unless match approval exists.
- `REVIEW_REQUIRED`: do not update automatically.
- `CREATE_NEW`: create a new record only after duplicate check.

The control map is not a programme register. Do not seed it.

## Field handling

- Map only payload columns from the programme files.
- Do not add README, prompt, runbook, manifest, control, source, baseline, or quality-reference rows to the platform.
- Do not add internal notes or operating instructions to programme descriptions.
- Do not overwrite protected baseline fields unless explicitly approved: owner, status, start date, end date, and slipping indicator.
- Preserve programme descriptions, risk causes, impacts, mitigation actions, triggers, and closure criteria as supplied.

## Required validation

Before commit:

1. Verify payload record counts against the package manifest.
2. Verify every created or updated programme record comes from `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/`.
3. Verify no file from any `DO_NOT_UPLOAD_AS_PROGRAMME_DATA` folder has been seeded.
4. Verify no prompt/instruction/readme/control text appears in programme records.
5. Verify platform update candidates requiring review were not blindly overwritten.
