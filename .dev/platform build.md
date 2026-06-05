Below is the full multi-agent development prompt. I corrected **Conext7** to **Context7 MCP** and made it suitable for Cursor, Codex, Claude Code, or any agentic dev environment.

# Multi-Agent Development Prompt: Enterprise Project Management Platform UI

## Title

Design and implement a full, production-grade UI for an integrated enterprise project management platform.

---

## Mission

You are a coordinated multi-agent development team responsible for designing, building, validating, and documenting a complete frontend UI for a fully integrated project management platform.

The platform must support real programme delivery, not just static screens. It must include operational workflows, role-based access, reporting, dashboards, approvals, risks, issues, milestones, resources, notifications, documents, settings, and backend integration readiness.

The final result must be enterprise-grade, scalable, maintainable, accessible, responsive, and aligned with the existing codebase and design system.

---

# 1. Operating Principles

All agents must follow these rules:

1. Inspect the existing codebase before changing anything.
2. Preserve working functionality unless a refactor is clearly required.
3. Do not create duplicate route systems, duplicate design systems, duplicate state layers, or duplicate modules.
4. Use existing architecture, conventions, folders, naming, routing, authentication, API patterns, styling, and component structures wherever practical.
5. Do not bypass authentication, authorization, security, validation, or existing data-access patterns.
6. Do not use mock data in production paths.
7. If backend APIs are missing, create typed integration contracts and service/adaptor layers instead of hardcoding fake behaviour.
8. Use Context7 MCP as a current documentation/reference source where needed. Do not treat Context7 as the application framework.
9. Prioritise operational usefulness, clarity, accessibility, performance, and maintainability over decorative effects.
10. Do not leave unresolved TODO placeholders for required functionality.
11. Do not claim completion unless build, validation, accessibility review, and basic tests/checks have been completed or explicitly documented as blocked.
12. All changes must be documented with rationale, assumptions, risks, and follow-up items.

---

# 2. Multi-Agent Team Structure

The development work must be handled by the following specialist agents.

---

## Agent 1: Orchestrator / Delivery Lead

### Responsibility

Coordinate the full delivery from audit through implementation, validation, and final handover.

### Tasks

* Read the full prompt and decompose work into logical phases.
* Inspect the repository structure.
* Identify the existing framework, routing, state management, styling, API patterns, authentication model, and component library.
* Assign responsibilities to the specialist agents.
* Prevent duplicated work between agents.
* Resolve conflicts between product requirements, architecture constraints, and implementation feasibility.
* Maintain a delivery checklist.
* Ensure the final output is coherent and not a collection of disconnected components.

### Output

* Delivery plan
* Agent task breakdown
* Codebase audit summary
* Final delivery summary

---

## Agent 2: Product Architect

### Responsibility

Define the product model, operational workflows, information architecture, and user journeys.

### Required domain entities

The platform must support the following entities:

* Programme
* Project
* Workstream
* Deliverable
* Task / Action
* Milestone
* Dependency
* Risk
* Issue
* Decision
* Change Request
* Approval
* Resource
* Stakeholder
* Meeting
* Document
* Notification
* Report
* Audit Log
* User
* Role
* Permission
* Integration

### Required workflows

Design the UI around these real operational workflows:

* Programme setup
* Project creation and lifecycle management
* Workstream setup and ownership assignment
* Task/action creation, assignment, tracking, completion, and escalation
* Milestone planning and variance tracking
* Dependency mapping and blocker management
* Risk capture, scoring, mitigation, ownership, review, and escalation
* Issue capture, ageing, resolution, escalation, and closure
* Decision logging with owner, date, rationale, impact, and status
* Change request submission, review, approval/rejection, implementation, and audit history
* Resource allocation and workload visibility
* Stakeholder management
* Status update submission
* RAG status tracking
* Steering committee reporting
* Notification and escalation management
* Document attachment and review workflow
* Approval queue workflow
* Executive reporting workflow
* Admin configuration workflow

### Output

* Product domain model
* Workflow map
* Information architecture
* Route map
* Screen inventory
* User journey summary

---

## Agent 3: UX / UI Design Lead

### Responsibility

Design a polished, usable, modern enterprise interface that is operationally effective.

### Required UX principles

