# Decision Log (DEC)

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001 (Teams "Decisions" list), SRC-002 (whiteboard synthesis) — Day 1.
Per Agent.md: only **Confirmed** where the workshop clearly agreed; otherwise **Proposed / Deferred / Unclear**. The headline scope decision remains **open**, which keeps several downstream decisions Proposed.

## Quick reference

| ID | Decision | Status | Owner | Session |
| --- | --- | --- | --- | --- |
| DEC-001 | Define web transformation scope (migration / uplift / decommission) | Proposed (unresolved boundary) | Programme (GB) | D1S1 |
| DEC-002 | Set platform & customer success metrics | Confirmed | GB / Programme | D1S1 |
| DEC-003 | MVP = new navigation (4 audiences) + secure web IA | Confirmed | GB / Product | D1S1 |
| DEC-004 | Identify & communicate migration dependencies (OMA, rewards, site owners) | Confirmed (intent) | Programme | D1S1 |
| DEC-005 | Run per-workstream whiteboard exercise → consolidate into programme plan | Confirmed | GB | D1S1 |
| DEC-006 | Establish design foundations (IA, navigation, templates, content standards) | Confirmed | Design / OMDS | D1S1 |
| DEC-007 | Define governance & approval for design handover (entry/exit gates) | Proposed | Design / Programme | D1S1 |
| DEC-008 | Product pages → new templates; other pages move as-is / restyle | Proposed | Design / Execution | D1S1 |
| DEC-009 | Implement automated testing & DevOps pipeline enforcement | Proposed | Execution | D1S1 |
| DEC-010 | Assign dedicated migration publisher; ring-fence from BAU | Proposed | Publishing / Programme | D1S1 |
| DEC-011 | Engage SEO team ≥2 months before QA for tagging & validation | Confirmed (intent) | SEO / Programme | D1S1 |
| DEC-012 | Phased decommissioning — turn off legacy components as migrated (not all at end) | Proposed | Programme/Execution | D1S2/3 |
| DEC-013 | Treat Faoli Bank as a separate brand/entity with its own IA & governance | Proposed | Programme | D1S2/3 |
| DEC-014 | Allow some teams to skip the design phase and implement directly (dependency-based) | Proposed | Programme/Design (GB/Brent) | D1S2/3 |

---

## Detailed entries

