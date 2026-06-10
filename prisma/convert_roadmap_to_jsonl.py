"""
Convert the cleaned roadmap dataset xlsx -> normalized jsonl staging files that
the TS ingestion loader consumes (Node here has no xlsx lib). Pure transform:
- maps source status/priority/type/severity vocab onto the platform's enums
- preserves Source_Sheet/Source_Row traceability on every row
- marks confidence REQUIRES_VALIDATION for rows flagged in REFERENCE_Validation
No DB access.
"""
import openpyxl, json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
XLSX = os.path.join(ROOT, ".dev", "uploads-data", "cleaned_workstream_roadmap_dataset.xlsx")
OUT = os.path.join(ROOT, "prisma", "ingest-staging")
os.makedirs(OUT, exist_ok=True)

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)

def load(name):
    ws = wb[name]; rows = list(ws.iter_rows(values_only=True)); h = rows[0]
    return [dict(zip(h, r)) for r in rows[1:] if any(c is not None for c in r)]

def s(v):
    if v is None: return None
    t = str(v).strip()
    return t if t and t.lower() not in ("none", "nan") else None

PLACEHOLDER = {None, "tbc", "n/a", "na", "all/tbc", "-", "unassigned", ""}
def clean_owner(v):
    t = s(v)
    if t is None or t.lower() in PLACEHOLDER: return None
    return t

TASK_STATUS = {"In Progress": "IN_PROGRESS", "Not Started": "NOT_STARTED", "Ready": "IN_PROGRESS",
               "TBC": "NOT_STARTED", "Blocked": "BLOCKED", "N/A": "NOT_STARTED", "Complete": "COMPLETE"}
PRIORITY = {"Critical": "CRITICAL", "High": "HIGH", "Medium": "MEDIUM", "Low": "LOW", "TBC": "MEDIUM", "N/A": "MEDIUM"}
RISK_CAT = {"Blocker Risk": "DELIVERY", "Approval Risk": "GOVERNANCE", "Confidence Risk": "DELIVERY",
            "Dependency Risk": "DELIVERY", "Schedule / Delivery Risk": "TIMELINE", "Accountability Risk": "GOVERNANCE",
            "Resource Capacity Risk": "RESOURCE", "Roadmap Planning Risk": "PROCESS", "Data Quality Risk": "DATA",
            "Testing / Quality Risk": "TECHNICAL"}
SEV_PI = {"Critical": ("HIGH", "HIGH"), "High": ("MEDIUM", "HIGH"), "Medium": ("MEDIUM", "MEDIUM"), "Low": ("LOW", "LOW")}
RISK_STATUS = {"Not Started": "Open", "In Progress": "In Progress", "Blocked": "Blocked",
               "TBC": "Open", "N/A": "Open", "Complete": "Closed", "Ready": "Open"}
DEP_STATUS = {"Open": "OPEN", "Closed / Monitor": "MET"}

def task_status(v): return TASK_STATUS.get(s(v) or "", "NOT_STARTED")
def priority(v): return PRIORITY.get(s(v) or "", "MEDIUM")

# rows needing validation (drives Confidence on master tasks)
val_ids = {s(r.get("Programme_Record_ID")) for r in load("REFERENCE_Validation")}

master = load("UPLOAD_Master_Data")
risks = load("UPLOAD_Risks")
cons = load("UPLOAD_Constraints")
deps = load("UPLOAD_Dependencies")

def date(v):
    t = s(v)
    return t if t and re.match(r"^\d{4}-\d{2}-\d{2}$", t) else None

def effort(v):
    t = s(v)
    if t is None: return None
    try: return int(round(float(t)))
    except (ValueError, TypeError): return None

