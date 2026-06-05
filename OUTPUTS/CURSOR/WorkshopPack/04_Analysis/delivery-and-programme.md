# E. Delivery & Programme Management

**Source:** SRC-001, SRC-002 (Day 1); SRC-008 (D2S1), SRC-009 (D2S2) — Day 2 re-baseline.

## Workstreams
1. Publishing — High-risk capacity bottleneck.
2. Website Migration & Go-Live Readiness — Amber/At Risk.
3. Design & Design System (OMDS) — governance layer.
4. Execution — transformation + technical uplift.
5. Cross Channels Solutions — resource-exposed.
6. Content Governance & Migration Readiness — control point.

## Delivery phases / sequencing
- Lifecycle: Define → Discovery → Design → Approval → Handover → Support → Go Live.
- Parallel streams: design, content, standards, execution, publishing, decommissioning.
- Go-live + decommission run simultaneously.
- DS Build tracked **separately** from Platform Build; reconcile at Beta/Staging readiness.

## Milestones / critical path
- Hard end-November deadline (fixed).
- Publishing start gated by Contentstack dev + content/assets/URL sign-off (DEP-001).
- Testing start gated by all pages built in Beta (DEP-002).
- SEO ≥2 months lead before QA (DEP-009).
- DS V2 to Beta gates Find an Advisor (DEP-003).
- PI2 → front-end exit; PI3 → Contact Us + calculators.

## Critical-path / highest-priority controls (from SRC-002)
| Area | Required control / decision | Priority |
| --- | --- | --- |
| URL audit | Map all current URLs to new-world IA/URL structure | Critical |
| As-is definition | Define as-is vs transformed page build | Critical |
| Secure journeys / SSO | Confirm secure portal, SSO, web-secure/secure-web | Critical |
| Publishing vs migration | Clarify ownership/boundaries | Critical |
| Theming | Per-site themes incl. dark theme applicability | High |
| OMDS adoption | Rollout for migrated + non-migrated sites | High |
| Brand CI | Early CI approval before scaling templates | High |
| Component migration | Which components move + decision owners | High |
| Journey retention | Use journey maps so journeys aren't lost | High |

## Progress tracking requirement
Single interconnected lifecycle + visible tracker showing workplan, milestones, assumptions, dependencies, impact (not just % complete). Beta/staging readiness linked to design + content + DS + platform build + publishing readiness.

## Governance forums / cadence (to establish)
- Steering Committee (consolidated risk view prepared for it).
- Design authority / OMDS governance cadence.
- SEO & analytics workshop.
- Go-live readiness review.

## Delivery blockers
Scope ambiguity (RSK-001), publishing capacity (RSK-002), component gaps (RSK-008), SEO not ready (RSK-009), secure web (RSK-014), servicing transactions (RSK-015), resource exits (RSK-017/018).

## Budget / cost implications
- End-November deadline is **budget-driven**.
- EasiPlus changes affect marketing spend (e-commerce comms needed before changes).
- No detailed budget figures stated → `Not confirmed`.

## Scope-vs-timeline options (S2/S3) — key
- The **full discussed scope implies ~end-2027** delivery, against a fixed **end-November / ~5-6 month** budget window (RSK-019).
- **Tactical vs strategic** framing: a reduced deliverable (e.g. **navigation-only across all sites**, iterative) may be needed to hit the timeline (QST-016, ASM-010).
- Action: gap analysis between committed scope and realistic 5-month deliverables (ACT-028); produce options for stakeholder conversations.
- The Day 1 exercise "doesn't solve the problem but shows how big it is" — explicit input to Day 2 achievability discussion.

## Cross-stream coordination & knowledge (S2/S3)
- In-stream work is understood; **cross-stream coordination is the grey area**.
- **No centralised/shared knowledge system** is a root cause of delay (RSK-020, ISS-008) → ACT-054.
- Request for the **final ~10 priority components** to begin work (PRK-009).

## Go-live readiness additions (S2/S3)
- Security pen-test/crowdsource testing (RSK-022, DEP-015); ServiceNow API updates + approvals (DEP-016); call-centre/stakeholder comms; phased decommissioning (DEC-012).

## Change control / scope
- Migration vs transformation scope decision is the master change-control item (DEC-001).
- Enhanced components may expand in-scope site list — impact-assess before baselining.
- Faoli Bank treated as separate brand/governance (DEC-013) — distinct delivery track.

