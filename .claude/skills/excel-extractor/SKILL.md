---
name: excel-extractor
description: Extract, profile, and validate data from Excel/CSV workbooks losslessly with full traceability. Use when asked to read/extract/parse a .xlsx or .csv, profile spreadsheet structure, convert sheets to JSON/CSV, reconcile multiple tabs, or audit a workbook's data quality before loading it anywhere.
---

# Excel Extractor

Turn messy real-world workbooks into clean, traceable, machine-readable data — without losing or inventing anything.

## Operating rules (non-negotiable)
1. **Never fabricate.** Blank stays blank (or an explicit `TBC`/`N/A` token you document). Do not infer values to fill gaps.
2. **Preserve provenance.** Every extracted row keeps `Source_Sheet` + `Source_Row` back to the original cell range. Traceability is the deliverable, not an extra.
3. **Profile before you trust.** Report sheet inventory, used-range, header row, row counts, and which sheets are data vs cover/pivot/reference — before extracting.
4. **Separate data from control.** Mark which sheets are uploadable data vs reference/instructions. Prefix conventions (`UPLOAD_`, `REFERENCE_`) make this explicit.
5. **Quarantine, don't drop.** Quality problems go to a validation list with a suggested action and load-readiness flag — they are not silently discarded.

## Tooling (Windows host)
Use Python + `openpyxl` (confirmed available). `read_only=True, data_only=True` to get computed values, not formulas.

```python
import openpyxl
wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
for ws in wb.worksheets:
    rows = list(ws.iter_rows(values_only=True))
    header = rows[0]; data = [dict(zip(header, r)) for r in rows[1:] if any(c is not None for c in r)]
```
Node has no xlsx lib here — don't reach for `xlsx`/`exceljs`.

## Workflow
1. **Inventory** — list sheets, `max_row`/`max_col`, headers per sheet.
2. **Classify** — data vs reference vs cover/pivot. Note the authoritative source when tabs disagree (record-level tabs usually beat a consolidated list).
3. **Normalise** — Excel date serials → `YYYY-MM-DD`; effort cells showing 1900-dates → numeric days; trim whitespace; normalise taxonomy values (keep a Source_Value→Clean_Value map with counts + rationale).
4. **Validate** — emit a validation sheet: missing owner/date/effort, invalid source formulas, taxonomy mismatches, broad/blank clusters. Each row gets `Load_Readiness` + `Suggested_Action`.
5. **Emit** — clean tables (xlsx/csv/jsonl), a schema sheet (column order + purpose + upload status), and a dashboard of counts.

## Integrity checks to always run
- ID uniqueness per entity.
- Referential integrity (foreign keys resolve to a parent ID; report orphans + blanks).
- Date sanity (end ≥ start).
- Count reconciliation (parsed rows == manifest/dashboard counts).

See `references/integrity_checks.py` in this skill for a reusable harness.
