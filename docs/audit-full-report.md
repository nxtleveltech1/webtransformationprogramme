# Full Data Audit Report

Generated: 2026-06-08T13:30:17.660Z (read-only sweep via `npm run db:audit:full`)

**Result:** 0 FAIL · 2 WARN · 6 PASS

## Findings

### Model counts
- ⚠️ **TranscriptExcerpt** — table is empty (expected seeded data)
- ⚠️ **Site** — table is empty (expected seeded data)
- ℹ️ **Scenario** — empty (app-authored — populated through use)
- ℹ️ **ScenarioChange** — empty (app-authored — populated through use)
- ℹ️ **StatusUpdate** — empty (app-authored — populated through use)
- ℹ️ **Comment** — empty (app-authored — populated through use)
- ℹ️ **Attachment** — empty (app-authored — populated through use)
- ℹ️ **ChangeRequest** — empty (app-authored — populated through use)
- ℹ️ **Approval** — empty (app-authored — populated through use)
- ℹ️ **ResourceAllocation** — empty (app-authored — populated through use)
- ℹ️ **Document** — empty (app-authored — populated through use)
- ℹ️ **Notification** — empty (app-authored — populated through use)
- ℹ️ **User** — empty (app-authored — populated through use)
- ℹ️ **UserRole** — empty (app-authored — populated through use)
- ✅ **Sweep complete** — 81 models, 2784 total rows

### RegisterLink integrity
- ✅ **All link endpoints resolve** — 235 links checked

### TraceReference integrity
- ✅ **All trace entities resolve** — 285 traces checked

### EvidenceLink integrity
- ✅ **All evidence entities resolve** — 60 links checked
- ✅ **Typed FKs populated** — all first-class evidence links carry their FK

### Polymorphic app tables
- ℹ️ **Approval** — no rows yet
- ℹ️ **Comment** — no rows yet
- ℹ️ **Notification** — no rows yet
- ℹ️ **Document** — no rows yet

### Required fields & ownership
- ✅ **PM rows carry traceRef** — tasks, deliverables, readiness gates all traced
- ℹ️ **Owner-person coverage** — Task 91/112 (81%); Deliverable 28/34 (82%); Risk 6/32 (19%); Action 65/84 (77%); Decision 14/28 (50%)

## Prioritized remediation backlog
1. **[WARN] Model counts — TranscriptExcerpt**: table is empty (expected seeded data)
2. **[WARN] Model counts — Site**: table is empty (expected seeded data)

## Row counts (all models)

| Model | Rows |
| --- | ---: |
| Action | 84 |
| AnalysisArtifact | 7 |
| Approval | 0 |
| Assumption | 16 |
| Attachment | 0 |
| AuditEvent | 5 |
| ChangeRequest | 0 |
| Comment | 0 |
| ComponentTemplate | 6 |
| CriticalPathStep | 15 |
| CustomerJourney | 7 |
| Decision | 28 |
| Deliverable | 34 |
| Dependency | 22 |
| DirectoryArea | 12 |
| DirectoryBusiness | 21 |
| DirectoryCluster | 15 |
| Document | 0 |
| EvidenceLink | 60 |
| ExecutiveSummary | 3 |
| ExportArtifact | 4 |
| GlossaryTerm | 74 |
| GovernanceForum | 7 |
| GovernanceMeeting | 9 |
| GovernanceReferenceDoc | 1 |
| GovernanceReferenceSection | 14 |
| IngestionLogEntry | 4 |
| Issue | 11 |
| Milestone | 4 |
| Notification | 0 |
| OpenQuestion | 27 |
| PageMigrationItem | 10 |
| ParkingLotItem | 15 |
| Permission | 341 |
| Person | 70 |
| PersonTeam | 53 |
| Phase | 7 |
| ProcessWorkflow | 2 |
| Programme | 1 |
| ProgrammeRoleAssignment | 11 |
| Project | 11 |
| QaReportItem | 1 |
| RaciRow | 50 |
| ReadinessCriterion | 11 |
| ReadinessGate | 11 |
| ReconciliationRecord | 14 |
| ReferenceMapping | 8 |
| RegisterLink | 235 |
| RegisterSequence | 8 |
| Resource | 70 |
| ResourceAllocation | 0 |
| ResourceConstraint | 6 |
| Risk | 32 |
| RoadmapActivity | 17 |
| Role | 9 |
| RolePermission | 672 |
| Scenario | 0 |
| ScenarioChange | 0 |
| ScopeOption | 2 |
| SessionAgendaItem | 22 |
| SessionOutput | 5 |
| SessionTopic | 41 |
| Site | 0 |
| SourceDocument | 9 |
| StakeholderRole | 32 |
| StatusUpdate | 0 |
| StreamInput | 10 |
| SuccessMetric | 12 |
| SystemPlatform | 7 |
| Task | 112 |
| TaskDependency | 42 |
| Team | 22 |
| TraceReference | 285 |
| Tradeoff | 9 |
| TranscriptExcerpt | 0 |
| User | 0 |
| UserRole | 0 |
| WorkshopDay | 2 |
| WorkshopEvent | 1 |
| WorkshopSession | 5 |
| Workstream | 11 |
