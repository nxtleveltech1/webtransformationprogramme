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
    GOVERNANCE,
    OVERVIEW_JOURNEYS,
    RAID,
    ROADMAP_ROWS,
    STREAM_INPUTS,
    TRADEOFFS,
)

# Deck-canonical workstream leads: code, name, primary lead, leadText (full display)
WORKSTREAMS = [
    ("programme", "Programme / Delivery", "Gareth Bew", "Gareth Bew"),
    ("product", "Product", "Keshvi Singh", "Keshvi Singh"),
    ("design", "Design & Content", "Sebabatso Mtimkulu", "Sebabatso Mtimkulu; Kameshnee Chetty"),
    ("omds", "Design System (OMDS)", "Brent Van Ziller", "Brent Van Ziller; Justin Evans"),
    ("execution", "Execution / Engineering", "Nithin Ramsaroop", "Nithin Ramsaroop; Zethembiso Msomi"),
    ("publishing", "Publishing", "Bernice Bryce", "Bernice Bryce"),
    ("cross_channels", "Cross Channels Solutions", "Tebogo Segoje", "Tebogo Segoje; Wayne Moodley"),
    ("seo", "SEO", "Nodalo", "Nodalo; Nthabi"),
    ("regional", "Regional / Country", None, "OMAR owner TBC"),
    ("go_live", "Go-Live Readiness", "Luvuyo Mkumatela", "Luvuyo Mkumatela"),
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
