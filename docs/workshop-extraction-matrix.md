# Workshop Extraction Matrix

This matrix converts workshop evidence into execution controls. It is intentionally operational: each row must either drive a platform object or record an explicit unresolved gap.

## Source Catalogue

| Source | Type | Day | Authoritative for | Status / gap |
| --- | --- | --- | --- | --- |
| `Documents/_extracted/Day 1 Session 1 teams summary.txt` | Teams summary extract | 1 | Day 1 summary, decisions, open questions | Available |
| `Documents/_extracted/Day 1 Session 1 teams transcript.txt` | Transcript extract | 1 | Speaker-level validation | Available, partial/noisy |
| `Documents/_extracted/Web_Migration_Workshop_Summary_v5_final_integrated.txt` | Consolidated notes | 1 | Workstreams, risks, dependencies, delivery framing | Available |
| `Documents/_extracted/Day 1 - Session 2 - Teams notes.txt` | Teams notes extract | 1 | Follow-up tasks, Cross Channels detail | Available |
| `Documents/_extracted/Day 1 - Session 3 - Teams Notes.txt` | Teams notes extract | 1 | Scope options and closing reflections | Available |
| `Documents/_extracted/Day 2 - Session 1.txt` | Teams/Otter extract | 2 | Delivery model, red/green templates, phasing, governance | Available |
| `Documents/_extracted/Day 2 - Session 2.txt` | Teams/Otter extract | 2 | Resourcing, roll-offs, secure web, ownership, close | Available |
| `Documents/Transcirpts/day 1/*.md/.vtt` | Transcript exports | 1 | Raw validation and reconciliation | Available |
| `WorkshopPack/00_INDEX.md` | Curated index | 1-2 | Source register, ID allocation, publish status | SSOT |
| `WorkshopPack/01_Context/*.md` | Context | 1-2 | Brief, glossary, people/teams, timeline/milestones | SSOT |
| `WorkshopPack/02_Sessions/*.md` | Session records | 1-2 | Session summaries, agenda, topics, outputs | SSOT |
| `WorkshopPack/03_Registers/*.md` | Registers | 1-2 | Decisions, actions, RAID, dependencies, questions, parking lot | SSOT |
| `WorkshopPack/04_Analysis/*.md` | Analysis lenses | 1-2 | Process, RACI, resourcing, technical, delivery, governance, comms/adoption | SSOT |
| `WorkshopPack/05_Executive/*.md` | Executive and QA | 1-2 | Executive summaries, reconciliation, QA caveats | SSOT |
| Board photographs / sticky-note images | Visual evidence | 1-2 | Board/sticky details requested by requirement | Not found in current workspace; record as evidence gap |

## Extraction To Execution Rows

