# Day 1 — Session 1: Web Transformation Planning Workshop

**Source:** SRC-001 (Teams summary + notes), SRC-002 (whiteboard synthesis), SRC-003 (partial transcript).
Format per [Agent.md](../../Agent.md) §"Output Format Required".

---

## 1. Session metadata

| Field | Detail |
| --- | --- |
| Workshop day | Day 1 |
| Date | 2 June 2026 (compiled 4 June 2026) |
| Session | Session 1 (full-day planning) |
| Location | Cape Town (in-person + Teams) |
| Facilitator | Gareth Bew |
| Scribe | Bertus |
| Speakers (identified) | Gareth Bew, Keshvi Singh, Wayne, Tebogo Segoje, Brent, Bernice, Nithin |
| Teams represented | Programme, Product, Design & Content, Design System (OMDS), Execution/Engineering, Publishing, Cross Channels Solutions, SEO, Regional/Country |
| Start / end time | `Not confirmed` (transcript spans ~4+ hours incl. breaks) |
| Purpose | Build shared understanding of programme goals; integrate teams; surface deliverables, dependencies, constraints, risks; consolidate a programme plan |

### Agenda items covered
- Programme objectives, success measures, customer metrics
- Migration planning, scope, dependencies, communication
- Platform design, templates, red/green-zone governance
- Whiteboard exercise (per-workstream deliverables/risks/dependencies/milestones)
- Design & content lifecycle (Define → Go Live), handover / exit gates
- Resourcing & capacity constraints
- Migration execution: URLs/redirects, environments, components, automation/AI
- Analytics, observability, SEO
- Secure web migration, SSO, regional status
- Cross Channels: calculators, EasiPlus, team restructure

### Agenda items not covered / deferred to Day 2
- Final scope definition (migration vs transformation) and translation into actionable work
- Detailed achievability / team-health discussion
- Content standards integration detail
- Page review & consolidation exercise (if time allows)

---

## 2. Detailed discussion notes (by topic)

### 2.1 Programme objectives & success measures
- **Summary:** GB framed the programme as migrate-to-new-platform + CX uplift + legacy decommission, and set platform/customer success metrics.
- **Key points:** Platform metrics — analytics coverage, commercialisation (tenant onboarding), design-system compliance, availability, <3s load, automated pipelines, code scanning. Customer metrics — organic traffic, session duration, NPS, friction reduction, active digital users.
- **Business implication:** Platform designed for future commercial opportunity (multi-tenant), requiring brand architecture guidelines and data-foundation investment for product houses.
- **Governance implication:** Need to define release governance (allow/block on issues found).
- **Risk raised:** Daniel flagged as risk — limited capacity for AI-assisted dev / automated testing.

### 2.2 Migration scope, dependencies & communication
- **Summary:** Migration requires moving country sites, journeys, leads, servicing capabilities and rewards to the new platform, in collaboration with OMA colleagues and other site owners.
- **Key points:** Honest discussion of scope/dependencies encouraged; unanswered questions to be called out and answered externally. Some servicing capabilities out of immediate scope. Need to define + communicate specific tasks per business area. Question whether Kenya migrates all content or only specific journeys.
- **People implication:** Each business area must understand its roles/deliverables; teams outside the web team cannot be defaulted into tasks.
- **Customer implication:** Current sites have excessive layers/clicks and far more content than competitors → IA simplification needed.

### 2.3 Timeline & MVP
- **Summary:** Migration must complete **end of November** (budget). MVP = new navigation for four simplified audiences + secure web IA.
- **Open:** Define the MVP deliverable for the five-month timeline; assess impact of additional capacity on speed.

### 2.4 Platform design, templates & governance
- **Summary:** New category/product templates with consistent structure (value proposition, overview, product details) and flexible components within sections.
- **Key points:** "Red zones" = non-negotiable, strict rules; "green zones" = modular configurable components within limits (changes require heavy governance/approval). Offering template variants increases business-unit buy-in. New features should be accommodated within modular sections (limited variants). Stress-test templates across complex/tenant/country sites. Decide whether all green-zone components are DS components or some "snowflakes" maintained separately. Article/news template may be restyled while retaining content. External stakeholders must agree the template approach; if not, define an alternative immediately. Template quality must not be compromised by capacity constraints.
- **Process implication:** Move Figma wireframes → DS templates (prototype → components → assembled in CMS → publish). Approval required for new templates/sections before bundling/publishing.

### 2.5 Migration approach — parallel streams & page treatment
- **Summary:** Split migration into parallel streams: design, content, standards, execution, publishing, decommissioning; go-live and decommission run simultaneously.
- **Key points:** Avoid migrating unnecessary pages (consolidate or move as-is). Product pages get new templates; About Us/Careers retain current UI unless redesigned (`Clarification required`). Mix of old/new designs will co-exist during migration. Accept potential rework if pages migrated quickly without full template alignment. Page review/consolidation exercise proposed for the 2-day session.
- **Numbers:** ~60 pages moved; paused pending article restyle decision. Page count reduced 2,500 → ~1,000. ~1,530 OMAR pages at 1 Jun.

### 2.6 Design & content lifecycle, handover / exit gates
- **Summary:** End-to-end lifecycle: Define → Discovery → Design → Approval → Handover → Support → Go Live, with clear handover/exit-gate criteria between teams.
- **Key points:** Discovery includes analytics, research, stakeholder engagement, consolidation, SEO, copy, ecosystem review, product, compliance, brand, functional analysis, OMDS input. Design = desktop+mobile, copy/SEO readiness, stakeholder/DS/technical review, testing, functional analysis. Approval routes through Group Marketing + internal/external stakeholders + clusters. Handover = design ready, DS approval, final copy, sign-offs, rules. Need dedicated discovery period with cross-functional stakeholders before design. Lack of centralised/shared knowledge system has delayed progress. Only OMF currently submits structured design briefs using platform components.
- **Process implication:** Define what "done" means per stage and how deliverables transfer/receive.

