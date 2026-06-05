# Risk Log (RSK)

**Source:** SRC-001, SRC-002 (Day 1, incl. Consolidated Risk & Action View + Final RAID additions); SRC-008/009 (Day 2).
Categories per Agent.md. Probability/Impact use High/Medium/Low/Unknown. Day 2 risks are RSK-023–RSK-032.

## Register

| ID | Risk | Category | Prob | Impact | Owner | Escalate | Mitigation required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RSK-001 | Migration vs transformation scope ambiguity changes scope/effort/budget/timeline | Business/Programme | High | High | Programme (GB) | Yes | **Day 2:** mitigated via phased audience delivery (DEC-015) — boundary now managed per phase; residual ambiguity in later phases. Formal scope decision + revised plan (ACT-001) |
| RSK-002 | Publishing capacity insufficient for migration volume (~1,530 pages, 2 publishers) | Resource | High | High | Publishing/Programme | Yes | Dedicated OMAR capacity + tracker (ACT-003, ACT-005) |
| RSK-003 | "As-is" definition unclear → blocks estimates, testing scope, decommission | Process | High | High | Programme/Design | Unclear | Define & approve as-is (ACT-004) |
| RSK-004 | URL audit/redirect handling incomplete; excessive redirects harm SEO | Technical/Data | Medium | High | Execution | Unclear | Complete URL audit; redirect/switch-off plan (ACT-017) |
| RSK-005 | Regional resources cut → delivery & quality risk | Resource | High | High | Programme/Regional | Yes | Resource review; confirm regional capacity (ACT-014) |
| RSK-006 | Daniel limited capacity for AI-assisted dev & automated testing | Resource/People | Medium | Medium | Execution | Unclear | Add automation/quality gates; resource plan (ACT-010) |
| RSK-007 | OMDS treated as UI library, not enterprise governance framework | Governance | Medium | High | Design/OMDS | Yes | OMDS operating model & design authority (ACT-006) |
| RSK-008 | Most components/compositions don't exist in Contentstack → must be built | Technical | High | High | Execution/OMDS | Unclear | Figma/DS component audit (ACT-008) |
| RSK-009 | SEO & analytics ownership not finalised; SEO not ready (blocking) | Process/Governance | High | High | SEO/Programme | Yes | SEO/analytics workshop; appoint owner (ACT-012) |
| RSK-010 | Environment sequencing (Beta/Staging/Prod/tooling) not defined | Technical | Medium | High | Execution | Unclear | Environment strategy & ownership (ACT-009) |
| RSK-011 | Observability/analytics tagging added too late | Technical | Medium | Medium | Execution | No | Embed observability reqs in delivery (ACT-011) |
| RSK-012 | Component sprawl / design debt without lifecycle control; enhanced components expand site scope | Technical/Process | Medium | Medium | OMDS | Unclear | Component lifecycle + impact register (ACT-007) |
| RSK-013 | Go-live readiness activities (ServiceNow, comms, decommission, security) open | Process/Governance | High | High | Programme | Yes | Go-live readiness checklist (ACT-013) |
| RSK-014 | Secure web migration at risk (shared services, service tree, portal convergence) | Technical/Delivery | High | High | Programme/Regional | Yes | Mitigation plan + owner confirmation (ACT-015) |
| RSK-015 | Servicing transactions at risk — Botswana 1/9 complete, Namibia at risk | Delivery | High | High | Regional | Yes | Botswana recovery plan (ACT-016) |
| RSK-016 | Unstandardised images/assets → inconsistent pages & publishing delays | Process/Data | Medium | Medium | Content/OMDS | No | Asset standards pack (ACT-019) |
| RSK-017 | Front-end resource exit after PI2 reduces delivery velocity | Resource | High | High | Cross Channels/Web Platform | Yes | Post-PI2 transition plan (ACT-021) |
| RSK-018 | BA capacity constrained (medical leave + recruitment) slows requirements | Resource | High | Medium | Cross Channels | Yes | Interim BA capacity (ACT-022) |
| RSK-019 | Full discussed scope implies ~2027 delivery vs fixed end-Nov / 5-month window — major timeline-vs-scope mismatch | Programme/Timeline | High | High | Programme (GB) | Yes | **Day 2:** confirmed — linear delivery misses year-end (RSK-024); response is phased delivery + four-squad model (DEC-015/016). Scope-options & gap analysis (ACT-028) |
| RSK-020 | No centralised/shared knowledge system → delays, lost history, hard onboarding | Process/People | High | Medium | Programme (GB) | Unclear | Centralised documentation system (ACT-054) |
| RSK-021 | ~95% of URLs changing impacts e-commerce campaigns + GA tracking/exec reporting | Technical/Business | High | High | Execution/E-commerce | Yes | URL audit + notify Nthabi/e-commerce (ACT-017/046) |
| RSK-022 | Security pre-go-live testing (pen-test/crowdsource) + ServiceNow API updates not yet confirmed | Security/Technical | Medium | High | Programme/Security | Yes | **Day 2:** clarify public-web pen-test scope with Nzama (ACT-072). Confirm security testing + complete ServiceNow updates (ACT-013) |
| RSK-023 | Key-resource roll-offs — migration/feature team rolls off ~Sept 10; most knowledgeable QE rolls off August | Resource | High | High | Programme/Cross Channels (Tebogo) | Yes | Accelerate delivery; knowledge transfer; backfill (ACT-064) |
| RSK-024 | Linear (current-capacity) delivery will not meet year-end; full scope extends well beyond | Timeline/Delivery | High | High | Programme (GB) | Yes | Four-squad parallel model + resource decision (DEC-016, ACT-064) |
| RSK-025 | Post-sign-off template (red-zone) changes cascade across content + code on all affected pages | Technical/Process | Medium | High | Design/Execution | Yes | Red/green zones + change control (DEC-017/018) |
| RSK-026 | Single points of failure — only Gareth & Natalie build templates; Bernice overloaded (publishing + content) | Resource/People | High | Medium-High | Programme/Publishing | Yes | Additional capacity + training + onboarding (ACT-064/067) |
| RSK-027 | Governance/template drift without controls (Contentstack ↔ Figma; new tenants) | Governance/Process | Medium | Medium | Design/OMDS | Unclear | Gatekeeper gate + Figma source-of-truth + onboarding (DEC-019, ACT-075) |
| RSK-028 | Stakeholder sign-off delays extend template sign-off (esp. sequential Personal outreach) | Business/Governance | Medium | High | Programme/Business | Yes | Structured engagement; group sign-off by page type (ACT-065, QST-025) |
| RSK-029 | EasiPlus & dependent journeys blocked until Funeral/product pages complete | Delivery | Medium | High | Cross Channels/Web (Tebogo/Wayne) | Yes | Sequence product pages; escalate (DEP-018, ACT-074) |
| RSK-030 | Secure-web portfolio-view requirements unclear before Sept roll-off → migration planning blocked | Technical/Delivery | High | High | Secure Web/Migration (Tebogo) | Yes | Clarify portfolio-view scope (QST-024, DEP-020) |
| RSK-031 | Not all year-end goals will be delivered → sponsor expectation-management required | Programme/Change | Medium | Medium | Programme (GB) | Yes | Evidence-based scope communication; phased value (DEC-015) |
| RSK-032 | Country teams without dedicated content/design resources (OMAR) cannot self-migrate | Resource/Regional | High | High | Programme/Regional | Yes | SA-first rollout + central support + squad extension (DEC-025) |

