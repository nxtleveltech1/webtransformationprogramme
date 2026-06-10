# Seed Package Dry-Run Report (READ-ONLY)

**Package:** Programme_Control_Production_Hardened_Seed_Package
**Payload xlsx sha256:** `0b609a021a8cb9a882abbcae47139274cd141854e65f09a03edda9f936facea1`
**Run:** 2026-06-09T04:19:31.234Z
**Total payload rows analysed:** 1894

> **NO DATABASE WRITES WERE PERFORMED.** This script only reads the live DB and the package payload. It does not create, update, or delete any record.

## 1. Manifest count verification — PASS ✓

- ✓ programme_activities: parsed 271 / manifest 271
- ✓ deliverables: parsed 262 / manifest 262
- ✓ milestones: parsed 79 / manifest 79
- ✓ actions: parsed 271 / manifest 271
- ✓ dependencies: parsed 144 / manifest 144
- ✓ risks: parsed 340 / manifest 340
- ✓ issues: parsed 12 / manifest 12
- ✓ constraints: parsed 158 / manifest 158
- ✓ decisions: parsed 66 / manifest 66
- ✓ timeline: parsed 271 / manifest 271
- ✓ governance_summary: parsed 10 / manifest 10
- ✓ workstream_status: parsed 10 / manifest 10

## 2. Per-entity classification