### 2.7 Design System (OMDS) as governance layer
- **Summary:** OMDS is an enterprise digital-experience framework governing standards, patterns, IA, navigation, templates, content standards, approvals — not just a UI library.
- **Key points:** Most designer components/compositions do not exist in the new stack → must be audited/built. Provide Brent/DS team visibility to prepare. New/revised components must not impact current implementations. Risk that teams lacking design/eng capability can't maintain assets. Head of Design approval authority noted.

### 2.8 Resourcing & capacity
- **Summary:** Significant under-resourcing across publishing, copywriting, design; BAU competes heavily with migration.
- **Key points:** Two publishers only (1 migration FT, 1 BAU across 14 sites + secure + apps); no dedicated OMAR publishers (Wealth has one). New-template page ~2h; as-is ~30min. 85 BAU tickets in 5 days during Natalie's leave. Capacity discussion should focus on what's required to hit goals, not just current capacity. Need SMEs for content. Onboarding new members needs clear, actionable deliverables.

### 2.9 Migration execution — URLs, redirects, components, automation
- **Summary:** Execution covers URL mapping, redirects, component build, dual-platform maintenance, and AI/automation ambitions.
- **Key points:** Every page except home gets a new URL → redirect each; even deleted pages need redirects; excessive redirects harm SEO → review/remove outdated ones. Most components not in Contentstack → build/map. Single desktop image field today (responsive scaling); add mobile image field when building new components. Asset library by ID; may move to centralised repository. Dual updates needed across current + QA branches during migration. AI-assisted dev + automation harness for repeatable tests + pipeline enforcement; explore AI in Contentstack to automate page creation.

### 2.10 Analytics, observability & SEO
- **Summary:** Analytics/observability and SEO must be embedded, not late.
- **Key points:** Dynatrace reconfigured for browser+server-side post-migration; default analytics dashboard per migrated site. Integrate analytics tracking within CMS content. Distinguish existing GA from new tracking to avoid duplication; set event tracking/baselines upfront. Replace Glassbox CX monitoring. SEO not ready — blocking item; SEO team needs ≥2 months lead time and will provide tagging guidance/scripts during QA. Bernice exploring LLM-search visibility (ChatGPT/Copilot) not tracked by GA.

### 2.11 Secure web migration, SSO & regional status
- **Summary:** Secure web is a major, partially complete migration area with structural challenges.
- **Key points:** Some features live; product views/dashboard elements incomplete. Three challenges: (1) transition of shared services/profile management, (2) reorganising service tree/dashboards, (3) convergence of other secure portals. Service team has no robust service-tree solution yet. Secure sites run in separate environments → manage public↔secure transitions. "Learn more" pages still on old platform. SSO exists across apps with nuances; need consistent navigation/UX. Regional: Namibia & Botswana high-risk (limited resources/slow); East Africa/Ghana/Malawi on track or awaiting migration.

### 2.12 Cross Channels Solutions
- **Summary:** Team transitioning from front-end delivery to capability enabler; resource risks; calculators/EasiPlus dependencies.
- **Key points:** Front-end resources move to platform space after PI2; back-end enablement resources joining; BA on extended medical leave + recruitment in progress. EasiPlus sales journey depends on Funeral product page template + MFC sign-off + e-commerce comms (marketing spend impact). Tax-free & flexi-invest journeys migrated to V2 but product pages linking to them still need updates. Calculators: PI2 nearly Beta-ready; Income Tax/Retirement/Two-Pot ready for Beta; Debt/Personal Loans/Budget in progress or need confirmation. PI3 = Contact Us + ownerless calculators. Find an Advisor Beta-ready subject to DS V2 to Beta.

---

## 3. Decisions (this session)
See [../03_Registers/decision-log.md](../03_Registers/decision-log.md). Day 1 IDs: **DEC-001 → DEC-011**.
Most "decisions" surfaced are **proposed / required**, not confirmed — the headline scope decision (migration vs transformation) remains open.

## 4. Actions (this session)
See [../03_Registers/action-register.md](../03_Registers/action-register.md). Day 1 IDs: **ACT-001 → ACT-024**.

## 5. Risks (this session)
See [../03_Registers/risk-log.md](../03_Registers/risk-log.md). Day 1 IDs: **RSK-001 → RSK-018**.

## 6. Issues (this session)
See [../03_Registers/issue-log.md](../03_Registers/issue-log.md). Day 1 IDs: **ISS-001 → ISS-006**.

## 7. Dependencies (this session)
See [../03_Registers/dependency-log.md](../03_Registers/dependency-log.md). Day 1 IDs: **DEP-001 → DEP-012**.

## 8. Open questions (this session)
See [../03_Registers/open-questions.md](../03_Registers/open-questions.md). Day 1 IDs: **QST-001 → QST-015**.

## 9. Parking lot (this session)
See [../03_Registers/parking-lot.md](../03_Registers/parking-lot.md). Day 1 IDs: **PRK-001 → PRK-007**.

## 10. Clarifications required
- Definition of "as-is" pages (incl. whether V2 with new nav/footer).
- Migration vs transformation scope boundary.
- Non-product page treatment (About Us, Careers) — confirm with all participants.
- Bank / "Boerewors" page ownership/treatment; "Onkosa" domain term.
- Several acronyms ([validate] in glossary) and "Kash [surname]" ownership.
- Full attendee list and confirmed role titles.
