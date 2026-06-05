# Master Prompt: Build the End-to-End Programme Management Platform from Two-Day Workshop Inputs

## Title

Design and build a professional, enterprise-grade programme management platform that converts all two-day workshop outputs into a fully mapped, operational programme plan, including Gantt, workstreams, milestones, deliverables, dependencies, governance, RAID, decisions, reporting, and execution tracking.

---

## Role and stance

You are a senior programme delivery architect, transformation PMO lead, product manager, frontend architect, and delivery systems designer.

You are not building a generic project management UI.

You are building a purpose-built platform to manage this specific programme end to end, using all workshop data, notes, images, transcripts, extracted board content, design inputs, publishing inputs, governance discussions, operational planning points, and stakeholder outputs collected over the two-day workshop.

Your responsibility is to turn the workshop material into a real, usable, professional delivery platform that makes the programme manageable, visible, governed, and executable.

The current failure is that too little of the actual programme content has been translated into Gantt entries, deliverables, dependencies, ownership structures, milestones, and delivery workflows. This must be corrected completely.

---

## Primary objective

Build a platform that allows the programme team to manage the full programme from planning through execution, migration, readiness, go/no-go, launch, hypercare, and post-launch stabilisation.

The platform must clearly show:

* What needs to be done
* Why it needs to be done
* Which workstream owns it
* Which deliverable it produces
* When it starts
* When it ends
* What it depends on
* What is blocking it
* What decisions are still required
* What evidence from the workshop supports it
* What risk it carries
* How it impacts go-live readiness
* How it rolls up into programme governance and executive reporting

The output must be a professional programme control platform, not a decorative dashboard.

---

## Source material to ingest and analyse first

Before designing or coding anything, inspect and extract all available programme source material, including but not limited to:

1. Day 1 workshop notes
2. Day 2 workshop notes
3. MS Teams AI notes
4. Board photographs
5. Sticky-note extracts
6. Blue board consolidated notes
7. Publishing workstream notes
8. Design, content, and design-system updates
9. Governance and project management inputs
10. Operational readiness notes
11. Contact centre preparedness inputs
12. Internal communications inputs
13. External communications inputs
14. Training inputs
15. Content and IA transition notes
16. URL audit / redirect / migration notes
17. Environment, security, SSO, portal, and template notes
18. Hypercare and post-launch support notes
19. Any existing current platform code, routes, components, data models, and dashboard logic

Do not skim these inputs. Extract the actual programme substance from them.

---

## Mandatory interpretation rule

Every meaningful workshop input must be translated into at least one of the following:

* Programme phase
* Workstream
* Milestone
* Deliverable
* Gantt task
* Dependency
* Decision
* Risk
* Issue
* Assumption
* Action
* Owner / stakeholder role
* Readiness gate
* Governance checkpoint
* Reporting item
* Acceptance criterion

If an input cannot be translated because information is missing, create a clearly marked gap, assumption, or decision required. Do not ignore it.

---

## Core programme workstreams to map

At minimum, structure the programme around the following workstreams. Add more if the workshop data supports them.

### 1. Governance and PMO

Include:

* Programme governance model
* Steering committee cadence
* Decision forums
* Lead planning playback sessions
* SME engagement model
* Go/no-go planning
* RAID management
* Action tracking
* Dependency management
* Status reporting
* Executive reporting
* Phase gates
* Readiness checkpoints
* Change control
* Scope control
* Programme calendar
* Meeting cadence
* Escalation paths

### 2. Technical Migration

Include:

* Current-state platform assessment
* Target-state platform readiness
* Environment setup
* Secure web / web secure decisions
* SSO
* Portal dependencies
* IA Bank / Wealth / OMF dependencies
* Integration readiness
* Component migration
* Template migration
* Stress testing
* Regression testing
* Deployment readiness
* Cutover planning
* Rollback planning
* Production go-live
* Post-launch validation

### 3. Design and Design Systems

Include:

* Design system audit
* Existing component review
* Enhanced component requirements
* New component requirements
* Template design
* Page skinning decisions
* Theme decisions
* Dark-theme decision
* Wealth / OMAI / OMIG / UT theming considerations
* Design QA
* Accessibility review
* UX consistency review
* Brand alignment
* Design sign-off
* Playback and approval cycles

### 4. Content and IA

Include:

* Current URL audit
* Mapping all current URLs to the new world
* As-is page definition
* Target-state page definition
* Landing page decisions
* Ownership assignment
* Content audit
* Content carousel audit
* Article-page skinning decision
* IA validation
* Content owner handovers
* Bookmark audits
* Redirect requirements
* SEO impact review
* Content freeze
* Content migration
* Content QA
* Business sign-off

### 5. Publishing

Include:

