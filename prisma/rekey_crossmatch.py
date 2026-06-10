"""
READ-ONLY cross-match: cleaned roadmap dataset  <->  live DB records.

Measures how much of the cleaned dataset actually corresponds to existing live
records (so we know how much is a re-key/update vs brand-new). No DB access; reads
the xlsx and docs/rekey-dryrun/live.json (produced by dump-live-for-rekey.ts).

Writes docs/rekey-dryrun/REPORT.md + match_*.csv.
"""
import json, os, re, csv
import openpyxl

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
XLSX = os.path.join(ROOT, ".dev", "uploads-data", "cleaned_workstream_roadmap_dataset.xlsx")
OUT = os.path.join(ROOT, "docs", "rekey-dryrun")
os.makedirs(OUT, exist_ok=True)

STOP = set("the a an of for and or to in on at by with from is are be as into this that not no".split())

def toks(s):
    if not s:
        return set()
    return {t for t in re.sub(r"[^a-z0-9]+", " ", str(s).lower()).split() if len(t) > 2 and t not in STOP}

def jac(a, b):
    if not a or not b:
        return 0.0
    i = len(a & b)
    return i / (len(a) + len(b) - i)

def load_sheet(wb, name):
    ws = wb[name]
    rows = list(ws.iter_rows(values_only=True))
    h = rows[0]
    return [dict(zip(h, r)) for r in rows[1:] if any(c is not None for c in r)]

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ds_master = load_sheet(wb, "UPLOAD_Master_Data")
ds_risks = load_sheet(wb, "UPLOAD_Risks")
ds_deps = load_sheet(wb, "UPLOAD_Dependencies")
ds_cons = load_sheet(wb, "UPLOAD_Constraints")

live = json.load(open(os.path.join(OUT, "live.json"), encoding="utf-8"))

THRESH = 0.45  # token-overlap acceptance

def best_match(text, live_list, label_fn):
    pt = toks(text)
    best, best_s = None, 0.0
    for r in live_list:
        s = jac(pt, r["_tok"])
        if s > best_s:
            best_s, best = s, r
    return (best, round(best_s, 3)) if best and best_s >= THRESH else (None, round(best_s, 3))

# precompute live tokens
for t in live["tasks"]:
    t["_tok"] = toks(f"{t['title']} {t.get('description') or ''}")
for d in live["deliverables"]:
    d["_tok"] = toks(f"{d['name']} {d.get('description') or ''}")
for r in live["risks"]:
    r["_tok"] = toks(r["description"])
for d in live["dependencies"]:
    d["_tok"] = toks(d["description"])

def run(ds_rows, ds_id, ds_text_fn, live_list, live_id_fn, live_label_fn, csv_name):
    matched, new = 0, 0
    out_rows = []
    used_live = set()
    for row in ds_rows:
        text = ds_text_fn(row)
        m, score = best_match(text, live_list, live_label_fn)
        if m:
            matched += 1
            used_live.add(live_id_fn(m))
            out_rows.append([row.get(ds_id), str(text)[:70], "MATCH", live_id_fn(m), live_label_fn(m)[:60], score])
        else:
            new += 1
            out_rows.append([row.get(ds_id), str(text)[:70], "NEW", "", "", score])
    with open(os.path.join(OUT, csv_name), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["dataset_id", "dataset_text", "verdict", "live_externalId", "live_label", "score"])
        w.writerows(out_rows)
    return matched, new, len(used_live), len(live_list)

m_tasks = run(ds_master, "Programme_Record_ID",
              lambda r: f"{r.get('Clean_Task')} {r.get('Clean_Description')}",
              live["tasks"], lambda x: x["externalId"], lambda x: x["title"],
              "match_master_to_tasks.csv")
m_del = run(ds_master, "Programme_Record_ID",
            lambda r: f"{r.get('Clean_Task')} {r.get('Clean_Description')}",
            live["deliverables"], lambda x: x["externalId"] or "(none)", lambda x: x["name"],
            "match_master_to_deliverables.csv")
