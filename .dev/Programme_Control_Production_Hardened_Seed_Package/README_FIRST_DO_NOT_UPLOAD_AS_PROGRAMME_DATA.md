# Programme Control Production Package

This package is split so that the platform receives programme data only.

## Hard separation

| Folder | Purpose | May be seeded as programme data? |
|---|---|---|
| `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/` | Production programme registers and reporting views | YES |
| `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/` | Update routing, match maps, baseline reference, and load order | NO |
| `03_INSTRUCTIONS_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/` | Instructions and agent prompt | NO |
| `04_REFERENCE_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/` | QA/reference files and original source files | NO |

The agent must only create or update platform programme records from files inside `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/`.

## Importable programme data counts

| Entity | Records |
|---|---:|
| `programme_activities` | 271 |
| `deliverables` | 262 |
| `actions` | 271 |
| `risks` | 340 |
| `issues` | 12 |
| `dependencies` | 144 |
| `constraints` | 158 |
| `decisions` | 66 |
| `milestones` | 79 |
| `timeline` | 271 |
| `governance_summary` | 10 |
| `workstream_status` | 10 |

## Main files

- `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/Programme_Control_Production_Seed_Data_ONLY.xlsx`
- `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/csv/*.csv`
- `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/jsonl/*.jsonl`
- `01_LOAD_TO_PLATFORM_PROGRAMME_DATA/json/programme_control_seed_dataset.json`

## Control files

The control folder tells the agent how to route add/update/review actions. It is not programme payload data.

Start with:

1. `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/data_file_contract_CONTROL_ONLY.json`
2. `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/upload_order_CONTROL_ONLY.json`
3. `02_CONTROL_FOR_AGENT_DO_NOT_UPLOAD_AS_PROGRAMME_DATA/platform_update_map_CONTROL_ONLY.csv`

## Production hardening completed

The programme payload files were rebuilt to exclude prompt text, agent instructions, transformation notes, source-reference columns, confidence/provenance fields, and internal clean-up wording. Descriptions in the programme payload are written as programme-control descriptions only.