* Publishing workflow definition
* CMS editor responsibilities
* Page publishing process
* Approval workflow
* Content staging
* Publishing schedule
* Release windows
* Rollback requirements
* Publishing QA
* Publishing sign-off
* Production publishing control

### 6. Internal Communications

Include:

* Executive briefing plan
* Leadership communication
* Staff communication
* Content owner notifications
* Change champion network
* Team-level messaging
* Internal FAQs
* Launch awareness
* Operational readiness messaging
* Internal communication schedule

### 7. External Communications

Include:

* Customer-facing launch messaging
* SEO impact briefing
* Partner notifications
* External URL change communication
* Marketing coordination
* PR / launch communications
* Customer education
* Public support messaging

### 8. Contact Centre and Support Readiness

Include:

* Contact centre briefing
* Agent scripting
* Agent training
* Public web change awareness
* Private web / secure portal change awareness
* Surge support planning
* Feedback loop to web team
* Support queue setup
* Escalation rules
* Known-issues process
* Daily support review during hypercare

### 9. Training and Adoption

Include:

* CMS editor training
* General staff training
* Contact centre training
* SME training
* Training materials
* Attendance tracking
* Completion tracking
* Training as go-live gate
* Knowledge base updates
* Post-training support

### 10. Testing, Readiness and Go-Live

Include:

* Test strategy
* Functional testing
* Regression testing
* Template stress testing
* Redirect testing
* Content QA
* Accessibility testing
* Performance testing
* Security validation
* Business sign-off
* Go/no-go checklist
* Cutover plan
* Launch plan
* Hypercare readiness

### 11. Hypercare and Stabilisation

Include:

* First two weeks post-launch as a distinct operating mode
* Daily stand-ups
* Dedicated support queue
* Issue triage
* Defect resolution
* Escalation management
* Usage monitoring
* Contact centre feedback
* Content correction process
* Post-launch reporting
* Stabilisation exit criteria
* Lessons learned

---

## Gantt chart requirements

The Gantt chart is the most critical feature. It must not be shallow or generic.

Create a full Gantt model that includes:

* Programme phases
* Workstreams
* Sub-workstreams
* Deliverables
* Tasks
* Subtasks
* Milestones
* Dependencies
* Start dates
* End dates
* Durations
* Owners
* Supporting SMEs
* Status
* RAG status
* Percentage completion
* Critical path indicator
* Blockers
* Risks linked to tasks
* Decisions linked to tasks
* Evidence source from workshop notes
* Confidence level
* Assumptions
* Acceptance criteria

Where exact dates were not captured in the workshop, infer logical sequencing and mark dates as provisional. Do not leave the Gantt empty because dates are incomplete. Build the best professional baseline and clearly mark assumptions.

The Gantt must be capable of showing:

* Programme roadmap view
* Workstream view
* Critical path view
* Milestone view
* Owner view
* Go-live readiness view
* Dependency view
* Overdue task view
* Blocked task view
* Executive summary view

---

## Programme phases to include

Create the full programme lifecycle as a phased delivery model.

At minimum, include:

### Phase 1: Workshop Consolidation and Programme Baseline

Purpose: Convert all workshop outputs into structured delivery controls.

Deliverables:

* Consolidated workshop output register
* Workstream structure
* Programme WBS
* Draft Gantt baseline
* Initial RAID log
* Initial decision log
* Initial dependency map
* Stakeholder map
* Governance cadence
* Input gaps register

### Phase 2: Discovery, Audit and Current-State Validation

Purpose: Validate what exists today and what must move, change, retire, or be created.

Deliverables:

* URL audit
* Current page inventory
* Content audit
* Component audit
* Template audit
* Integration audit
* Environment audit
* Stakeholder ownership map
* As-is process map
* Current-state risk assessment

### Phase 3: Target-State Definition

Purpose: Confirm the new-world design, IA, publishing, governance, and technical operating model.

Deliverables:

* Target IA
* URL mapping
* Redirect strategy
* Target publishing workflow
* Target templates
* Target design system decisions
* Theme decisions
* Environment plan
* Security and SSO requirements
* Content ownership model
* Support model
* Training model

### Phase 4: Build, Configure and Migrate

Purpose: Execute the platform, content, template, integration, and publishing build.

Deliverables:

* Configured environments
* Built / enhanced components
* Built / enhanced templates
* Migrated content
* Page mappings
* Publishing workflow configuration
* Redirect implementation
* Secure / portal configuration
* CMS setup
* Initial reporting dashboards

### Phase 5: Test, Validate and Sign Off

Purpose: Prove readiness before launch.

Deliverables:

