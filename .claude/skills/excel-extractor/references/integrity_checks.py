"""Reusable data-integrity checks for extracted tabular data (list[dict]).

Usage:
    from integrity_checks import id_unique, referential_integrity, date_sanity, reconcile
    id_unique(rows, "Risk_ID")
    referential_integrity(child_rows, "Linked_ID", parent_ids)
"""
from collections import Counter


def id_unique(rows, key):
    ids = [r.get(key) for r in rows]
    dupes = [k for k, n in Counter(ids).items() if n > 1 and k is not None]
    return {"unique": len(dupes) == 0, "count": len(ids), "duplicates": dupes[:20]}


def referential_integrity(child_rows, fk, parent_ids):
    parent = set(parent_ids)
    links = [r.get(fk) for r in child_rows]
    orphans = [l for l in links if l not in parent and l not in (None, "", " ")]
    blanks = sum(1 for l in links if l in (None, "", " "))
    return {"orphans": len(orphans), "blanks": blanks, "orphan_examples": orphans[:10]}


def date_sanity(rows, start_key, end_key):
    import re
    iso = lambda v: isinstance(v, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", v)
    bad = [r for r in rows if iso(r.get(start_key)) and iso(r.get(end_key)) and r[end_key] < r[start_key]]
    return {"end_before_start": len(bad)}


def reconcile(parsed_count, expected_count):
    return {"ok": parsed_count == expected_count, "parsed": parsed_count, "expected": expected_count}


def completeness(rows, columns):
    n = len(rows) or 1
    out = {}
    for c in columns:
        nulls = sum(1 for r in rows if r.get(c) in (None, "", "TBC", "N/A"))
        out[c] = {"filled_pct": round(100 * (n - nulls) / n, 1), "missing": nulls}
    return out
