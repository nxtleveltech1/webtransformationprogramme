"""Programme control expansion — subtasks, deliverables, dependencies, evidence, governance dates.

Merged into workshop_data.py to reach full WBS depth per improvmenets.md requirements.
Every row traces to workshop evidence (ACT/DEC/RSK) or explicit Requirement| theme.
"""

# WBS tuple: id, phase, ws, del, parent, title, owner, start, end, status, rag, pct, crit, pri, acceptance, trace, confidence
WBS_TASKS_EXPANSION = [
    # PH-01 governance subtasks
    ("WBS-022", "PH-01", "governance_pmo", "DEL-001", "WBS-001", "Catalogue all workshop source documents", "Gareth Bew", "2026-06-04", "2026-06-05", "IN_PROGRESS", "AMBER", 50, "N", "HIGH", "All SSOT sources indexed with ingest status", "D2|S1|SRC-008|ACT-055", "CONFIRMED"),
    ("WBS-023", "PH-01", "governance_pmo", "DEL-001", "WBS-001", "Validate register ID allocation and parity", "Gareth Bew", "2026-06-05", "2026-06-06", "IN_PROGRESS", "AMBER", 40, "N", "MEDIUM", "Register counts match WorkshopPack SSOT", "D2|S1|SRC-008|ACT-055", "CONFIRMED"),
    ("WBS-024", "PH-01", "governance_pmo", "DEL-001", "WBS-001", "Log board photograph evidence gap", "Programme", "2026-06-06", "2026-06-07", "NOT_STARTED", "AMBER", 0, "N", "LOW", "Gap recorded for missing board/sticky images", "Requirement|Board evidence gap", "REQUIRES_VALIDATION"),
    ("WBS-025", "PH-01", "governance_pmo", "DEL-002", "WBS-002", "Map phases to workstreams and owners", "Gareth Bew", "2026-06-04", "2026-06-05", "IN_PROGRESS", "AMBER", 30, "Y", "HIGH", "All 7 phases linked to 11 workstreams", "D2|S1|SRC-008|ACT-070", "CONFIRMED"),
    ("WBS-026", "PH-01", "governance_pmo", "DEL-002", "WBS-002", "Overlay milestones on WBS baseline", "Gareth Bew", "2026-06-05", "2026-06-06", "IN_PROGRESS", "AMBER", 20, "Y", "HIGH", "Critical-path milestones visible on Gantt", "D2|S1|SRC-008|ACT-070", "CONFIRMED"),
    ("WBS-027", "PH-01", "governance_pmo", "DEL-002", "WBS-002", "Seed dependency graph from workshop deps", "Tsoaeli", "2026-06-06", "2026-06-07", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Workshop dependencies mapped to WBS tasks", "D2|S1|SRC-008|ACT-069", "CONFIRMED"),
    ("WBS-028", "PH-01", "governance_pmo", "DEL-002", "WBS-002", "Establish twice-weekly leadership cadence", "Gareth Bew", "2026-06-04", "2026-06-07", "IN_PROGRESS", "AMBER", 60, "N", "HIGH", "Lead planning check-ins scheduled", "D2|S1|SRC-008|ACT-062", "CONFIRMED"),
    # PH-02 discovery subtasks
    ("WBS-029", "PH-02", "content_ia", "DEL-003", "WBS-004", "Export current URL inventory", "Natalie Patel", "2026-06-08", "2026-06-10", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Complete URL list or gap logged", "D1|S1|SRC-002|ACT-017", "CONFIRMED"),
    ("WBS-030", "PH-02", "content_ia", "DEL-003", "WBS-004", "Map URLs to target IA structure", "Natalie Patel", "2026-06-10", "2026-06-14", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Mapping covers high-traffic URLs", "D1|S1|SRC-002|ACT-017", "CONFIRMED"),
    ("WBS-031", "PH-02", "content_ia", "DEL-003", "WBS-004", "Define redirect rules and switch-off plan", "Execution", "2026-06-14", "2026-06-18", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Redirect rules documented per section", "D1|S1|SRC-002|ACT-017", "CONFIRMED"),
    ("WBS-032", "PH-02", "content_ia", "DEL-003", "WBS-004", "SEO impact assessment for URL changes", "Bernice / Luvuyo", "2026-06-14", "2026-06-21", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "SEO risks identified and mitigated", "D1|S1|SRC-002|ACT-012", "CONFIRMED"),
    ("WBS-033", "PH-02", "content_ia", "DEL-017", "WBS-004", "Content audit per section", "Bernice / Natalie", "2026-06-08", "2026-06-21", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Migrate/consolidate/delete calls per section", "D1|S2-3|SRC-005|ACT-044", "CONFIRMED"),
    ("WBS-034", "PH-02", "design_systems", "DEL-004", "WBS-005", "Audit Figma components against DS", "Brent Van Ziller", "2026-06-08", "2026-06-14", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Reusable vs to-build documented", "D1|S1|SRC-002|ACT-008", "CONFIRMED"),
    ("WBS-035", "PH-02", "design_systems", "DEL-004", "WBS-005", "Map DS component names to Contentstack", "Execution / Design", "2026-06-14", "2026-06-18", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Naming alignment documented", "D1|S2-3|SRC-005|ACT-047", "CONFIRMED"),
    ("WBS-036", "PH-02", "design_systems", "DEL-004", "WBS-005", "Identify components to build or retire", "Brent Van Ziller", "2026-06-18", "2026-06-21", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Build/retire list linked to risks", "D1|S1|SRC-002|ACT-008", "CONFIRMED"),
    ("WBS-037", "PH-02", "technical_migration", "DEL-018", None, "Environment strategy audit", "Nithin Ramsaroop", "2026-06-08", "2026-06-14", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Beta/staging/prod ownership defined", "D1|S1|SRC-002|ACT-009", "CONFIRMED"),
    ("WBS-038", "PH-02", "technical_migration", "DEL-018", "WBS-037", "Integration readiness assessment", "Nithin Ramsaroop", "2026-06-14", "2026-06-21", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Portal/SSO/integration gaps logged", "D1|S1|SRC-002|ACT-009", "CONFIRMED"),
    ("WBS-039", "PH-02", "governance_pmo", "DEL-019", None, "Stakeholder ownership map", "Programme", "2026-06-08", "2026-06-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Owners assigned per workstream/deliverable", "D1|S1|SRC-002|ACT-020", "CONFIRMED"),
    ("WBS-040", "PH-02", "governance_pmo", "DEL-019", "WBS-039", "As-is process map per workstream", "Workstream leads", "2026-06-14", "2026-06-21", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Current-state processes documented", "D1|S1|SRC-002|ACT-004", "CONFIRMED"),
    # PH-03 target-state subtasks
    ("WBS-041", "PH-03", "design_systems", "DEL-005", "WBS-006", "Personal IA validation workshop", "Sebabatso Mtimkulu", "2026-06-04", "2026-06-14", "IN_PROGRESS", "AMBER", 30, "Y", "CRITICAL", "Personal IA signed off", "D2|S1|SRC-008|DEC-022", "CONFIRMED"),
    ("WBS-042", "PH-03", "design_systems", "DEL-005", "WBS-006", "Core template playback and sign-off", "Sebabatso Mtimkulu", "2026-06-14", "2026-06-25", "IN_PROGRESS", "AMBER", 15, "Y", "CRITICAL", "Templates approved for build", "D2|S1|SRC-008|DEC-017", "CONFIRMED"),
    ("WBS-043", "PH-03", "design_systems", "DEL-005", "WBS-006", "Red/green zone rules documentation", "Brent Van Ziller", "2026-06-17", "2026-06-25", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Zone rules and change control documented", "D2|S1|SRC-008|DEC-017", "CONFIRMED"),
    ("WBS-044", "PH-03", "design_systems", "DEL-005", "WBS-006", "Generic content guidelines approval", "Justin Evans", "2026-06-20", "2026-06-30", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Content guidelines accepted", "D2|S1|SRC-008|DEC-022", "CONFIRMED"),
    ("WBS-045", "PH-03", "design_systems", "DEL-005", "WBS-006", "Accessibility and brand alignment review", "Design", "2026-06-25", "2026-06-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "A11y and brand checks complete", "D1|S1|SRC-002|ACT-006", "CONFIRMED"),
    ("WBS-046", "PH-03", "publishing", "DEL-006", "WBS-007", "Document gatekeeper approval criteria", "Bernice Bryce", "2026-06-17", "2026-06-22", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Gate criteria published", "D2|S1|SRC-008|DEC-019", "CONFIRMED"),
    ("WBS-047", "PH-03", "publishing", "DEL-006", "WBS-007", "Establish trained-builder roster", "Bernice Bryce", "2026-06-22", "2026-06-27", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Trained builders identified", "D2|S1|SRC-008|DEC-019", "CONFIRMED"),
    ("WBS-048", "PH-03", "publishing", "DEL-006", "WBS-007", "Tenant onboarding standards pack", "Publishing", "2026-06-27", "2026-06-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Tenant standards documented", "D2|S1|SRC-008|DEC-026", "CONFIRMED"),
    ("WBS-049", "PH-03", "publishing", "DEL-006", "WBS-007", "Publishing approval workflow configuration", "Bernice Bryce", "2026-06-22", "2026-06-30", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Workflow configured in CMS", "D2|S1|SRC-008|DEC-019", "CONFIRMED"),
    # PH-04 build subtasks
    ("WBS-050", "PH-04", "technical_migration", "DEL-007", "WBS-008", "Implement Playwright automated test suite", "Daniel", "2026-06-09", "2026-06-20", "IN_PROGRESS", "AMBER", 20, "Y", "HIGH", "Playwright suite running in CI", "D2|S1|SRC-008|DEC-021", "CONFIRMED"),
    ("WBS-051", "PH-04", "technical_migration", "DEL-007", "WBS-008", "Configure linting and code quality gates", "Daniel", "2026-06-15", "2026-06-25", "IN_PROGRESS", "AMBER", 10, "Y", "HIGH", "Lint gates block failed builds", "D2|S1|SRC-008|DEC-021", "CONFIRMED"),
    ("WBS-052", "PH-04", "technical_migration", "DEL-007", "WBS-008", "Quality gate reporting dashboard", "Daniel", "2026-06-25", "2026-06-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Reports visible to release approvers", "D2|S1|SRC-008|DEC-021", "CONFIRMED"),
    ("WBS-053", "PH-04", "technical_migration", "DEL-007", "WBS-008", "Environment readiness checklist", "Nithin Ramsaroop", "2026-06-09", "2026-06-30", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "All envs validated for release", "D1|S1|SRC-002|ACT-009", "CONFIRMED"),
    ("WBS-054", "PH-04", "content_ia", "DEL-008", "WBS-009", "Define content standards and asset repository", "Bernice Bryce", "2026-07-01", "2026-07-10", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Standards pack approved", "D1|S1|SRC-002|ACT-019", "CONFIRMED"),
    ("WBS-055", "PH-04", "content_ia", "DEL-008", "WBS-009", "Personal content package QA", "Bernice Bryce", "2026-07-10", "2026-07-25", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "QA evidence captured", "D2|S1|SRC-008|ACT-056", "CONFIRMED"),
    ("WBS-056", "PH-04", "content_ia", "DEL-008", "WBS-010", "Article template migration", "Bernice / Design", "2026-07-01", "2026-07-15", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Article pages migrated", "D2|S1|SRC-008|DEC-023", "CONFIRMED"),
    ("WBS-057", "PH-04", "content_ia", "DEL-008", "WBS-010", "News structure migration", "Bernice / Design", "2026-07-15", "2026-07-25", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "News pages migrated with retention rules", "D2|S1|SRC-008|DEC-023", "CONFIRMED"),
    ("WBS-058", "PH-04", "content_ia", "DEL-008", "WBS-010", "Content migration QA sign-off", "Bernice Bryce", "2026-07-25", "2026-07-31", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Migration QA approved", "D2|S1|SRC-008|ACT-058", "CONFIRMED"),
    ("WBS-059", "PH-04", "technical_migration", "DEL-009", "WBS-011", "SA-first country sequencing plan", "Programme / Regional", "2026-06-08", "2026-06-30", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Country order documented", "D2|S1|SRC-008|DEC-025", "CONFIRMED"),
    ("WBS-060", "PH-04", "technical_migration", "DEL-009", "WBS-011", "Secure web dependency assessment", "Nithin Ramsaroop", "2026-06-30", "2026-07-31", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Secure web blockers visible", "D2|S1|SRC-008|DEP-020", "CONFIRMED"),
    ("WBS-061", "PH-04", "technical_migration", "DEL-009", "WBS-011", "South Sudan decommission-only path", "Programme / Regional", "2026-07-01", "2026-08-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Decommission plan approved", "D2|S1|SRC-008|ACT-074", "CONFIRMED"),
    ("WBS-062", "PH-04", "design_systems", "DEL-020", None, "Build enhanced DS components", "Sebabatso Mtimkulu", "2026-06-24", "2026-07-31", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Priority components built", "D1|S1|SRC-002|ACT-008", "CONFIRMED"),
    ("WBS-063", "PH-04", "design_systems", "DEL-020", "WBS-062", "Template skinning and theme decisions", "Design", "2026-07-01", "2026-07-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Themes applied per audience", "D1|S1|SRC-002|ACT-020", "CONFIRMED"),
    # PH-05 test/readiness subtasks
    ("WBS-064", "PH-05", "testing_go_live", "DEL-010", "WBS-012", "PGW readiness criteria definition", "Luvuyo Mkumatela", "2026-06-09", "2026-06-20", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "PGW criteria documented", "D1|S1|SRC-002|ACT-013", "CONFIRMED"),
    ("WBS-065", "PH-05", "testing_go_live", "DEL-010", "WBS-012", "QAG validation checklist", "Luvuyo Mkumatela", "2026-06-20", "2026-07-15", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "QAG items mapped to gates", "D1|S1|SRC-002|ACT-013", "CONFIRMED"),
    ("WBS-066", "PH-05", "testing_go_live", "DEL-010", "WBS-012", "ServiceNow release gate integration", "Gareth Bew", "2026-07-01", "2026-08-31", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "ServiceNow approvals in checklist", "D1|S1|SRC-002|ACT-013", "CONFIRMED"),
    ("WBS-067", "PH-05", "testing_go_live", "DEL-021", None, "Functional testing execution", "Execution", "2026-07-15", "2026-09-30", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Functional test results logged", "D1|S1|SRC-002|ACT-010", "CONFIRMED"),
    ("WBS-068", "PH-05", "testing_go_live", "DEL-021", "WBS-067", "Regression testing execution", "Execution", "2026-08-01", "2026-10-15", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Regression results logged", "D2|S1|SRC-008|DEC-021", "CONFIRMED"),
    ("WBS-069", "PH-05", "testing_go_live", "DEL-021", "WBS-067", "Redirect and URL testing", "Natalie Patel", "2026-08-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "All redirects validated", "D1|S1|SRC-002|ACT-017", "CONFIRMED"),
    ("WBS-070", "PH-05", "testing_go_live", "DEL-021", "WBS-067", "Accessibility testing", "Design", "2026-09-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "A11y issues resolved or accepted", "D1|S1|SRC-002|ACT-006", "CONFIRMED"),
    ("WBS-071", "PH-05", "testing_go_live", "DEL-010", "WBS-013", "Confirm pen-test scope", "Gareth / Nzama", "2026-06-09", "2026-07-15", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Pen-test scope signed off", "D2|S1|SRC-008|ACT-072", "CONFIRMED"),
    ("WBS-072", "PH-05", "testing_go_live", "DEL-010", "WBS-013", "Security validation evidence pack", "Nzama", "2026-07-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Security evidence attached to gate", "D2|S1|SRC-008|RSK-022", "CONFIRMED"),
    # Contact centre thin workstream expansion
    ("WBS-073", "PH-05", "contact_support", "DEL-011", "WBS-014", "Contact centre briefing session", "Programme / Support", "2026-07-01", "2026-08-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Agents briefed on web changes", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-074", "PH-05", "contact_support", "DEL-011", "WBS-014", "Agent scripting for public web changes", "Programme / Support", "2026-08-01", "2026-09-30", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Scripts approved and distributed", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-075", "PH-05", "contact_support", "DEL-011", "WBS-014", "Secure portal change awareness training", "Programme / Support", "2026-08-15", "2026-10-15", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Secure web changes covered in training", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-076", "PH-05", "contact_support", "DEL-011", "WBS-014", "Surge support planning", "Programme / Support", "2026-09-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Surge capacity plan approved", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-077", "PH-05", "contact_support", "DEL-011", "WBS-014", "Support queue setup and routing", "Programme / Support", "2026-09-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Queue active before launch", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-078", "PH-05", "contact_support", "DEL-011", "WBS-014", "Escalation rules and known-issues process", "Programme / Support", "2026-10-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Escalation path documented", "Requirement|Contact centre readiness", "INFERRED"),
    ("WBS-079", "PH-05", "contact_support", "DEL-011", "WBS-014", "Feedback loop to web team", "Programme / Support", "2026-10-15", "2026-11-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Feedback channel operational", "Requirement|Contact centre readiness", "INFERRED"),
    # Training thin workstream expansion
    ("WBS-080", "PH-05", "training_adoption", "DEL-012", "WBS-015", "CMS editor training programme", "Programme / Training", "2026-07-01", "2026-09-30", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "CMS editors trained with attendance log", "Requirement|Training as go-live gate", "INFERRED"),
    ("WBS-081", "PH-05", "training_adoption", "DEL-012", "WBS-015", "SME training sessions", "Programme / Training", "2026-08-01", "2026-10-15", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "SME sessions completed", "Requirement|Training as go-live gate", "INFERRED"),
    ("WBS-082", "PH-05", "training_adoption", "DEL-012", "WBS-015", "Contact centre training delivery", "Programme / Training", "2026-08-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Contact centre training complete", "Requirement|Training as go-live gate", "INFERRED"),
    ("WBS-083", "PH-05", "training_adoption", "DEL-012", "WBS-015", "Training materials and knowledge base updates", "Programme / Training", "2026-07-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Materials published in KB", "Requirement|Training as go-live gate", "INFERRED"),
    ("WBS-084", "PH-05", "training_adoption", "DEL-012", "WBS-015", "Attendance and completion tracking", "Programme / Training", "2026-09-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Completion evidence captured", "Requirement|Training as go-live gate", "INFERRED"),
    ("WBS-085", "PH-05", "training_adoption", "DEL-012", "WBS-015", "General staff awareness sessions", "Programme / Training", "2026-09-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Staff awareness complete", "Requirement|Training as go-live gate", "INFERRED"),
    # Internal comms thin workstream expansion
    ("WBS-086", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Executive briefing plan", "Programme / Comms", "2026-07-01", "2026-08-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Executive briefings scheduled", "Requirement|Internal communications", "INFERRED"),
    ("WBS-087", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Staff communication pack", "Programme / Comms", "2026-08-01", "2026-10-15", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Staff messages approved", "Requirement|Internal communications", "INFERRED"),
    ("WBS-088", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Content owner notifications", "Programme / Comms", "2026-08-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Owners notified of responsibilities", "Requirement|Internal communications", "INFERRED"),
    ("WBS-089", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Change champion network activation", "Programme / Comms", "2026-09-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Champions identified and briefed", "Requirement|Internal communications", "INFERRED"),
    ("WBS-090", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Internal FAQ and operational readiness messaging", "Programme / Comms", "2026-09-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "FAQ published internally", "Requirement|Internal communications", "INFERRED"),
    ("WBS-091", "PH-05", "internal_comms", "DEL-013", "WBS-016", "Launch awareness schedule", "Programme / Comms", "2026-10-01", "2026-11-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Comms schedule aligned to go-live", "Requirement|Internal communications", "INFERRED"),
    # External comms thin workstream expansion
    ("WBS-092", "PH-05", "external_comms", "DEL-014", "WBS-017", "Customer-facing launch messaging", "Programme / Marketing", "2026-07-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Customer messages approved", "Requirement|External communications", "INFERRED"),
    ("WBS-093", "PH-05", "external_comms", "DEL-014", "WBS-017", "Partner notification plan", "Programme / Marketing", "2026-08-01", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Partners notified of changes", "Requirement|External communications", "INFERRED"),
    ("WBS-094", "PH-05", "external_comms", "DEL-014", "WBS-017", "External URL change communication", "Programme / Marketing", "2026-09-01", "2026-11-30", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "URL change comms aligned to redirects", "Requirement|External communications", "INFERRED"),
    ("WBS-095", "PH-05", "external_comms", "DEL-014", "WBS-017", "Marketing and PR coordination", "Programme / Marketing", "2026-09-15", "2026-11-30", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "PR plan aligned to launch", "Requirement|External communications", "INFERRED"),
    ("WBS-096", "PH-05", "external_comms", "DEL-014", "WBS-017", "Customer education and support messaging", "Programme / Marketing", "2026-10-01", "2026-11-30", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Support messaging published", "Requirement|External communications", "INFERRED"),
    ("WBS-097", "PH-05", "external_comms", "DEL-014", "WBS-017", "SEO impact briefing for external audiences", "Bernice / Marketing", "2026-08-15", "2026-10-31", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "SEO briefing complete", "D1|S1|SRC-002|ACT-012", "CONFIRMED"),
    # PH-06 launch subtasks
    ("WBS-098", "PH-06", "testing_go_live", "DEL-015", "WBS-018", "Compile go/no-go readiness evidence pack", "Luvuyo Mkumatela", "2026-10-15", "2026-11-15", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "All gate evidence attached", "D1|S1|SRC-002|ACT-013", "CONFIRMED"),
    ("WBS-099", "PH-06", "testing_go_live", "DEL-015", "WBS-018", "Review and resolve blocking issues", "Programme / Steering", "2026-11-01", "2026-11-25", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Blockers resolved or escalated", "D1|S1|SRC-001|End-November constraint", "INFERRED"),
    ("WBS-100", "PH-06", "testing_go_live", "DEL-015", "WBS-018", "Capture steering go/no-go decision", "Steering Committee", "2026-11-25", "2026-11-30", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Decision recorded with evidence", "D2|S1|SRC-008|DEC-027", "CONFIRMED"),
    ("WBS-101", "PH-06", "publishing", "DEL-015", "WBS-019", "Execute publishing freeze", "Bernice Bryce", "2026-11-20", "2026-11-30", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Freeze enforced before cutover", "D2|S1|SRC-008|DEC-019", "CONFIRMED"),
    ("WBS-102", "PH-06", "publishing", "DEL-015", "WBS-019", "Release window and rollback test", "Publishing", "2026-11-15", "2026-11-28", "NOT_STARTED", "AMBER", 0, "Y", "HIGH", "Rollback path validated", "D2|S1|SRC-008|DEC-019", "CONFIRMED"),
    ("WBS-103", "PH-06", "testing_go_live", "DEL-022", None, "Production deployment and smoke testing", "Execution", "2026-11-28", "2026-11-30", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Smoke tests pass in production", "D1|S1|SRC-001|End-November constraint", "INFERRED"),
    ("WBS-104", "PH-06", "content_ia", "DEL-022", "WBS-103", "Redirect activation and validation", "Natalie Patel", "2026-11-28", "2026-11-30", "NOT_STARTED", "AMBER", 0, "Y", "CRITICAL", "Redirects active and tested", "D1|S1|SRC-002|ACT-017", "CONFIRMED"),
    # PH-07 hypercare subtasks
    ("WBS-105", "PH-07", "hypercare", "DEL-016", "WBS-020", "Hypercare daily stand-up cadence", "Programme / Support", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Daily stand-ups running", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-106", "PH-07", "hypercare", "DEL-016", "WBS-020", "Issue triage and priority fix backlog", "Programme / Support", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Triage process active", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-107", "PH-07", "hypercare", "DEL-016", "WBS-020", "Usage monitoring and defect resolution", "Execution", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Monitoring dashboards active", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-108", "PH-07", "hypercare", "DEL-016", "WBS-020", "Contact centre feedback log", "Programme / Support", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Feedback logged daily", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-109", "PH-07", "hypercare", "DEL-016", "WBS-020", "Content correction process", "Bernice Bryce", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Content fixes tracked and resolved", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-110", "PH-07", "hypercare", "DEL-016", "WBS-021", "Business impact reporting", "Programme / Support", "2026-12-07", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Impact report issued to steering", "Requirement|Hypercare formal phase", "INFERRED"),
    ("WBS-111", "PH-07", "hypercare", "DEL-016", "WBS-021", "Stabilisation exit criteria review", "Programme / Steering", "2026-12-10", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "HIGH", "Exit criteria met or risk accepted", "Requirement|Hypercare exit criteria", "INFERRED"),
    ("WBS-112", "PH-07", "hypercare", "DEL-016", "WBS-021", "Lessons learned workshop", "Programme", "2026-12-12", "2026-12-14", "NOT_STARTED", "AMBER", 0, "N", "MEDIUM", "Lessons captured and published", "Requirement|Hypercare exit criteria", "INFERRED"),
]

DELIVERABLES_EXPANSION = [
    ("DEL-017", "PH-02", "content_ia", "Content audit register", "Per-section migrate/consolidate/delete decisions with owners", "Bernice / Natalie", "2026-06-08", "2026-06-21", "NOT_STARTED", "AMBER", "Audit complete per section", "Content lead sign-off", "Content audit evidence", "D1|S2-3|SRC-005|ACT-044"),
    ("DEL-018", "PH-02", "technical_migration", "Environment and integration audit", "Beta/staging/prod strategy and integration readiness assessment", "Nithin Ramsaroop", "2026-06-08", "2026-06-21", "NOT_STARTED", "AMBER", "Environments and integrations documented", "Architecture sign-off", "Environment audit evidence", "D1|S1|SRC-002|ACT-009"),
    ("DEL-019", "PH-02", "governance_pmo", "Stakeholder ownership map", "Owners and SMEs mapped per workstream and deliverable", "Programme", "2026-06-08", "2026-06-21", "NOT_STARTED", "AMBER", "All workstreams have named owners or gaps", "Programme sign-off", "RACI evidence", "D1|S1|SRC-002|ACT-020"),
    ("DEL-020", "PH-04", "design_systems", "Enhanced components and templates", "Built/enhanced DS components and audience templates", "Sebabatso Mtimkulu", "2026-06-24", "2026-07-31", "NOT_STARTED", "AMBER", "Priority components ready for migration", "Design sign-off", "Component build evidence", "D1|S1|SRC-002|ACT-008"),
    ("DEL-021", "PH-05", "testing_go_live", "Test execution results pack", "Functional, regression, redirect, accessibility and performance test results", "Execution / Luvuyo", "2026-07-15", "2026-10-31", "NOT_STARTED", "AMBER", "Test results attached to readiness gates", "QA sign-off", "Test evidence pack", "D1|S1|SRC-002|ACT-010"),
    ("DEL-022", "PH-06", "testing_go_live", "Cutover and smoke test record", "Production deployment, redirect activation and smoke test evidence", "Execution", "2026-11-28", "2026-11-30", "NOT_STARTED", "AMBER", "Smoke tests pass with evidence", "Go-live commander sign-off", "Cutover evidence", "D1|S1|SRC-001|End-November constraint"),
    ("DEL-023", "PH-05", "internal_comms", "Executive and staff comms pack", "Approved executive briefings, staff messages and FAQ", "Programme / Comms", "2026-08-01", "2026-10-31", "NOT_STARTED", "AMBER", "All internal audiences covered", "Comms sign-off", "Internal comms evidence", "Requirement|Internal communications"),
    ("DEL-024", "PH-05", "external_comms", "Customer and partner comms pack", "Approved external messaging for launch and URL changes", "Programme / Marketing", "2026-08-01", "2026-11-30", "NOT_STARTED", "AMBER", "External audiences covered", "Marketing approval", "External comms evidence", "Requirement|External communications"),
    ("DEL-025", "PH-05", "contact_support", "Agent scripts and escalation pack", "Contact centre scripts, queue setup and escalation rules", "Programme / Support", "2026-08-01", "2026-10-31", "NOT_STARTED", "AMBER", "Scripts and escalation approved", "Support owner sign-off", "Support readiness evidence", "Requirement|Contact centre readiness"),
    ("DEL-026", "PH-05", "training_adoption", "Training completion register", "Attendance and completion evidence for all training streams", "Programme / Training", "2026-09-01", "2026-10-31", "NOT_STARTED", "AMBER", "Completion thresholds met", "Training gate approval", "Training evidence", "Requirement|Training as go-live gate"),
    ("DEL-027", "PH-06", "governance_pmo", "Go-live decision record", "Formal steering decision with blockers and evidence log", "Steering Committee", "2026-11-25", "2026-11-30", "NOT_STARTED", "AMBER", "Decision captured in platform", "Steering approval", "Decision record evidence", "D2|S1|SRC-008|DEC-027"),
    ("DEL-028", "PH-07", "hypercare", "Hypercare daily issue log", "Daily triage log, defects and priority fixes during hypercare", "Programme / Support", "2026-12-01", "2026-12-14", "NOT_STARTED", "AMBER", "Daily log maintained", "Programme review", "Hypercare log evidence", "Requirement|Hypercare formal phase"),
    ("DEL-029", "PH-07", "hypercare", "Stabilisation exit report", "Exit criteria assessment, residual risks and lessons learned", "Programme / Support", "2026-12-10", "2026-12-14", "NOT_STARTED", "AMBER", "Exit report approved", "Steering exit approval", "Exit report evidence", "Requirement|Hypercare exit criteria"),
    ("DEL-030", "PH-02", "design_systems", "Template inventory audit", "Current template catalogue with reuse/migrate/retire decisions", "Brent Van Ziller", "2026-06-08", "2026-06-21", "NOT_STARTED", "AMBER", "Template decisions documented", "Design authority approval", "Template audit evidence", "D1|S1|SRC-002|ACT-008"),
    ("DEL-031", "PH-04", "publishing", "CMS publishing workflow configuration", "Configured approval, staging and release controls in CMS", "Bernice Bryce", "2026-06-24", "2026-07-31", "NOT_STARTED", "AMBER", "Workflow operational in CMS", "Publishing sign-off", "CMS config evidence", "D2|S1|SRC-008|DEC-019"),
    ("DEL-032", "PH-04", "technical_migration", "Secure web and SSO configuration", "Secure portal paths, SSO and integration configuration", "Nithin Ramsaroop", "2026-07-01", "2026-09-30", "NOT_STARTED", "AMBER", "Secure paths validated", "Security sign-off", "Secure web evidence", "D2|S1|SRC-008|DEP-020"),
    ("DEL-033", "PH-05", "governance_pmo", "Steering committee status pack", "Consolidated RAID, readiness, WBS and decision pack for steering", "Gareth Bew", "2026-06-09", "2026-11-30", "NOT_STARTED", "AMBER", "Pack generated from platform data", "Steering review", "Governance pack evidence", "D1|S1|SRC-002|Governance"),
    ("DEL-034", "PH-01", "governance_pmo", "Input gaps register", "Explicit log of missing board images, owners, dates and approvals", "Programme", "2026-06-04", "2026-06-07", "IN_PROGRESS", "AMBER", "All gaps logged with follow-up", "Programme sign-off", "Gap register evidence", "Requirement|Board evidence gap"),
]

TASK_DEPENDENCIES_EXPANSION = [
    ("WBS-029", "WBS-030", "finish_to_start", 0, "URL mapping depends on inventory"),
    ("WBS-030", "WBS-031", "finish_to_start", 0, "Redirects depend on IA mapping"),
    ("WBS-034", "WBS-035", "finish_to_start", 0, "Contentstack mapping follows Figma audit"),
    ("WBS-035", "WBS-036", "finish_to_start", 0, "Build/retire list follows mapping"),
    ("WBS-037", "WBS-038", "finish_to_start", 0, "Integration assessment follows env audit"),
    ("WBS-041", "WBS-042", "finish_to_start", 0, "Template sign-off follows IA validation"),
    ("WBS-042", "WBS-043", "finish_to_start", 0, "Zone rules follow template approval"),
    ("WBS-046", "WBS-047", "finish_to_start", 0, "Trained builders follow gate criteria"),
    ("WBS-047", "WBS-049", "finish_to_start", 0, "Workflow config needs builder roster"),
    ("WBS-050", "WBS-051", "finish_to_start", 0, "Linting follows Playwright baseline"),
    ("WBS-051", "WBS-052", "finish_to_start", 0, "Reporting follows quality gates"),
    ("WBS-054", "WBS-055", "finish_to_start", 0, "QA follows standards pack"),
    ("WBS-056", "WBS-057", "finish_to_start", 0, "News migration follows articles"),
    ("WBS-057", "WBS-058", "finish_to_start", 0, "QA follows migration"),
    ("WBS-062", "WBS-063", "finish_to_start", 0, "Skinning follows component build"),
    ("WBS-064", "WBS-065", "finish_to_start", 0, "QAG follows PGW criteria"),
    ("WBS-065", "WBS-066", "finish_to_start", 0, "ServiceNow follows QAG"),
    ("WBS-067", "WBS-068", "finish_to_start", 0, "Regression follows functional"),
    ("WBS-068", "WBS-069", "finish_to_start", 0, "Redirect testing follows regression"),
    ("WBS-071", "WBS-072", "finish_to_start", 0, "Security pack follows pen-test scope"),
    ("WBS-073", "WBS-074", "finish_to_start", 0, "Scripts follow briefing"),
    ("WBS-074", "WBS-077", "finish_to_start", 0, "Queue setup follows scripts"),
    ("WBS-080", "WBS-084", "finish_to_start", 0, "Tracking follows CMS training"),
    ("WBS-086", "WBS-087", "finish_to_start", 0, "Staff comms follow executive briefing"),
    ("WBS-092", "WBS-094", "finish_to_start", 0, "URL comms follow customer messaging"),
    ("WBS-098", "WBS-099", "finish_to_start", 0, "Blocker review follows evidence pack"),
    ("WBS-099", "WBS-100", "finish_to_start", 0, "Decision follows blocker resolution"),
    ("WBS-101", "WBS-103", "finish_to_start", 0, "Deployment follows publishing freeze"),
    ("WBS-103", "WBS-104", "finish_to_start", 0, "Redirects follow deployment"),
    ("WBS-105", "WBS-106", "finish_to_start", 0, "Triage follows stand-up cadence"),
    ("WBS-106", "WBS-111", "finish_to_start", 0, "Exit review follows triage period"),
    ("WBS-031", "WBS-069", "finish_to_start", 0, "Redirect testing depends on redirect rules"),
    ("WBS-055", "WBS-098", "finish_to_start", 0, "Go/no-go pack needs content QA"),
    ("WBS-084", "WBS-098", "finish_to_start", 0, "Training completion required for go/no-go"),
    ("WBS-090", "WBS-098", "finish_to_start", 0, "Internal FAQ required for go/no-go"),
]

# Governance meeting date overrides: (id, scheduled_date)
GOVERNANCE_MEETING_DATES = {
    "GOV-MTG-001": "2026-06-20",
    "GOV-MTG-002": "2026-06-05",
    "GOV-MTG-003": "2026-06-06",
    "GOV-MTG-005": "2026-06-25",
    "GOV-MTG-006": "2026-11-28",
    "GOV-MTG-007": "2026-12-01",
    "GOV-MTG-008": "2026-06-10",
    "GOV-MTG-009": "2026-06-06",
}

def build_evidence_links_expansion():
    """Generate evidence links for major deliverables and critical WBS tasks."""
    links = [
        ("TASK", "WBS-024", "GAP", None, "Board/sticky photographs not found in workspace — documented evidence gap", "Requirement|Board evidence gap", "REQUIRES_VALIDATION"),
        ("DELIVERABLE", "DEL-034", "GAP", None, "Input gaps register captures missing board images, owners, dates and approvals", "Requirement|Board evidence gap", "REQUIRES_VALIDATION"),
    ]
    for del_id, *_ in DELIVERABLES_EXPANSION:
        links.append(("DELIVERABLE", del_id, "SUPPORTS", None, f"Deliverable {del_id} derived from workshop extraction matrix", f"Extraction|{del_id}", "CONFIRMED"))
    critical_tasks = [t for t in WBS_TASKS_EXPANSION if t[12] == "Y"]
    for task in critical_tasks[:25]:
        links.append(("TASK", task[0], "SUPPORTS", None, f"Critical path task: {task[5]}", task[15], task[16]))
    for gate_id in ["RG-002", "RG-003", "RG-004", "RG-005", "RG-007", "RG-008", "RG-009", "RG-010", "RG-011"]:
        links.append(("READINESS_GATE", gate_id, "SUPPORTS", None, f"Readiness gate {gate_id} criteria from workshop/requirement", f"Requirement|{gate_id}", "INFERRED"))
    return links

EVIDENCE_LINKS_EXPANSION = build_evidence_links_expansion()