* Functional test results
* Regression test results
* Stress test results
* Template test results
* Redirect test results
* Content QA
* Design QA
* Accessibility QA
* Security validation
* Contact centre readiness confirmation
* Training completion evidence
* Business sign-off
* Go/no-go pack

### Phase 6: Launch and Cutover

Purpose: Execute controlled go-live.

Deliverables:

* Cutover checklist
* Go-live command centre
* Launch communications
* Production deployment
* Redirect activation
* Publishing freeze / release control
* Smoke testing
* Launch status dashboard
* Go-live decision record

### Phase 7: Hypercare and Stabilisation

Purpose: Manage the first post-launch period with intense operational control.

Deliverables:

* Hypercare dashboard
* Daily issue log
* Support queue
* Contact centre feedback log
* Defect triage
* Priority fix backlog
* Business impact reporting
* Stabilisation tracker
* Hypercare exit report
* Lessons learned

---

## Platform modules to build

The platform must include the following modules as first-class product areas.

### 1. Executive Dashboard

Show:

* Overall programme RAG
* Go-live readiness score
* Critical path status
* Milestones due
* Overdue deliverables
* Open risks
* Open issues
* Open decisions
* Blocked dependencies
* Workstream health
* Upcoming governance checkpoints
* Launch readiness summary

### 2. Gantt and Timeline Module

Show:

* Full programme Gantt
* Workstream swimlanes
* Critical path
* Milestones
* Dependencies
* Baseline vs forecast
* Slippage
* Owner accountability
* Blocked items
* Readiness gates
* Exportable executive view

### 3. Workstream Management

Each workstream must have:

* Workstream charter
* Scope
* Deliverables
* Owners
* SMEs
* Milestones
* Tasks
* Dependencies
* Risks
* Issues
* Decisions
* Status updates
* Evidence from workshop inputs
* Acceptance criteria
* Completion evidence

### 4. RAID Management

Create proper registers for:

* Risks
* Assumptions
* Issues
* Dependencies

Each RAID item must include:

* ID
* Type
* Title
* Description
* Workstream
* Owner
* Impact
* Probability
* Severity
* Status
* Due date
* Mitigation
* Escalation status
* Linked tasks
* Linked decisions
* Linked milestones

### 5. Decision Log

Track:

* Decision required
* Background
* Options
* Recommendation
* Decision owner
* Decision forum
* Due date
* Impact if delayed
* Final decision
* Date decided
* Linked workstreams
* Linked Gantt tasks

### 6. Action Tracker

Track:

* Action
* Owner
* Workstream
* Due date
* Priority
* Status
* Dependency
* Notes
* Evidence
* Escalation flag

### 7. Deliverables Register

Track every deliverable from the programme, including:

* Deliverable name
* Workstream
* Description
* Owner
* Start date
* Due date
* Status
* RAG
* Acceptance criteria
* Approval requirement
* Evidence required
* Linked tasks
* Linked risks
* Linked decisions

### 8. Governance Calendar

Show:

* Steering committees
* Lead planning sessions
* Playback sessions
* SME workshops
* Sign-off forums
* Go/no-go meetings
* Daily hypercare stand-ups
* Decision forums
* Workstream checkpoints

### 9. Readiness and Go/No-Go Module

Include readiness gates for:

* Technical readiness
* Content readiness
* Design readiness
* Publishing readiness
* Training readiness
* Contact centre readiness
* Communications readiness
* Business sign-off
* Security readiness
* Support readiness
* Hypercare readiness

Each gate must have:

* Criteria
* Evidence required
* Owner
* Status
* Decision required
* Blocking issues
* Approval date

### 10. Workshop Evidence Library

Create a structured evidence library that links workshop source material to execution items.

Each evidence item must include:

* Source type
* Source name
* Extracted text
* Related workstream
* Related deliverable
* Related task
* Confidence level
* Notes
* Follow-up required

### 11. Reporting and Export Module

Provide:

* Executive status report
* Workstream status report
* RAID report
* Decision report
* Go-live readiness report
* Gantt export
* Action tracker export
* Steering committee pack extract
* PDF / Excel export options where technically feasible

---

## Data model requirements

Create or update the data model to support the full programme.

At minimum, include entities for:

* Programmes
* Phases
* Workstreams
* Deliverables
* Tasks
* Milestones
* Dependencies
* Risks
* Assumptions
* Issues
* Decisions
* Actions
* Stakeholders
* Owners
* SMEs
* Meetings
* Governance forums
* Readiness gates
* Evidence sources
* Status updates
* Comments
* Attachments
* Audit history

The data model must support:

* Parent-child task hierarchy
* Many-to-many task dependencies
* Workstream rollups
* RAG calculations
* Readiness scoring
* Critical path calculation or critical path flagging
* Evidence traceability
* Status history
* Owner accountability
* Role-based permissions