* Clear navigation
* Low cognitive load
* Strong visual hierarchy
* Fast access to priority actions
* Consistent layout patterns
* Responsive layouts
* Accessible controls
* Useful empty states
* Clear error handling
* Minimal unnecessary decoration
* Executive-ready dashboards
* Operationally useful detail views

### Required navigation model

The platform should include, at minimum:

* Executive Dashboard
* Programme Workspace
* Projects
* Workstreams
* Tasks / Actions
* Timeline / Roadmap
* Milestones
* Dependencies
* RAID
* Risks
* Issues
* Decisions
* Change Control
* Resources
* Approvals
* Reports / Analytics
* Documents
* Notifications
* Integrations
* Admin / Settings

### Required UI capabilities

* Sidebar navigation
* Header / top bar
* Breadcrumbs
* Global search
* Command palette where practical
* Role-aware navigation visibility
* Contextual page actions
* Filter panels
* Saved views where practical
* Data tables
* Kanban/task boards where useful
* Calendar/timeline views where useful
* Dashboard cards
* Charts and analytics widgets
* Detail drawers or panels
* Modal forms
* Confirmation dialogs
* Toast notifications
* Loading skeletons
* Empty states
* Error states
* Permission-denied states
* Unsaved changes warning
* Responsive mobile/tablet layouts

### Output

* UX structure
* Layout patterns
* Component usage rules
* Dashboard design approach
* Responsive behaviour notes
* Accessibility notes

---

## Agent 4: Frontend Architect

### Responsibility

Design and implement the frontend architecture cleanly.

### Tasks

* Inspect the current frontend stack.
* Identify routing approach.
* Identify layout structure.
* Identify reusable components.
* Identify state management.
* Identify data-fetching patterns.
* Identify form handling and validation patterns.
* Identify existing design tokens and styling conventions.
* Define the module architecture.
* Implement reusable shells, layouts, components, pages, and views.
* Avoid unnecessary rewrites.
* Keep code modular, typed, maintainable, and testable.

### Expected implementation areas

* Application shell
* Navigation
* Dashboard layout
* Page templates
* Project views
* Task/action views
* Timeline views
* RAID views
* Risk views
* Issue views
* Decision log
* Change control
* Resource management
* Approval queue
* Reporting views
* Document views
* Notification centre
* Admin/settings views
* Shared components
* Shared hooks
* Shared types
* Shared services/adaptors

### Output

* Implemented frontend code
* Route/module map
* Component structure
* State management notes
* Styling/design-system notes

---

## Agent 5: Backend Integration Architect

### Responsibility

Ensure the UI is integration-ready and does not fake production behaviour.

### Tasks

* Inspect existing API patterns.
* Inspect existing auth/session handling.
* Inspect existing backend service/client layers.
* Identify available endpoints.
* Identify missing endpoints.
* Create typed API/service interfaces where needed.
* Ensure UI does not hardcode production data.
* Ensure demo/sample fixtures are isolated from production.
* Define request and response shapes.
* Define loading/error/retry behaviour.
* Define optimistic update rules only where safe.
* Define caching/invalidation strategy if relevant.

### Required integration contracts

Create or document contracts for:

* Programmes
* Projects
* Workstreams
* Tasks/actions
* Milestones
* Dependencies
* Risks
* Issues
* Decisions
* Change requests
* Approvals
* Resources
* Stakeholders
* Documents
* Notifications
* Reports
* Users
* Roles
* Permissions
* Audit logs

### Output

* API integration notes
* Typed DTO/interface definitions
* Service/adaptor layer
* Missing backend endpoint list
* Data-fetching and mutation strategy
* Error-handling strategy

---

## Agent 6: Security, Permissions & Governance Lead

### Responsibility

Ensure the UI respects enterprise security and governance requirements.

### Tasks

* Inspect existing authentication model.
* Inspect existing authorization/role model.
* Do not bypass existing security.
* Define role-based access behaviour.
* Ensure permission-aware navigation.
* Ensure permission-aware actions.
* Ensure restricted pages cannot be accessed through UI navigation.
* Ensure dangerous actions require confirmation.
* Ensure audit-sensitive actions are traceable.
* Ensure no secrets are exposed in frontend code.
* Ensure files/documents follow secure patterns.
* Ensure admin functions are separated from general user functions.

### Required roles

The platform must support, at minimum:

* Super Admin
* Programme Director
* Project Manager
* Workstream Lead
* SME
* Contributor
* Approver
* Executive / Steering Committee Viewer
* Read-only Stakeholder