---

## Consolidated risk rating view (for Steering) — from SRC-002

| Risk area | Rating | Required response |
| --- | --- | --- |
| Migration vs transformation ambiguity | Very High | Formal scope decision & revised plan |
| Publishing capacity | High | Dedicated OMAR capacity + tracker |
| Design System V2 dependency | High | Component audit, roadmap, governance cadence |
| Front-end resource continuity | High | Post-PI2 resource transition plan |
| BA capacity | High | Interim BA support + recruitment acceleration |
| Secure web migration | High | Risk mitigation plan + owner confirmation |
| Servicing transactions | High | Recovery plan (Namibia & Botswana) |
| SEO & analytics ownership | Medium-High | Dedicated ownership workshop + standards |
| Environment sequencing | Medium-High | Architecture decision (Beta/Staging/Prod/tooling) |
| Decommission planning | Medium | Legacy decommission checklist + readiness criteria |
| Resourcing vs year-end (linear delivery) | Very High | Approve four-squad capacity (DEC-016, ACT-064) |
| Key-resource roll-offs (Sept/Aug) | High | Accelerate + knowledge transfer + backfill (RSK-023) |
| Template change cascade | Medium-High | Red/green-zone governance + change control (DEC-017/018) |
| Secure-web portfolio-view clarity | High | Clarify scope before roll-off (RSK-030) |
| Single points of failure (build/publish) | High | Capacity + training + onboarding (RSK-026) |

## Additional RAID risks flagged (SRC-002) — folded into entries above
- Single lifecycle not managed end-to-end → RSK-013 / process tracker (ACT-013).
- Brand/CI decisions delay template rollout → see ISS-001 + DEC-007; interim brand approved, full CI pending.
- Non-migrated sites drift from OMDS → RSK-012; needs non-migrated rollout/change-expectation model.
- No clear capacity if design/DS/content/publishing scale in parallel → RSK-002/RSK-005.
