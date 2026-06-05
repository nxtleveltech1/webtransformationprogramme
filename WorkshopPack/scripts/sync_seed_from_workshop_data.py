#!/usr/bin/env python3
"""Generate prisma/seed/workshop-data.generated.ts from workshop_data.py."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from workshop_data import (  # noqa: E402
    ACTIONS,
    CRITICAL_PATH,
    DECISIONS,
    DEPENDENCIES,
    DELIVERABLES,
    EVIDENCE_LINKS,
    GOVERNANCE,
    GOVERNANCE_MEETINGS,
    OVERVIEW_JOURNEYS,
    PHASES,
    RAID,
    READINESS_GATES,
    ROADMAP_ROWS,
    STREAM_INPUTS,
    TASK_DEPENDENCIES,
    TRADEOFFS,
    WBS_TASKS,
)

# Deck-canonical workstream leads: code, name, primary lead, leadText (full display)
WORKSTREAMS = [
    ("governance_pmo", "Governance and PMO", "Gareth Bew", "Gareth Bew; Programme Leadership"),
    ("technical_migration", "Technical Migration", "Nithin Ramsaroop", "Nithin Ramsaroop; Zethembiso Msomi; Daniel"),
    ("design_systems", "Design and Design Systems", "Sebabatso Mtimkulu", "Sebabatso Mtimkulu; Brent Van Ziller; Justin Evans"),
    ("content_ia", "Content and IA", "Natalie Patel", "Natalie Patel; Bernice Bryce; Justin Evans"),
    ("publishing", "Publishing", "Bernice Bryce", "Bernice Bryce"),
    ("internal_comms", "Internal Communications", None, "Programme / Comms owner TBC"),
    ("external_comms", "External Communications", None, "Programme / Marketing owner TBC"),
    ("contact_support", "Contact Centre and Support Readiness", None, "Programme / Support owner TBC"),
    ("training_adoption", "Training and Adoption", None, "Programme / Training owner TBC"),
    ("testing_go_live", "Testing, Readiness and Go-Live", "Luvuyo Mkumatela", "Luvuyo Mkumatela; Keshvi Singh"),
    ("hypercare", "Hypercare and Stabilisation", None, "Programme / Support owner TBC"),
]

RISKS = [r[1:] for r in RAID if r[0] == "Risk"]
ISSUES = [r[1:] for r in RAID if r[0] == "Issue"]


def ts_val(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    return json.dumps(str(v), ensure_ascii=False)


def emit_tuple_list(name: str, rows: list, fields: int) -> str:
    lines = [f"export const {name} = ["]
    for row in rows:
        parts = ", ".join(ts_val(x) for x in row[:fields])
        lines.append(f"  [{parts}],")
    lines.append("] as const;")
    return "\n".join(lines)


def main() -> None:
    out = ROOT / "prisma" / "seed" / "workshop-data.generated.ts"
    chunks = [
        "/** Auto-generated from WorkshopPack/scripts/workshop_data.py — do not edit by hand. */",
        '/** Run: python WorkshopPack/scripts/sync_seed_from_workshop_data.py */',
        "",
        emit_tuple_list("DECISIONS", DECISIONS, 9),
        "",
        emit_tuple_list("TRADEOFFS", TRADEOFFS, 9),
        "",
        emit_tuple_list("ACTIONS", ACTIONS, 10),
        "",
        emit_tuple_list("RISKS", RISKS, 9),
        "",
        emit_tuple_list("ISSUES", ISSUES, 8),
        "",
        emit_tuple_list("DEPENDENCIES", DEPENDENCIES, 9),
        "",
        emit_tuple_list("CRITICAL_PATH", CRITICAL_PATH, 8),
        "",
        emit_tuple_list("ROADMAP_ROWS", ROADMAP_ROWS, 8),
        "",
        emit_tuple_list("GOVERNANCE", GOVERNANCE, 8),
        "",
        emit_tuple_list("OVERVIEW_JOURNEYS", OVERVIEW_JOURNEYS, 4),
        "",
        emit_tuple_list("STREAM_INPUTS", STREAM_INPUTS, 10),
        "",
        emit_tuple_list("PHASES", PHASES, 8),
        "",
        emit_tuple_list("DELIVERABLES", DELIVERABLES, 14),
        "",
        emit_tuple_list("WBS_TASKS", WBS_TASKS, 17),
        "",
        emit_tuple_list("TASK_DEPENDENCIES", TASK_DEPENDENCIES, 5),
        "",
        emit_tuple_list("READINESS_GATES", READINESS_GATES, 15),
        "",
        emit_tuple_list("GOVERNANCE_MEETINGS", GOVERNANCE_MEETINGS, 11),
        "",
        emit_tuple_list("EVIDENCE_LINKS", EVIDENCE_LINKS, 7),
        "",
        "export const WORKSTREAMS = [",
    ]
    for code, name, lead, lead_text in WORKSTREAMS:
        chunks.append(
            f"  [{ts_val(code)}, {ts_val(name)}, {ts_val(lead)}, {ts_val(lead_text)}],"
        )
    chunks.append("] as const;")
    out.write_text("\n".join(chunks) + "\n", encoding="utf-8")
    print(f"Wrote {out}")
    print(f"  DECISIONS={len(DECISIONS)} ACTIONS={len(ACTIONS)} RISKS={len(RISKS)} ISSUES={len(ISSUES)} DEP={len(DEPENDENCIES)}")


if __name__ == "__main__":
    main()