### Permission categories

For each major entity, define UI behaviour for:

* View
* Create
* Edit
* Assign
* Approve
* Reject
* Escalate
* Archive
* Delete
* Export
* Configure

### Governance requirements

The UI must support:

* Audit history visibility where relevant
* Approval history
* Decision history
* Status history
* Risk review history
* Change request history
* Role-based admin settings
* Clear ownership fields
* Escalation ownership
* Last updated metadata
* Created by / updated by metadata where available

### Output

* Permission model
* Role/UI behaviour matrix
* Security notes
* Governance notes
* Auditability notes

---

## Agent 7: Data Visualisation & Reporting Lead

### Responsibility

Implement executive and operational reporting views that are useful for real programme control.

### Required dashboards and reports

The platform must support:

* Executive summary dashboard
* Overall programme RAG
* Project RAG
* Workstream RAG
* Milestone progress
* Milestone variance
* Overdue tasks/actions
* Risk heatmap
* Issue ageing
* Dependency blockers
* Open decisions
* Pending approvals
* Change request status
* Resource workload
* Upcoming milestones
* Recently escalated items
* Steering committee summary
* Exportable report views where supported

### Filters

Reporting views should support filtering by:

* Programme
* Project
* Workstream
* Owner
* Status
* Priority
* Risk level
* RAG status
* Due date
* Date range
* Approval status

### Output

* Dashboard components
* Reporting views
* Chart/widget components
* Filter model
* Reporting integration notes

---

## Agent 8: Accessibility, Quality & Testing Lead

### Responsibility

Validate that the platform is usable, accessible, robust, and ready for production review.

### Required checks

* TypeScript/build check
* Lint check where available
* Unit/component tests where practical
* Route rendering checks
* Basic interaction checks
* Form validation checks
* Responsive layout checks
* Keyboard navigation checks
* Focus management checks
* ARIA/semantic markup review
* Colour contrast review where possible
* Empty/loading/error state review
* Permission-denied state review
* Console error review
* Broken import/path review

### Required testing coverage

Where practical, add or update lightweight tests for:

* Navigation rendering
* Route/page rendering
* Core dashboard rendering
* Form validation
* Permission-aware action visibility
* Data loading/error states
* Key reusable components

### Output

* Test updates
* QA checklist
* Accessibility notes
* Known issues
* Validation evidence

---

## Agent 9: Documentation & Handover Lead

### Responsibility

Produce clear documentation for maintainers, reviewers, and future agents.

### Required documentation

Document:

* What was changed
* Why it was changed
* Files added
* Files modified
* Files removed, if any
* Architecture decisions
* UI decisions
* Design-system usage
* Routes added/updated
* Components added/updated
* Backend contracts
* Missing backend dependencies
* Security/permission assumptions
* Testing performed
* Known limitations
* Follow-up actions

### Output

* Final implementation notes
* Design system notes
* Integration notes
* Validation plan
* Follow-up backlog

---

# 3. Required Platform Modules

The implementation must include or prepare the UI structure for the following modules.

---

## 3.1 Executive Dashboard

Purpose: Give senior stakeholders an immediate view of programme health.

Required elements:

* Overall RAG status
* Active projects count
* Workstreams count
* Open risks
* Open issues
* Overdue actions
* Pending approvals
* Upcoming milestones
* Blocked dependencies
* RAG trend
* Risk heatmap
* Issue ageing
* Executive summary panel
* Steering committee pack shortcut

---

## 3.2 Programme Workspace

Purpose: Central control area for the programme.

Required elements:

* Programme overview
* Objectives
* Scope
* Timeline
* Sponsors
* Governance model
* Workstream summary
* Project summary
* RAID summary
* Recent updates
* Key decisions
* Upcoming governance forums

---

## 3.3 Projects

Purpose: Manage projects within the programme.

Required elements:

* Project list
* Project detail page
* Project RAG
* Owner
* Sponsor
* Timeline
* Budget/effort placeholder only if supported by backend
* Status
* Priority
* Milestones
* Tasks/actions
* Risks
* Issues
* Dependencies
* Documents
* Activity/audit trail
* Project creation/edit form

---

## 3.4 Workstreams

Purpose: Manage delivery workstreams and ownership.

Required elements:

* Workstream list
* Workstream detail
* Lead/SME ownership
* Workstream RAG
* Associated projects
* Open actions
* Milestones
* Risks/issues
* Dependencies
* Status updates

---

## 3.5 Tasks / Actions

Purpose: Operational task and action tracking.

Required elements:

* Task list
* My tasks
* Team tasks
* Board view where practical
* Table view
* Filters
* Owner
* Assignee
* Due date
* Priority
* Status
* Dependencies
* Attachments
* Comments/updates where supported
* Escalation indicator
* Create/edit task form
* Completion workflow

---

## 3.6 Timeline / Roadmap

Purpose: Provide programme and project timeline visibility.

Required elements:

* Programme roadmap
* Project timeline
* Milestone view
* Dependency view
* Date range filters
* Status indicators
* Slippage/variance indicators where data supports it

---

## 3.7 RAID

Purpose: Centralised risks, assumptions, issues, and dependencies.

Required elements:

* RAID dashboard
* Risks
* Assumptions
* Issues
* Dependencies
* Filters
* Owners
* Severity/impact
* Likelihood
* Due dates
* Escalation
* Status
* Review dates

---

## 3.8 Risks

Purpose: Risk management.

Required elements:

* Risk register
* Risk detail
* Risk score
* Likelihood
* Impact
* Mitigation
* Owner
* Review date
* Escalation level
* Status
* Risk heatmap
* Create/edit risk form

---

## 3.9 Issues

Purpose: Issue tracking and closure.

Required elements:

* Issue register
* Issue detail
* Severity
* Owner
* Due date
* Ageing
* Resolution plan
* Escalation status
* Closure workflow
* Create/edit issue form

---

## 3.10 Decisions

Purpose: Decision tracking and governance memory.

Required elements:

* Decision log
* Decision detail
* Decision owner
* Decision date
* Status
* Rationale
* Impact
* Related project/workstream
* Related documents
* Create/edit decision form

---

## 3.11 Change Control

Purpose: Manage change requests.

Required elements:

* Change request list
* Change request detail
* Submit change request
* Impact assessment
* Approval status
* Approver
* Decision outcome
* Implementation status
* Audit history

---

## 3.12 Approvals

Purpose: Central approval queue.

Required elements:

* My approvals
* Pending approvals
* Approved items
* Rejected items
* Approval detail
* Approve/reject actions
* Comments/reason capture
* Approval history

---

## 3.13 Resources

Purpose: Resource and workload visibility.

Required elements:

* Resource list
* Resource profile
* Allocation view
* Workload indicators
* Role
* Team/workstream
* Assigned tasks/actions
* Overloaded/underallocated indicators where data supports it

---

## 3.14 Reports / Analytics

Purpose: Operational and executive reporting.

Required elements:

* Executive report
* Project report
* Workstream report
* RAID report
* Risk report
* Issue report
* Milestone report
* Resource report
* Export controls where supported
* Filters
* Saved views where practical

---

## 3.15 Documents

Purpose: Central reference and document management UI.

Required elements:

* Document list
* Document detail
* Related entity links
* Upload UI only if backend supports it
* File metadata
* Owner
* Version/status where supported
* Permissions-aware actions

---

## 3.16 Notifications

Purpose: Alerts, reminders, and escalation visibility.

Required elements:

* Notification centre
* Unread/read states
* Priority
* Related entity
* Action link
* Notification preferences where supported
* Escalation notices

---

## 3.17 Admin / Settings

Purpose: Controlled configuration area.

Required elements:

* User management
* Role management
* Permission management
* Programme settings
* Project settings
* Status/RAG configuration
* Notification settings
* Integration settings
* Audit log access
* System configuration

Admin screens must be permission-restricted.

---

# 4. Design System Requirements

The implementation must either extend the existing design system or create a modular design-system layer if none exists.

Required design-system elements:

* Colour tokens
* Typography tokens
* Spacing tokens
* Radius tokens
* Shadow/elevation tokens
* Layout primitives
* Page headers
* Section headers
* Cards
* Metric cards
* Status badges
* RAG indicators
* Priority badges
* Data tables
* Filter bars
* Forms
* Inputs
* Selects
* Date controls
* Modals
* Drawers
* Tabs
* Toasts
* Empty states
* Error states
* Skeleton loaders
* Confirmation dialogs
* Navigation components
* Breadcrumbs
* Charts/widgets where applicable