| Entity | Target model | Rows | OVERWRITE | UPDATE? | CREATE | NO_TARGET | fabrication-flagged |
|---|---|--:|--:|--:|--:|--:|--:|
| programme_activities | Task (WBS) | 271 | 0 | 0 | 271 | 0 | 269 (99%) |
| deliverables | Deliverable | 262 | 34 | 0 | 228 | 0 | 0 (0%) |
| milestones | Milestone (no externalId on model — title match only) | 79 | 0 | 0 | 79 | 0 | 79 (100%) |
| actions | Action (payload A-### vs live ACT-###) | 271 | 0 | 0 | 271 | 0 | 271 (100%) |
| dependencies | Dependency | 144 | 22 | 0 | 122 | 0 | 122 (85%) |
| risks | Risk | 340 | 32 | 0 | 308 | 0 | 340 (100%) |
| issues | Issue | 12 | 11 | 0 | 1 | 0 | 1 (8%) |
| constraints | NONE — no programme-constraint register model exists | 158 | 0 | 0 | 0 | 158 | 0 (0%) |
| decisions | Decision | 66 | 28 | 0 | 38 | 0 | 66 (100%) |
| timeline | Task schedule (merges into programme_activities by activity_id) | 271 | 0 | 0 | 271 | 0 | 187 (69%) |
| governance_summary | Workstream (rag / oneLineStatus) | 10 | 1 | 1 | 8 | 0 | 0 (0%) |
| workstream_status | NONE — derived stats, report-only | 10 | 0 | 0 | 0 | 10 | 0 (0%) |

## 3. ⛔ DANGER — would overwrite 128 live records

These payload rows share an externalId with a **real, existing** live record in the target model. A load that upserts by externalId would replace live content with the package's templated content.

| Entity | Payload id | → Live externalId | Live record |
|---|---|---|---|
| deliverables | DEL-001 | DEL-001 | Consolidated workshop output register |
| deliverables | DEL-002 | DEL-002 | Programme WBS and Gantt baseline |
| deliverables | DEL-003 | DEL-003 | URL audit and redirect map |
| deliverables | DEL-004 | DEL-004 | Component and template audit |
| deliverables | DEL-005 | DEL-005 | Personal design foundations package |
| deliverables | DEL-006 | DEL-006 | Publishing governance and trained-builder gate |
| deliverables | DEL-007 | DEL-007 | DevOps quality gate implementation |
| deliverables | DEL-008 | DEL-008 | Personal content package and article migration |
| deliverables | DEL-009 | DEL-009 | Country and secure-web migration plan |
| deliverables | DEL-010 | DEL-010 | Go-live readiness checklist |
| deliverables | DEL-011 | DEL-011 | Contact centre and support readiness pack |
| deliverables | DEL-012 | DEL-012 | Training and adoption pack |
| deliverables | DEL-013 | DEL-013 | Internal communications plan |
| deliverables | DEL-014 | DEL-014 | External communications plan |
| deliverables | DEL-015 | DEL-015 | Go-live decision and cutover pack |
| deliverables | DEL-016 | DEL-016 | Hypercare operating model and exit report |
| deliverables | DEL-017 | DEL-017 | Content audit register |
| deliverables | DEL-018 | DEL-018 | Environment and integration audit |
| deliverables | DEL-019 | DEL-019 | Stakeholder ownership map |
| deliverables | DEL-020 | DEL-020 | Enhanced components and templates |
| deliverables | DEL-021 | DEL-021 | Test execution results pack |
| deliverables | DEL-022 | DEL-022 | Cutover and smoke test record |
| deliverables | DEL-023 | DEL-023 | Executive and staff comms pack |
| deliverables | DEL-024 | DEL-024 | Customer and partner comms pack |
| deliverables | DEL-025 | DEL-025 | Agent scripts and escalation pack |
| deliverables | DEL-026 | DEL-026 | Training completion register |
| deliverables | DEL-027 | DEL-027 | Go-live decision record |
| deliverables | DEL-028 | DEL-028 | Hypercare daily issue log |
| deliverables | DEL-029 | DEL-029 | Stabilisation exit report |
| deliverables | DEL-030 | DEL-030 | Template inventory audit |
| deliverables | DEL-031 | DEL-031 | CMS publishing workflow configuration |
| deliverables | DEL-032 | DEL-032 | Secure web and SSO configuration |
| deliverables | DEL-033 | DEL-033 | Steering committee status pack |
| deliverables | DEL-034 | DEL-034 | Input gaps register |
| dependencies | DEP-001 | DEP-001 | Contentstack dev + content/assets/URLs signed off before publishing |
| dependencies | DEP-002 | DEP-002 | Testing cannot begin until all pages built in Beta |
| dependencies | DEP-003 | DEP-003 | DS V2 deployed to Beta (Find an Advisor + templates) |
| dependencies | DEP-004 | DEP-004 | Figma/DS component audit before template scaling |
| dependencies | DEP-005 | DEP-005 | URL audit before switch-off/redirect decisions |
| dependencies | DEP-006 | DEP-006 | Content packs + cluster/SME content before sign-off |
| dependencies | DEP-007 | DEP-007 | Cross Channels depends on Web Platform for FE from PI2 |
| dependencies | DEP-008 | DEP-008 | EasiPlus depends on Funeral template + MFC sign-off |
| dependencies | DEP-009 | DEP-009 | SEO ≥2 months lead before QA |
| dependencies | DEP-010 | DEP-010 | Tax-free & flexi-invest pages link to migrated V2 journeys |
| dependencies | DEP-011 | DEP-011 | Service tree/dashboard solution for secure web |
| dependencies | DEP-012 | DEP-012 | Paid Ads URL requirements from Group Marketing |
| dependencies | DEP-013 | DEP-013 | Notify Nthabi of URL changes for GA tracking |
| dependencies | DEP-014 | DEP-014 | Final advisor flow into beta (Luvuyo) |
| dependencies | DEP-015 | DEP-015 | Security pen-test/crowdsource before go-live |
| dependencies | DEP-016 | DEP-016 | ServiceNow API updates + approvals before prod |
| dependencies | DEP-017 | DEP-017 | Personal IA + core templates + content guidelines complete before dev/build |
| dependencies | DEP-018 | DEP-018 | Product pages complete before EasiPlus & dependent sales journeys deploy |
| dependencies | DEP-019 | DEP-019 | IA sign-off per audience before each downstream stream proceeds (sequential) |
| dependencies | DEP-020 | DEP-020 | Secure-web portfolio-view technical requirements before Sept roll-off |
| dependencies | DEP-021 | DEP-021 | Template handover cadence (~every 2 weeks) feeds content creation & parallel bui |
| dependencies | DEP-022 | DEP-022 | Desktop Figma output (source of truth) for automation & Contentstack mapping |
| risks | RSK-001 | RSK-001 | Migration vs transformation scope ambiguity |
| risks | RSK-002 | RSK-002 | Publishing capacity insufficient (~1,530 pages, 2 publishers) |
| risks | RSK-003 | RSK-003 | 'As-is' definition unclear |
| risks | RSK-004 | RSK-004 | URL audit/redirect handling incomplete |
| risks | RSK-005 | RSK-005 | Regional resources cut |
| risks | RSK-006 | RSK-006 | Daniel limited capacity for automation/testing |
| risks | RSK-007 | RSK-007 | OMDS treated as UI library not governance |
| risks | RSK-008 | RSK-008 | Most components don't exist in Contentstack |
| risks | RSK-009 | RSK-009 | SEO & analytics ownership not finalised |
| risks | RSK-010 | RSK-010 | Environment sequencing not defined |
| risks | RSK-011 | RSK-011 | Observability/analytics tagging added too late |
| risks | RSK-012 | RSK-012 | Component sprawl / design debt |
| risks | RSK-013 | RSK-013 | Go-live readiness activities open |
| risks | RSK-014 | RSK-014 | Secure web migration at risk |
| risks | RSK-015 | RSK-015 | Servicing transactions at risk (BW 1/9) |
| risks | RSK-016 | RSK-016 | Unstandardised images/assets |
| risks | RSK-017 | RSK-017 | Front-end resource exit after PI2 |
| risks | RSK-018 | RSK-018 | BA capacity constrained |
| risks | RSK-019 | RSK-019 | Full scope ~2027 vs end-Nov window |
| risks | RSK-020 | RSK-020 | No centralised knowledge system |
| risks | RSK-021 | RSK-021 | ~95% URLs changing impacts e-commerce/GA |
| risks | RSK-022 | RSK-022 | Security pen-test + ServiceNow not confirmed |
| risks | RSK-023 | RSK-023 | Key-resource roll-offs — migration/feature team ~Sept 10; most knowledgeable QE  |
| risks | RSK-024 | RSK-024 | Linear (current-capacity) delivery will not meet year-end; full scope extends we |
| risks | RSK-025 | RSK-025 | Post-sign-off red-zone template changes cascade across content + code on all aff |
| risks | RSK-026 | RSK-026 | Single points of failure — only Gareth & Natalie build templates; Bernice overlo |
| risks | RSK-027 | RSK-027 | Governance/template drift without controls (Contentstack ↔ Figma; new tenants) |
| risks | RSK-028 | RSK-028 | Stakeholder sign-off delays extend template sign-off (esp. sequential Personal o |
| risks | RSK-029 | RSK-029 | EasiPlus & dependent journeys blocked until Funeral/product pages complete |
| risks | RSK-030 | RSK-030 | Secure-web portfolio-view requirements unclear before Sept roll-off → planning b |
| risks | RSK-031 | RSK-031 | Not all year-end goals will be delivered → sponsor expectation-management requir |
| risks | RSK-032 | RSK-032 | Country teams without dedicated content/design resources (OMAR) cannot self-migr |
| issues | ISS-001 | ISS-001 | Full Brand/CI not approved (interim only) |
| issues | ISS-002 | ISS-002 | No reliable total page count; manual sheet tracking |
| issues | ISS-003 | ISS-003 | Secure web incomplete; no service-tree solution |
| issues | ISS-004 | ISS-004 | Botswana servicing: 1 of 9 complete |
| issues | ISS-005 | ISS-005 | Go-live readiness activities open |
| issues | ISS-006 | ISS-006 | BA on medical leave; recruitment ongoing |
| issues | ISS-007 | ISS-007 | Single person covers all publishing |
| issues | ISS-008 | ISS-008 | No centralised knowledge system today |
| issues | ISS-009 | ISS-009 | Current under-resourcing across all workstreams; teams beyond capacity |
| issues | ISS-010 | ISS-010 | Unclear business ownership for several journeys (compliments, complaints, unclai |
| issues | ISS-011 | ISS-011 | Portfolio-view dependencies/requirements unclear for Secure Web; aggravated by S |
| decisions | DEC-001 | DEC-001 | Migration vs transformation |
| decisions | DEC-002 | DEC-002 | Success metrics |
| decisions | DEC-003 | DEC-003 | MVP |
| decisions | DEC-004 | DEC-004 | Migration dependencies |
| decisions | DEC-005 | DEC-005 | Whiteboard -> plan |
| decisions | DEC-006 | DEC-006 | Design foundations |
| decisions | DEC-007 | DEC-007 | Handover governance |
| decisions | DEC-008 | DEC-008 | Page treatment |
| decisions | DEC-009 | DEC-009 | Automated testing |
| decisions | DEC-010 | DEC-010 | Dedicated publisher |
| decisions | DEC-011 | DEC-011 | SEO lead time |
| decisions | DEC-012 | DEC-012 | Phased decommissioning |
| decisions | DEC-013 | DEC-013 | Faoli Bank separate brand |
| decisions | DEC-014 | DEC-014 | Design-phase skip |
| decisions | DEC-015 | DEC-015 | Phased audience-based delivery |
| decisions | DEC-016 | DEC-016 | Four-squad parallel model |
| decisions | DEC-017 | DEC-017 | Red/green-zone templates |
| decisions | DEC-018 | DEC-018 | Template change-control |
| decisions | DEC-019 | DEC-019 | Publishing gatekeeper gate |
| decisions | DEC-020 | DEC-020 | Content + analytics co-location |
| decisions | DEC-021 | DEC-021 | DevOps quality gates + Playwright |
| decisions | DEC-022 | DEC-022 | Personal foundations end-June |
| decisions | DEC-023 | DEC-023 | Article & news handling |
| decisions | DEC-024 | DEC-024 | Defer article/news URL structure |
| decisions | DEC-025 | DEC-025 | Country/site delivery model |
| decisions | DEC-026 | DEC-026 | Tenant operating model |
| decisions | DEC-027 | DEC-027 | Unified Jira + cadence |
| decisions | DEC-028 | DEC-028 | Bank owns its pages |
| governance_summary | Publishing | publishing | Publishing |

## 4. Fabrication signals

**1335 of 1894 rows (70%) carry at least one fabrication flag.**

- `id-beyond-live-range`: 843 rows
- `boilerplate-phrase`: 831 rows
- `owner-not-a-person`: 322 rows

### Examples

- **programme_activities ACT-001** [boilerplate-phrase, owner-not-a-person] — Design navigation structure based on the IA
- **programme_activities ACT-002** [boilerplate-phrase, owner-not-a-person] — Complete footer navigation structure based on the IA
- **programme_activities ACT-003** [boilerplate-phrase, owner-not-a-person] — Design Landing Page Template
- **programme_activities ACT-004** [boilerplate-phrase, owner-not-a-person] — Design Section Page Template
- **programme_activities ACT-005** [boilerplate-phrase, owner-not-a-person] — Finalise Category Page Template
- **programme_activities ACT-006** [boilerplate-phrase, owner-not-a-person] — Finalise Product Page Template
- **programme_activities ACT-007** [boilerplate-phrase, owner-not-a-person] — Design Utility Template: Contact Us
- **programme_activities ACT-008** [boilerplate-phrase, owner-not-a-person] — Design Utility Template: All Calculators
- **programme_activities ACT-009** [boilerplate-phrase, owner-not-a-person] — Design Utility Template: Calculators Page
- **programme_activities ACT-010** [boilerplate-phrase, owner-not-a-person] — Design Tenant Template
- **programme_activities ACT-011** [boilerplate-phrase, owner-not-a-person] — Design Utility Templates: About Us
- **programme_activities ACT-012** [boilerplate-phrase, owner-not-a-person] — Design Utility Template: Careers

## 5. Read-out

- **128** rows would overwrite real live records (see §3) — not safe to load by externalId.
- **1597** rows have no live match (would be new records); cross-check against the fabrication flags before treating any as real.
- **168** rows have no platform model to land in (constraints, workstream_status).
- Decide the real strategy from `rows.jsonl` (e.g. a vetted CREATE-only, non-fabricated subset) — or reject the package.
