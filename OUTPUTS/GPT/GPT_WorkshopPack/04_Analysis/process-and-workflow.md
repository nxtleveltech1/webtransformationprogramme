# A. Business Process & Workflow

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001, SRC-002 (Day 1).

## End-to-end delivery lifecycle (future state)

```
Define -> Discovery -> Design -> Approval -> Handover -> Support -> Go Live
                                                                      |
                                                          (Go Live + Decommission run in parallel)
```

| Stage | Inputs | Key activities | Exit / completion criteria | Owner(s) |
| --- | --- | --- | --- | --- |
| Define | Brief, scope, problem statement | Capture brief, scope, stakeholder understanding | Scope & problem agreed before discovery | Programme/Product |
| Discovery | Analytics, research, existing content | Stakeholder engagement, SEO, copy, ecosystem review, product, compliance, brand, functional analysis, OMDS input; propose delete/retain/update | Content owner, SME, cluster, SEO, analytics identified | Design/Content |
| Design | Discovery outputs | Desktop+mobile design, copy readiness, SEO readiness, DS/technical review, testing, functional analysis | Copy ready, SEO ready, image standards known, content model confirmed, hardcoded content flagged | Design/OMDS |
| Approval | Designs, content | Route through Group Marketing, internal/external stakeholders, clusters | Business, brand, compliance, cluster, DS approvals complete | Group Marketing/Approvers |
| Handover | Approved design + content pack | Package design-ready, DS approval, final copy, SEO input, sign-offs, build rules | Content pack + URL mapping + rules + sign-offs provided | Design → DS/Web Dev/Publish |
| Support | Built pages | Continuous QA, updates, sign-offs, SEO sign-off, copy/DS validation | QA, redirects, switch-off criteria, validations complete | QA/Support |
| Go Live | Acceptance criteria met | Cutover; simultaneous legacy decommission | Design+content+DS+SEO+build+publishing+support acceptance satisfied | Programme/Execution |

## Current-state pain points
- Publishing is the second-last step, blocked by upstream design/dev/content readiness, asset sign-off, approved URLs.
- BAU (daily/monthly/campaign updates) competes heavily with migration (85 tickets/5 days reference).
- Manual page-by-page tracking in a Google Sheet; no reliable total page count.
- Dual maintenance of current + QA branches during migration (manual dual updates for product/fee changes).
- No centralised/shared knowledge system → delays and lost history.
- Only OMF submits structured design briefs using platform components; others submit unstructured requests.

## Publishing micro-workflow
```
Dev complete (Contentstack) + content/assets/URLs signed off
   -> Build page in Beta (new template ~2h | as-is ~30min)
   -> Track in publishing spreadsheet
   -> Testing (only once ALL pages built in Beta)
   -> Cutover / Go Live
   -> Decommission legacy + redirects
```

## Handoffs, control points & gates
- **Entry/exit gates** required between functions — work transfers only when "ready" (DEC-007).
- **Approval gate:** new templates/sections need approval before bundling/publishing.
- **Desk check:** BAs + designers validate against approved designs before QA.
- **Content gates:** Discovery → Design → Approval → Handover → Support/Go-Live (see content-governance in SRC-002).
- **Switch-off control:** legacy page switch-off tied to URL audit + content sign-off + QA evidence + SEO validation + business approval.

## Automation opportunities
- AI-assisted page creation in Contentstack (feasibility TBD — ASM-006).
- Automation harness + repeatable automated tests + pipeline enforcement.
- Analytics tracking embedded in CMS content (reduce developer reliance).
- Figma→Contentstack→code component name mapping + design-system tagging to enable automation/metadata matching (ACT-047).

## Decommissioning approach (S2/S3)
- **Phased decommissioning** (DEC-012): turn off legacy components as each is migrated, rather than a single end-of-programme switch-off. Process, approval and sequencing to be defined (ACT-040-series); must respect redirect/switch-off controls.

## Design-phase governance exception (S2/S3)
- **Design-skip allowance** (DEC-014): some teams may implement directly without the full design phase, based on dependencies. Needs documented criteria and guardrails to avoid design drift (RSK-012).

## Bottlenecks / rework loops
- Publishing capacity (RSK-002); approval bottlenecks (RSK-007); late content/SEO readiness causing post-build rework (RSK-009/016); component build backlog (RSK-008).