Design rules:

* Use existing components first.
* Extend components instead of duplicating them.
* Keep styling consistent.
* Avoid hardcoded colours and spacing where tokens exist.
* Ensure components are responsive.
* Ensure interactive components are keyboard accessible.
* Ensure semantic HTML is used where practical.

---

# 5. Backend and Data Rules

The UI must be designed for real backend integration.

Rules:

1. Inspect existing API/client/data patterns before implementing.
2. Do not invent production endpoints.
3. Do not use mock data in production.
4. If APIs are unavailable, create typed service interfaces and clearly documented contracts.
5. Keep demo data isolated and disabled from production builds.
6. All forms must validate data before submission.
7. Mutations must include loading, success, and failure handling.
8. Data-fetching must include loading and error states.
9. Avoid tightly coupling UI components directly to raw API responses.
10. Use typed DTOs or interfaces.
11. Include clear notes on backend dependencies.

Required data shapes should be prepared for:

* Programme
* Project
* Workstream
* Task
* Milestone
* Dependency
* Risk
* Issue
* Decision
* Change Request
* Approval
* Resource
* Stakeholder
* Document
* Notification
* Report
* Audit Log
* User
* Role
* Permission

---

# 6. Accessibility Requirements

The UI must follow accessibility best practices.

Required checks:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels for form inputs
* ARIA attributes only where appropriate
* Dialog focus trapping
* Escape behaviour for dialogs/drawers where expected
* Accessible table headers
* Colour contrast review
* Screen-reader-friendly status indicators
* Non-colour-only status communication
* Error messages linked to fields where possible
* Logical heading structure
* Responsive zoom-friendly layout

---

# 7. Performance Requirements

The implementation must consider:

* Avoid unnecessary re-renders
* Use lazy loading/code splitting where appropriate
* Avoid large duplicated components
* Keep tables performant
* Use pagination/virtualisation where needed
* Avoid unnecessary client-side data massaging
* Use caching/invalidation patterns already present in the project
* Avoid large static mock payloads in production bundles
* Avoid excessive animation
* Keep initial dashboard rendering efficient

---

# 8. Implementation Sequence

The agents must execute in the following sequence.

---

## Phase 1: Repository Audit

Inspect:

* Framework
* Routing
* Folder structure
* Existing pages
* Existing components
* Existing design system
* Styling approach
* State management
* API/data-fetching patterns
* Auth/session handling
* Permission model
* Tests
* Build scripts
* Lint scripts
* Environment config
* Existing project-management functionality

Output:

* Audit summary
* Existing structure map
* Risks
* Reuse opportunities
* Refactor recommendations

---

## Phase 2: Product and IA Definition

Define:

* Domain model
* Route map
* Module map
* Navigation structure
* User journeys
* Role access model
* Required screens
* Data dependencies

Output:

* Product architecture
* Information architecture
* Screen inventory
* Permission-aware route map

---

## Phase 3: Design System and Layout Foundation

Implement or extend:

* App shell
* Sidebar
* Header
* Breadcrumbs
* Page layouts
* Dashboard grid
* Cards
* Tables
* Forms
* Badges
* Status indicators
* Loading states
* Empty states
* Error states

Output:

* Reusable layout and UI foundation

---

## Phase 4: Core Module Implementation

Implement the main modules:

* Dashboard
* Programme Workspace
* Projects
* Workstreams
* Tasks/Actions
* Timeline
* RAID
* Risks
* Issues
* Decisions
* Change Control
* Resources
* Approvals
* Reports
* Documents
* Notifications
* Admin/Settings

Output:

* Functional UI routes and components

---

## Phase 5: Integration Layer

Implement or document:

* Typed service interfaces
* API adaptors
* DTOs
* Loading/error handling
* Mutation patterns
* Missing backend contract list
* Demo-data isolation, if required

Output:

* Backend integration layer and documentation

---

## Phase 6: Permissions and Governance

Implement or prepare:

* Role-aware navigation
* Role-aware actions
* Permission-denied states
* Admin route restrictions
* Approval history UI
* Audit history UI
* Governance metadata fields

Output:

* Security-aware UI behaviour

---

## Phase 7: Validation and Testing

Run or add:

* Build check
* Type check
* Lint check
* Basic component/page tests
* Manual QA checklist
* Accessibility review
* Responsive review
* Console error review