m_risk = run(ds_risks, "Risk_ID",
             lambda r: f"{r.get('Title')} {r.get('Detailed_Description')}",
             live["risks"], lambda x: x["externalId"], lambda x: x["description"],
             "match_risks.csv")
m_dep = run(ds_deps, "Dependency_ID",
            lambda r: f"{r.get('Title')} {r.get('Detailed_Description')}",
            live["dependencies"], lambda x: x["externalId"], lambda x: x["description"],
            "match_dependencies.csv")

# ID-format collision check (exact externalId string equality)
def collisions(ds_ids, live_ids):
    ls = set(live_ids)
    return sorted(set(ds_ids) & ls)

col_risk = collisions([r["Risk_ID"] for r in ds_risks], [r["externalId"] for r in live["risks"]])
col_dep = collisions([d["Dependency_ID"] for d in ds_deps], [d["externalId"] for d in live["dependencies"]])
col_prg_task = collisions([r["Programme_Record_ID"] for r in ds_master], [t["externalId"] for t in live["tasks"]])

L = []
L.append("# Re-Key Cross-Match Dry-Run (READ-ONLY)")
L.append("")
L.append("> No database writes. Compares the cleaned roadmap dataset against a snapshot of live records to measure how much overlaps (re-key/update) vs is brand-new.")
L.append("")
L.append(f"Token-overlap acceptance threshold: **{THRESH}** (Jaccard on title+description tokens).")
L.append("")
L.append("## Volume comparison")
L.append("")
L.append("| Entity | Cleaned dataset | Live DB |")
L.append("|---|--:|--:|")
L.append(f"| Programme records / Tasks | {len(ds_master)} (PRG) | {len(live['tasks'])} (WBS tasks) |")
L.append(f"| Risks | {len(ds_risks)} (RSK-xxxx) | {len(live['risks'])} (RSK-xxx) |")
L.append(f"| Dependencies | {len(ds_deps)} (DEP-xxxx) | {len(live['dependencies'])} (DEP-xxx) |")
L.append(f"| Constraints | {len(ds_cons)} (CON-xxxx) | 0 (no live model) |")
L.append(f"| Deliverables | (none separate) | {len(live['deliverables'])} (DEL) |")
L.append("")
L.append("## Overlap (how much of the dataset matches a live record)")
L.append("")
L.append("| Dataset → Live | MATCH | NEW | distinct live records hit / total live |")
L.append("|---|--:|--:|--:|")
L.append(f"| Master → live Tasks (WBS) | {m_tasks[0]} | {m_tasks[1]} | {m_tasks[2]} / {m_tasks[3]} |")
L.append(f"| Master → live Deliverables | {m_del[0]} | {m_del[1]} | {m_del[2]} / {m_del[3]} |")
L.append(f"| Risks → live Risks | {m_risk[0]} | {m_risk[1]} | {m_risk[2]} / {m_risk[3]} |")
L.append(f"| Dependencies → live Dependencies | {m_dep[0]} | {m_dep[1]} | {m_dep[2]} / {m_dep[3]} |")
L.append("")
L.append("## Exact externalId string collisions (would overwrite on upsert-by-id)")
L.append("")
L.append(f"- Dataset Risk_ID vs live Risk.externalId: **{len(col_risk)}** {col_risk[:10]}")
L.append(f"- Dataset Dependency_ID vs live Dependency.externalId: **{len(col_dep)}** {col_dep[:10]}")
L.append(f"- Dataset Programme_Record_ID vs live Task.externalId (WBS): **{len(col_prg_task)}** {col_prg_task[:10]}")
L.append("")
L.append("> The dataset uses 4-digit IDs (RSK-0001) and live uses 3-digit (RSK-001) / WBS-### for tasks, so naive upsert-by-externalId does NOT collide — but it also would NOT update any live record; every dataset row would insert as new.")
L.append("")
L.append("## Per-entity CSVs")
L.append("- match_master_to_tasks.csv")
L.append("- match_master_to_deliverables.csv")
L.append("- match_risks.csv")
L.append("- match_dependencies.csv")
L.append("")

open(os.path.join(OUT, "REPORT.md"), "w", encoding="utf-8").write("\n".join(L))
print("\n".join(L))