---

## UI and UX requirements

The UI must be professional, clean, credible, and suitable for senior programme leadership.

Do not create a scattered collection of cards.

Design the platform around real programme workflows:

* Daily programme control
* Weekly workstream review
* Steering committee preparation
* Go/no-go decisioning
* Risk escalation
* Dependency management
* Launch readiness tracking
* Hypercare management

The interface must include:

* Clear navigation
* Programme overview
* Workstream detail pages
* Gantt view
* RAID view
* Decision log
* Deliverables register
* Readiness dashboard
* Governance calendar
* Evidence library
* Reporting area
* Search and filtering
* Status update workflows
* Export actions

Every page must answer a real management question.

Examples:

* “Are we on track for launch?”
* “Which deliverables are late?”
* “What is blocking go-live?”
* “Which decisions are overdue?”
* “Which workstream is red?”
* “What did the workshop say about this?”
* “What needs steering committee attention?”
* “What must be done this week?”
* “What is on the critical path?”
* “What evidence proves readiness?”

---

## Professional delivery rules

Do not create placeholder content unless clearly marked as placeholder.

Do not invent workshop facts.

Do not ignore messy or incomplete workshop inputs.

Do not leave the programme thin because the source material is unstructured.

Do not produce a generic project management tool.

Do not create Gantt entries like “Planning”, “Build”, “Testing” without detailed child tasks and deliverables.

Do not create dashboards that are visually attractive but operationally useless.

Do not treat governance, communications, contact centre readiness, training, support, and hypercare as afterthoughts. They are formal workstreams and must be represented in the platform.

---

## Data extraction and mapping process

Before implementation, perform the following:

### Step 1: Inspect all existing material

Read all available notes, images, documents, extracts, and current application files.

### Step 2: Build a workshop extraction matrix

Create a matrix with:

* Source
* Extracted item
* Theme
* Workstream
* Required action
* Deliverable
* Gantt task
* Risk / issue / dependency / decision
* Owner if known
* Confidence level
* Gap if unresolved

### Step 3: Build the WBS

Create a work breakdown structure across all programme phases and workstreams.

### Step 4: Build the Gantt baseline

Convert the WBS into a full Gantt structure with dependencies, sequencing, milestones, owners, and readiness gates.

### Step 5: Build registers

Create RAID, decision, action, dependency, milestone, and deliverable registers from the workshop material.

### Step 6: Build the platform UI

Implement the navigation, pages, components, filters, visualisations, and workflows required to manage the programme.

### Step 7: Seed the platform with programme data

Populate the platform with the extracted programme plan, not dummy data.

### Step 8: Validate against workshop evidence

Every major Gantt line, deliverable, risk, decision, and workstream must be traceable back to workshop input or clearly marked as an inferred professional programme control item.

---

## Acceptance criteria

The build is only acceptable when the following are true:

1. The Gantt chart contains a full programme plan, not a minimal sample.
2. Every major workshop theme has been mapped into execution structures.
3. Each workstream has meaningful tasks, deliverables, dependencies, and milestones.
4. The platform can support actual programme governance.
5. The executive dashboard shows real programme health.
6. RAID, decisions, actions, and dependencies are populated and linked.
7. Readiness gates are visible and measurable.
8. Go/no-go planning is explicitly represented.
9. Hypercare is treated as a formal phase.
10. The design is professional and suitable for senior stakeholder review.
11. The platform makes the programme easier to manage, not just easier to look at.
12. Missing information is captured as gaps, assumptions, or decisions required.
13. The system has clear evidence traceability back to workshop material.
14. The result is credible enough to use in a real programme environment.

---

## Required final outputs

Deliver the following:

1. A complete programme work breakdown structure
2. A full Gantt plan with phases, workstreams, tasks, dependencies, milestones, and owners
3. A populated executive dashboard
4. A populated workstream management area
5. RAID register
6. Decision log
7. Action tracker
8. Deliverables register
9. Readiness and go/no-go dashboard
10. Governance calendar
11. Workshop evidence library
12. Reporting/export capability
13. Clean, professional UI
14. Technical implementation notes
15. Data model / schema updates
16. Validation report showing how workshop inputs were mapped into the platform

---

## Implementation instruction

Now inspect the existing codebase and all available workshop artefacts.

Then redesign, extend, and populate the platform so that it becomes a serious programme management control system for this programme.

Focus first on substance, structure, and programme usefulness.

Visual polish matters, but operational credibility matters more.

The end result must help the programme team run the programme from end to end, prepare for steering committee, manage delivery, track risks, control dependencies, confirm readiness, execute go-live, and survive hypercare.

Do not stop at a shallow Gantt.

Map the actual programme.

Build the platform properly.