| Source | Extracted item | Theme | Workstream | Required action | Deliverable | Gantt/WBS task | RAID / decision / dependency | Owner if known | Confidence | Gap if unresolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WorkshopPack/01_Context/timeline-and-milestones.md` | End-November migration date is fixed and budget-driven | Timeline constraint | Governance and PMO | Baseline programme deadline and escalation thresholds | Approved programme baseline | Phase 1 baseline and Phase 6 launch control | RSK-001, RSK-019 | Programme | Confirmed | None |
| `WorkshopPack/01_Context/timeline-and-milestones.md` | Personal foundations end-June and Personal section live end-July | Phased rollout | Design and Design Systems / Content and IA / Publishing | Build WBS around Personal-first sequence | Personal foundations package; Personal section launch package | Design foundations, content package, template handover, Personal go-live | DEC-015, DEC-022, DEP-017 | Design / Content / Programme | Confirmed target | Needs signed integrated roadmap |
| `WorkshopPack/03_Registers/decision-log.md` | Phased audience-based delivery replaces single big-bang plan | Delivery model | Governance and PMO | Encode phases, roadmap, Gantt and readiness by audience | Audience rollout plan | Phase 3-6 audience rollout tasks | DEC-015 | Programme | Confirmed | Scope still bounded per phase |
| `WorkshopPack/03_Registers/decision-log.md` | Four-squad model is proposed and resource-gated | Resourcing | Governance and PMO | Add resource decision, risk, capacity plan and executive escalation | Resourced squad model | Squad capacity confirmation task | DEC-016, RSK-024, TO-7 | Programme Leadership | Proposed | Funding/capacity unresolved |
| `WorkshopPack/03_Registers/decision-log.md` | Red/green-zone modular templates confirmed | Design governance | Design and Design Systems | Add template governance, change control and acceptance criteria | Template standards pack | Define red/green template rules; implement template change control | DEC-017, DEC-018, RSK-025 | Design / Dev | Confirmed | None |
| `WorkshopPack/03_Registers/decision-log.md` | Publishing gatekeeper gate confirmed | Publishing control | Publishing | Add publishing gate and sign-off workflow | Publishing readiness checklist | Define publishing gate and trained-builder requirement | DEC-019, RSK-027 | Design / Publishing | Confirmed | Tenant onboarding detail needed |
| `WorkshopPack/03_Registers/action-register.md` | Build formal go-live readiness checklist covering PGW, QAG, ServiceNow, security, comms, decommission | Readiness | Testing, Readiness and Go-Live | Create readiness gates and go/no-go checklist | Go-live readiness pack | Configure readiness gate set | ACT-013, RSK-013, ISS-005 | Programme | High | Gate owners and evidence need confirmation |
| `WorkshopPack/03_Registers/action-register.md` | Complete URL audit and redirect mapping | URL/IA | Content and IA | Add URL audit deliverable and dependency on SEO/redirect testing | URL audit and redirect map | Audit URLs; define redirects; validate switch-off | ACT-017, DEP-005, RSK-021 | Natalie / Execution | High | Exact URL inventory not yet in DB |
| `WorkshopPack/03_Registers/action-register.md` | Create content readiness checklist and asset standards pack | Content readiness | Content and IA | Add deliverable and readiness criterion | Content readiness checklist | Define content standards and asset repository | ACT-019, DEP-006, RSK-016 | Content / OMDS | High | Asset repository decision pending |
| `WorkshopPack/03_Registers/action-register.md` | Implement automated testing and DevOps quality gates | Technical readiness | Technical Migration | Add technical readiness gate, testing tasks and evidence requirements | DevOps quality gate report | Implement CI/CD quality checks and Playwright reporting | ACT-061, DEC-021, RSK-006 | Gareth / Daniel / Execution | Confirmed target | Tooling detail to confirm |
| `WorkshopPack/03_Registers/action-register.md` | Set up workstream-lead cadence and weekly playback | Governance cadence | Governance and PMO | Add recurring governance meetings | Governance calendar | Create twice-weekly leadership check-ins and weekly playback | ACT-062, DEC-027 | Gareth | Confirmed | Calendar dates after initial week need recurrence |
| `WorkshopPack/03_Registers/action-register.md` | Integrate all team boards into a single Jira construct | Unified tracking | Governance and PMO | Add task dependency/workstream status workflow | Unified programme tracker | Integrate boards and load milestones/priorities/dependencies/confidence | ACT-069, ACT-070, DEC-027 | Tsoaeli / stream leads | Confirmed | Jira access/data not present |
| `WorkshopPack/03_Registers/action-register.md` | Clarify pen-test scope and integrate security into releases | Security readiness | Technical Migration / Testing | Add security readiness gate | Security validation plan | Confirm pen-test scope and release approval evidence | ACT-072, RSK-022, DEP-019 | Gareth / Nzama | High | Security owner confirmation required |
| `WorkshopPack/04_Analysis/delivery-and-programme.md` | Linear delivery will not meet year-end under current capacity | Executive escalation | Governance and PMO | Add executive risk, steering pack item and resourcing decision | Capacity gap analysis | Escalate resource-vs-scope decision | RSK-024, RSK-031, DEC-016 | Programme Leadership | Confirmed risk | Sponsor decision required |
| `WorkshopPack/04_Analysis/delivery-and-programme.md` | Contact centre and stakeholder comms are part of go-live readiness | Support readiness | Contact Centre and Support Readiness / Internal Communications | Add support/comms readiness gates and tasks | Contact centre readiness pack; comms plan | Brief contact centre; prepare scripts; set feedback loop | ACT-013, RSK-013 | Programme | Inferred from readiness inputs | Detailed scripts not captured |
| `WorkshopPack/04_Analysis/change-adoption-comms.md` | Change/adoption/comms needs formal treatment | Adoption | Internal Communications / External Communications / Training and Adoption | Add comms/training workstreams and readiness gates | Communications and training plan | Build internal/external comms and training tasks | Analysis lens G | Inferred | Owners and dates require validation |
| `WorkshopPack/01_Context/timeline-and-milestones.md` | Hypercare must operate as first post-launch support mode | Stabilisation | Hypercare and Stabilisation | Add hypercare phase, daily stand-ups, issue triage and exit criteria | Hypercare plan and exit report | Run hypercare dashboard and daily triage | Requirement + readiness analysis | Programme / Support | Inferred from requirement | Specific hypercare owners unknown |

## Traceability Rules

1. Seeded tasks, deliverables, risks, decisions, dependencies, milestones, governance meetings and readiness gates must reference a source, trace reference, or explicit inferred rationale.
2. Items derived from professional programme-control practice must be marked `INFERRED` and include the requirement or workshop theme that justified them.
3. Missing board/sticky images, unresolved owners, missing dates, missing approvals and unavailable external systems must become gaps, assumptions, or decision-needed records.
4. Validation must fail when a major control item has neither evidence nor an explicit gap/inferred rationale.
