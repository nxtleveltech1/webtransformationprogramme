# Dependency Log (DEP)

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001, SRC-002 (Day 1).

| ID | Dependency | Dependent workstream | Providing → Receiving | Required date | Owner | Status | Risk if delayed | Escalate | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEP-001 | Publishing can only start once Contentstack dev complete + content/assets/URLs signed off | Publishing | Execution/Content → Publishing | Not confirmed | Programme | Open | Publishing & testing slip | Yes | SRC-002 |
| DEP-002 | Testing cannot begin until all pages built in Beta | Testing/QA | Publishing → QA | Not confirmed | Programme | Open | Go-live slip | Yes | SRC-002 |
| DEP-003 | Design System V2 must be deployed to Beta to enable Find an Advisor + new template impact | Cross Channels | OMDS → Cross Channels | Not confirmed | OMDS (Brent) | Open | Beta readiness blocked | Yes | SRC-002 |
| DEP-004 | Figma/DS component audit needed before template scaling | Design/Execution | Design → Execution/OMDS | Not confirmed | Execution/Design | Open | Build blocked / rework | Unclear | SRC-002 |
| DEP-005 | URL audit (current→new IA) before page switch-off/redirect decisions | Migration control | Execution → Publishing/SEO | Not confirmed | Execution | Open | Broken journeys, SEO loss | Yes | SRC-002 |
| DEP-006 | Content packs (copy, images, link mapping, PDFs, metadata) + cluster/SME content before design sign-off & publishing | Content/Publishing | Clusters/SMEs → Design/Publishing | Not confirmed | Content | Open | Design approval & publishing delayed | Yes | SRC-002 |
| DEP-007 | Cross Channels depends on Web Platform for all front-end from end of PI2 | Cross Channels | Web Platform → Cross Channels | End PI2 | Programme | Open | Feature delivery stalls | Yes | SRC-002 |
| DEP-008 | EasiPlus sales journey depends on Funeral product page template + MFC sign-off + e-commerce comms | Cross Channels | Design/MFC → Cross Channels | Not confirmed | Cross Channels (Wayne) | Open | EasiPlus blocked | Unclear | SRC-002 |
| DEP-009 | SEO team requires ≥2 months lead time before QA for tagging/validation | SEO/QA | SEO → Execution/Publishing | ≥2 months pre-QA | SEO | Open | Go-live blocked by SEO | Yes | SRC-001 |
| DEP-010 | Tax-free & flexi-invest product pages need updates to link migrated V2 journeys | Cross Channels | Design/Publishing → Cross Channels | Not confirmed | Cross Channels | Open | Journey continuity gaps | No | SRC-001 |
| DEP-011 | Service team must provide service-tree/dashboard solution for secure web | Secure Web | Service team → Execution | Not confirmed | Service team | Open | Secure web reorganisation blocked | Yes | SRC-001/002 |
| DEP-012 | Paid Ads URL requirements from Group Marketing needed early for URL mapping/analytics tagging | Migration/SEO | Group Marketing → Execution/SEO | Not confirmed | Group Marketing | Open | URL/analytics rework after handover | Unclear | SRC-002 |
| DEP-013 | E-commerce team (Nthabi) must be notified of URL changes to update GA tracking before go-live | Analytics/E-commerce | Execution/Cross Channels → E-commerce | Pre go-live | Wayne/E-commerce | Open | Broken exec sales/traffic reporting | Yes | SRC-005/006 |
| DEP-014 | Final advisor flow (shared by Luvuyo) implemented into beta | Cross Channels | Luvuyo → Wayne/Cross Channels | Not confirmed | Wayne | Open | Find an Advisor slip | No | SRC-005/006 |
| DEP-015 | Security-team confirmation on pen-test / crowdsource testing before go-live | Go-Live/Security | Security team → Programme | Pre go-live | Security team | Open | Go-live blocked / security exposure | Yes | SRC-005/006 |
| DEP-016 | ServiceNow API updates + QA/security/marketing approvals before production deployment | Go-Live | Execution/Ops → Programme | Pre go-live | Programme | Open | Production deployment blocked | Yes | SRC-005/006 |

---
> Add Day 2 dependencies as DEP-017+.