---

# Day 2 re-baseline / update (SRC-008 D2S1, SRC-009 D2S2)

> Day 2 converted the Day 1 "how big is the problem" position into a **delivery construct**: phased audience-based delivery (Personal first), a defined critical path, a unified Jira construct with a fixed cadence, and an explicit, sponsor-managed acknowledgement that not all year-end goals will land. The Day 1 milestones/blockers above stand; the items below set the Day 2 plan baseline.

## E1. Phased audience delivery & sequence (DEC-015) — CONFIRMED

- **Phased, audience-based rollout** rather than one end-of-year block: **Personal first**, then **Corporate → Business → Wealth**, with **Secure** sequenced alongside.
- Delivery starts from the **~60% known modules** and builds section-by-section as detail firms (ASM-015) — staggered "drops" of components/pages, variability decreasing over time, **multiple handovers expected until at least September**.
- **Micro-drops** of completed templates/components released as soon as ready, starting in the **first two weeks of June**.
- Supersedes the Day 1 single scope-boundary debate (DEC-001) — scope now bounded **per phase**.

## E2. Critical path (Day 2)

```
Design foundations (Personal IA + core templates + content guidelines)  --  END-JUNE  [DEC-022, DEP-017]
        |  (templates ~2 weeks each incl. sign-off; component build longer, parallel)
        v
Personal section template package handed to build                        --  END-JUNE  [ACT-065/068]
        |
        v
Personal content package (content + QA) + ~140-150 article migration     --  END-JULY  [ACT-056, DEC-023]
        |
        v
Personal section live  ->  then Corporate/Wealth landing+macro drops      --  early JULY+  [DEC-015]
        |
        v
Roll-off pressure: feature/migration team ~Sept 10; QE August            --  [RSK-023]
```

- **Foundations end-June → Personal section ~end-July** is the spine of the plan (DEC-015/022).
- Corporate & Wealth landing pages + macro sections targeted for **first two weeks of July**.
- Feature migration: **52% now → 71–72% end-June → ~90% end-July** (Tebogo).

## E3. Unified Jira construct + cadence (DEC-027) — CONFIRMED

- **Single Jira construct** across all teams (integrate all team boards — ACT-069, Tsoaeli); stream leads enter **milestones, priorities, dependencies, confidence, owners** into the shared roadmap (ACT-055/070).
- **Cadence:** **twice-weekly 30-minute** leadership check-ins focused on delivery constraints/dependencies (ACT-062) + **weekly playback** (incl. weekly **template** playback for early technical-team visibility — ACT-082).
- Near-term: raw integrated roadmap/dataset by **Friday** (ACT-055/078); consolidation with Bernice Jun 5, leads review Jun 7.

## E4. Year-end vs linear-delivery gap (RSK-024, RSK-019)

- **Linear delivery at current capacity will NOT meet year-end**; the full scope extends well beyond (confirms/sharpens Day 1 RSK-019).
- Response: **four-squad parallel model** (DEC-016, resource-gated) + phased delivery (DEC-015).
- Explicit acknowledgement: **not all year-end goals will be delivered** — manage via evidence-based, phased-value communication to sponsors (RSK-031). `Flagged for executive escalation.`

## E5. Roll-off timing & dependencies
- Migration/feature team **rolls off ~September 10**; most knowledgeable **QE rolls off August** (RSK-023).
- Secure-web **portfolio-view** requirements unclear before roll-off → planning blocked (RSK-030, DEP-020, ISS-011).
- **EasiPlus** blocked until product pages complete (DEP-018, RSK-029).
- Multiple component handovers continue until at least September (DEP-021).

## E6. Decommissioning in the plan
- Include decommissioning tasks and coordinate **timing by deployment stage** (Nithin — ACT-071, DEC-012); **South Sudan = decommission-only** (DEC-025).

## E7. Day 2 delivery blockers / escalation
- Resourcing-vs-year-end (RSK-024) and key roll-offs (RSK-023) — **escalate**.
- Under-resourcing across all workstreams now (ISS-009).
- Article/news URL structure deferred (DEC-024) blocks redirect/switch-off sequencing.
- Pen-test integration into releases unresolved (RSK-022).