### DEC-001 — Define web transformation scope
- **Description:** Formally define and bound the programme scope across migration, experience uplift and decommissioning — i.e. resolve whether it is a content migration, a web transformation, or a hybrid.
- **Status:** **Proposed / Unclear** — directional intent agreed, but the actual scope boundary is unresolved (the programme's defining open question).
- **Day / Session:** Day 1 / Session 1.
- **Owner:** Programme (Gareth Bew). **Approver:** Executive sponsor / Steering (`Unconfirmed`).
- **Teams impacted:** All.
- **Rationale:** Scope ambiguity changes effort, budget, timeline and risk profile.
- **Options considered:** (a) migration only; (b) full transformation; (c) bounded hybrid.
- **Trade-offs:** Speed/cost vs experience uplift & technical debt reduction.
- **Dependencies:** Drives DEC-007/008/009, resourcing, timeline.
- **Risks created/reduced:** Reduces RSK-001 if resolved; leaving it open sustains Very-High risk.
- **Follow-up:** Day 2 — translate scope into actionable work + resourcing/constraint impact.
- **Reference:** SRC-001 Decisions; SRC-002 Exec Summary / Priority Decisions.

### DEC-002 — Set platform & customer success metrics
- **Description:** Adopt platform metrics (analytics coverage, commercialisation/tenant onboarding, DS compliance, availability, <3s load, automated pipelines, code scanning) and customer metrics (organic traffic, session duration, NPS, friction reduction, active digital users).
- **Status:** **Confirmed** (stated by GB as success measures).
- **Day / Session:** D1S1. **Owner:** GB / Programme.
- **Teams impacted:** All. **Rationale:** Define what "good" looks like; basis for prioritisation.
- **Follow-up:** Use metrics to help prioritise which sections migrate vs deprioritise (links ACT-018).
- **Reference:** SRC-001 (success measures, customer metrics).

### DEC-003 — MVP scope
- **Description:** MVP = new navigation structure for four simplified audiences + secure web information architecture.
- **Status:** **Confirmed** (as MVP intent); detailed MVP deliverable for the 5-month window still to define (QST-004).
- **Day / Session:** D1S1. **Owner:** GB / Product.
- **Teams impacted:** Design, Execution, Publishing, Regional. **Reference:** SRC-001.

### DEC-004 — Identify & communicate migration dependencies
- **Description:** Identify and communicate migration dependencies including OMA colleagues, rewards, and other site owners; define/communicate specific tasks per business area.
- **Status:** **Confirmed (intent)** — execution actions pending (ACT-002).
- **Day / Session:** D1S1. **Owner:** Programme. **Reference:** SRC-001.

### DEC-005 — Whiteboard exercise → programme plan
- **Description:** Break into workstream teams (30-min timeboxes) to identify deliverables, constraints, dependencies, risks and milestones; consolidate into a working programme plan with RAID/action/decision logs.
- **Status:** **Confirmed** (executed in session). **Owner:** GB. **Reference:** SRC-001.

### DEC-006 — Establish design foundations
- **Description:** Establish design foundations — IA, navigation containers, templates, and standards (SEO, brand, tone, content) — as essential for migration rollout.
- **Status:** **Confirmed** (agreed as foundational). **Owner:** Design / OMDS. **Reference:** SRC-001/002.

### DEC-007 — Governance & approval for design handover
- **Description:** Define governance, approval routing (Group Marketing, internal/external stakeholders, clusters) and clear entry/exit-gate / handover criteria between teams.
- **Status:** **Proposed** — model agreed in principle; SLAs/exception process not finalised (ACT-006).
- **Owner:** Design / Programme. **Reference:** SRC-001/002.

### DEC-008 — Page treatment (new templates vs as-is)
- **Description:** Product-related pages receive new templates; other pages (e.g. About Us, Careers) move as-is / restyled or retain current UI.
- **Status:** **Proposed** — depends on the "as-is" definition (QST-002) and participant confirmation on non-product pages (QST-003).
- **Owner:** Design / Execution. **Trade-offs:** consistency vs speed; accept rework risk. **Reference:** SRC-001/002.

### DEC-009 — Automated testing & DevOps pipeline enforcement
- **Description:** Implement automated testing harness, AI-assisted dev and DevOps pipeline/quality-gate enforcement (code scanning).
- **Status:** **Proposed** — constrained by Daniel's capacity (RSK-006). **Owner:** Execution. **Reference:** SRC-001/002.

### DEC-010 — Dedicated migration publisher
- **Description:** Ring-fence a dedicated publishing resource for migration, separating it from BAU load.
- **Status:** **Proposed** — depends on securing capacity (ACT-003, RSK-002). **Owner:** Publishing / Programme. **Reference:** SRC-001.

### DEC-011 — SEO engagement lead time
- **Description:** Engage the SEO team at least two months before QA to provide tagging guidance/scripts and validation.
- **Status:** **Confirmed (intent)** — SEO owner/tooling still to confirm (RSK-009, QST-009). **Owner:** SEO / Programme. **Reference:** SRC-001.

### DEC-012 — Phased decommissioning
- **Description:** Decommission legacy infrastructure progressively — turn off old-platform components as each is migrated, rather than waiting until the end.
- **Status:** **Proposed** — process, approval requirements and sequencing to be defined (ACT-040).
- **Day / Session:** D1 S2/S3. **Owner:** Programme/Execution.
- **Risks created/reduced:** Reduces big-bang cutover risk; needs careful redirect/switch-off control (RSK-004).
- **Reference:** SRC-005/006 follow-up tasks.

### DEC-013 — Faoli Bank as separate brand
- **Description:** Treat Faoli Bank as a separate entity/brand from Old Mutual, following its own information architecture, branding and governance; confirm ownership of bank-section pages (incl. personal loans).
- **Status:** **Proposed** — brand name/spelling and ownership to validate (QST-017). Supersedes the earlier unclear "Boerewors"/bank-treatment item.
- **Day / Session:** D1 S2/S3. **Owner:** Programme.
- **Reference:** SRC-005/006 follow-up tasks; SRC-002 (bank-page treatment).

### DEC-014 — Allow design-phase skip for some teams
- **Description:** Permit some teams to skip the design phase and implement directly, based on dependencies, to accelerate delivery.
- **Status:** **Proposed** — to be documented with criteria (GB/Brent); tension with DEC-006/007 governance.
- **Day / Session:** D1 S2/S3. **Owner:** Programme/Design.
- **Risks:** Could increase design drift / inconsistency (RSK-012) — needs guardrails.
- **Reference:** SRC-005/006 follow-up tasks.

---

## Decisions required but not yet taken (tracked as open — see open-questions.md / SRC-002)
DS Build vs Platform Build ownership & acceptance criteria; content-pack minimum standard; image repository & aspect-ratio standards; theming model (incl. dark theme & Wealth CI); article-page skinning & content carousel; legacy switch-off criteria & non-migrated-site rollout; secure-web/SSO treatment; Bank/"Boerewors" ownership. These are captured under QST and as Critical/High controls in [delivery-and-programme.md](../04_Analysis/delivery-and-programme.md).