Output:

* Validation report
* Known issues
* Test coverage notes

---

## Phase 8: Documentation and Handover

Produce:

* Changed files summary
* Architecture notes
* UI/design-system notes
* Integration notes
* Permission notes
* Validation notes
* Known issues
* Follow-up backlog

---

# 9. Acceptance Criteria

The delivery is only acceptable if the following conditions are met:

## Architecture

* Existing architecture has been inspected.
* Existing patterns are reused where appropriate.
* No duplicate routing/module systems are created.
* No unnecessary rewrites are performed.
* Code is modular and maintainable.
* Shared components are reusable.

## UI/UX

* Navigation is coherent.
* Core modules are discoverable.
* Screens have clear hierarchy.
* Dashboards are operationally useful.
* Tables, forms, filters, and actions are consistent.
* Empty, loading, error, and permission-denied states exist.
* Responsive layouts work across desktop, tablet, and mobile.

## Data and Integration

* No mock data is used in production paths.
* Missing APIs are documented.
* Typed contracts exist where backend is missing.
* Loading and error states exist for data operations.
* Forms include validation.
* Mutations provide feedback.

## Security

* Auth patterns are not bypassed.
* Permission-aware UI behaviour is implemented or clearly prepared.
* Admin features are restricted.
* Dangerous actions require confirmation.
* No secrets are exposed.
* Audit-sensitive workflows include audit/history UI where data supports it.

## Accessibility

* Keyboard navigation works for core flows.
* Focus states are visible.
* Forms are labelled.
* Tables are semantically structured.
* Dialogs/drawers manage focus appropriately.
* Status is not communicated by colour alone.

## Testing and Validation

* Build/type/lint checks are run where available.
* Basic tests are added or updated where practical.
* Manual QA checklist is provided.
* Known issues are documented.
* No completion claim is made without validation evidence.

---

# 10. Required Final Response Format

At the end of implementation, provide a final response with the following sections:

## 1. Executive Summary

Briefly explain what was delivered.

## 2. What Changed

List major modules, components, routes, and services added or modified.

## 3. Architecture Summary

Explain how the UI is structured and how it fits the existing codebase.

## 4. Module Summary

Summarise each implemented module:

* Dashboard
* Programme Workspace
* Projects
* Workstreams
* Tasks/Actions
* Timeline
* RAID
* Risks
* Issues
* Decisions
* Change Control
* Resources
* Approvals
* Reports
* Documents
* Notifications
* Admin/Settings

## 5. Design System Usage

Explain tokens, components, layout patterns, and reusable UI primitives.

## 6. Backend Integration Notes

Document:

* Existing APIs used
* Missing APIs
* Typed contracts added
* Service/adaptor patterns
* Data assumptions

## 7. Security and Permissions

Document:

* Role model
* Permission-aware behaviours
* Admin restrictions
* Audit/governance considerations

## 8. Accessibility Notes

Document checks completed and any remaining gaps.

## 9. Validation Completed

Include:

* Build result
* Type check result
* Lint result
* Tests run
* Manual QA performed
* Known issues

## 10. Changed Files

List added, modified, and removed files.

## 11. Assumptions

List all assumptions made.

## 12. Follow-Up Items

List anything still required from backend, product, design, security, or testing.

---

# 11. Hard Do-Nots

Do not:

* Build only static mock screens.
* Use production mock data.
* Invent backend endpoints and present them as real.
* Bypass authentication.
* Bypass authorization.
* Remove working functionality without justification.
* Create duplicate navigation systems.
* Create duplicate design systems.
* Create duplicate state management layers.
* Hardcode values that should come from config or backend.
* Leave required functionality as TODO.
* Ignore accessibility.
* Ignore responsive behaviour.
* Claim tests passed unless they were actually run.
* Claim implementation is complete if validation was not performed.
* Overbuild visual gimmicks at the cost of usability.
* Ask the user for information that can be discovered from the codebase.

---

# 12. Success Standard

The expected outcome is not a cosmetic redesign.

The expected outcome is a serious, enterprise-grade, operational project management platform UI that can support real programme execution, governance, reporting, approvals, risk management, issue management, task tracking, resource visibility, and executive oversight.

The result must be coherent, integrated, secure, accessible, maintainable, and ready for backend connection or production hardening.