m_out = []
for r in master:
    rid = s(r.get("Programme_Record_ID"))
    m_out.append({
        "externalId": rid,
        "title": s(r.get("Clean_Task")) or "(untitled)",
        "description": s(r.get("Clean_Description")),
        "workstream": s(r.get("Workstream")),
        "owner": clean_owner(r.get("Owner")),
        "channel": s(r.get("Channel")), "domain": s(r.get("Domain")),
        "area": s(r.get("Area_Journey")), "cluster": s(r.get("Cluster")), "market": s(r.get("Market")),
        "startDate": date(r.get("Start_Date")), "endDate": date(r.get("End_Date")),
        "durationDays": effort(r.get("Effort_Days")),
        "confidencePercent": s(r.get("Confidence_Percent")), "confidenceBand": s(r.get("Confidence_Band")),
        "priority": priority(r.get("Priority")), "status": task_status(r.get("Status")),
        "dataConfidence": "REQUIRES_VALIDATION" if rid in val_ids else "CONFIRMED",
        "upstreamDependency": s(r.get("Upstream_Dependency")), "upstreamDeliverable": s(r.get("Upstream_Deliverable")),
        "comments": s(r.get("Comments")), "scopeItems": s(r.get("Scope_Items")),
        "traceRef": f"{s(r.get('Source_Sheet'))}:{s(r.get('Source_Row'))}",
    })

def taxonomy(r):
    """Shared classification fields present on every UPLOAD_ sheet."""
    return {
        "channel": s(r.get("Channel")), "domain": s(r.get("Domain")),
        "areaJourney": s(r.get("Area_Journey")), "cluster": s(r.get("Cluster")),
        "market": s(r.get("Market")),
    }

r_out = []
for r in risks:
    sev = s(r.get("Risk_Severity")) or "Medium"
    pi = SEV_PI.get(sev, ("MEDIUM", "MEDIUM"))
    r_out.append({
        "externalId": s(r.get("Risk_ID")),
        "linkedTask": s(r.get("Linked_Programme_Record_ID")),
        "title": s(r.get("Title")), "description": s(r.get("Detailed_Description")),
        "category": RISK_CAT.get(s(r.get("Risk_Type")) or "", "DELIVERY"),
        "probability": pi[0], "impact": pi[1],
        "status": RISK_STATUS.get(s(r.get("Status")) or "", "Open"),
        "owner": clean_owner(r.get("Owner")), "workstream": s(r.get("Workstream")),
        "requiredAction": s(r.get("Required_Action")), "relatedDeliverable": s(r.get("Related_Deliverable")),
        "priority": priority(r.get("Priority")),
        "traceRef": f"{s(r.get('Source_Sheet'))}:{s(r.get('Source_Row'))}",
        "evidence": s(r.get("Source_Evidence")),
        **taxonomy(r),
    })

c_out = []
for r in cons:
    c_out.append({
        "externalId": s(r.get("Constraint_ID")),
        "linkedTask": s(r.get("Linked_Programme_Record_ID")),
        "title": s(r.get("Title")), "description": s(r.get("Detailed_Description")),
        "constraintType": s(r.get("Constraint_Type")), "severity": s(r.get("Constraint_Severity")),
        "status": task_status(r.get("Status")), "priority": priority(r.get("Priority")),
        "owner": clean_owner(r.get("Owner")), "workstream": s(r.get("Workstream")),
        "requiredAction": s(r.get("Required_Action")), "relatedDeliverable": s(r.get("Related_Deliverable")),
        "traceRef": f"{s(r.get('Source_Sheet'))}:{s(r.get('Source_Row'))}",
        "evidence": s(r.get("Source_Evidence")),
        **taxonomy(r),
    })

d_out = []
for r in deps:
    d_out.append({
        "externalId": s(r.get("Dependency_ID")),
        "linkedTask": s(r.get("Linked_Programme_Record_ID")),
        "title": s(r.get("Title")), "description": s(r.get("Detailed_Description")),
        "dependencyType": s(r.get("Dependency_Type")),
        "status": DEP_STATUS.get(s(r.get("Dependency_Status")) or "", "OPEN"),
        "owner": clean_owner(r.get("Owner")), "workstream": s(r.get("Workstream")),
        "requiredAction": s(r.get("Required_Action")), "relatedDeliverable": s(r.get("Related_Deliverable")),
        "traceRef": f"{s(r.get('Source_Sheet'))}:{s(r.get('Source_Row'))}",
        **taxonomy(r),
    })

def write(name, rows):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

write("master.jsonl", m_out)
write("risks.jsonl", r_out)
write("constraints.jsonl", c_out)
write("dependencies.jsonl", d_out)
print(f"staged master={len(m_out)} risks={len(r_out)} constraints={len(c_out)} dependencies={len(d_out)} -> {OUT}")
print("workstreams:", sorted({m['workstream'] for m in m_out if m['workstream']}))
