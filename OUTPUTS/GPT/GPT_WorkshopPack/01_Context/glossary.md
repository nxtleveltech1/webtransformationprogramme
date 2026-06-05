# Glossary — Terms, Acronyms & Systems

> **GPT review stamp:** GPT-reviewed artefact | 2026-06-03 | Day 1 provisional | Day 2 pending unless explicitly evidenced. This file is a reviewed copy of the WorkshopPack baseline; uncertainty remains explicit and no Day 2 outcomes are invented.


**Source:** SRC-001, SRC-002, SRC-003 (Day 1).
Terms marked **[validate]** are unclear in source material and require human confirmation (per Agent.md traceability rules). Do not treat [validate] expansions as confirmed.

---

## Programme & business terms

| Term | Meaning / context | Confidence |
| --- | --- | --- |
| Web Transformation | The overall programme: migrate to new platform, uplift CX, decommission legacy | Confirmed |
| Migration | Moving existing pages/journeys to the new platform | Confirmed |
| As-is page | A page moved with minimal change (no new template); ~30 min effort. Exact definition (incl. whether it means V2 with new nav/footer) is **unresolved** and must be formally agreed | Definition disputed |
| New-template page | A page rebuilt on a new V2 template; ~2 h effort | Confirmed |
| MVP | Minimum viable product for migration: new navigation for four simplified audiences + secure web IA | Confirmed |
| BAU | Business as usual — ongoing daily/monthly/campaign content updates competing with migration capacity | Confirmed |
| Red zones / Green zones | Template governance model: "red zones" = non-negotiable, strict-rule sections; "green zones" = modular, configurable component areas within limits | Confirmed |
| Snowflakes | Unique, one-off components not built as standard design-system components, maintained separately | Confirmed |
| Content pack | The complete handover bundle to publishers: final copy, images, link mapping, PDFs/downloads, metadata, multimedia | Confirmed |
| Switch-off criteria | Criteria for decommissioning a legacy page (tied to URL audit, redirects, testing evidence, business sign-off) | Confirmed |

## Acronyms

| Acronym | Meaning / context | Confidence |
| --- | --- | --- |
| OMAR / Omar | Old Mutual business area / site set being migrated (~1,530 pages). "Omar" in source notes = OMAR **[validate exact entity]** | [validate] |
| OMDS | Old Mutual Design System — positioned as an enterprise digital experience framework & governance layer, not just a UI component library | Confirmed |
| OMF | Old Mutual Finance **[validate]** — currently the only group providing structured design briefs using platform components | [validate] |
| OMAI / OMIG | Old Mutual investment-related entities (e.g. Old Mutual Investment Group) requiring theming decisions **[validate exact entities]** | [validate] |
| OMI | Referenced in secure/login journeys (OMI / OMF intersect) **[validate]** | [validate] |
| OMA | Old Mutual Africa **[validate]** — country/regional colleagues and resource gaps for migration | [validate] |
| WT | Wealth / "Wealth/WT" — Wealth business area requiring as-is migration review and possibly separate CI/platform treatment | [validate] |
| IA | Information Architecture — navigation containers, taxonomy, audience journeys | Confirmed |
| CI | Corporate Identity / brand identity (interim brand approved; full CI pending) | Confirmed |
| SEO | Search Engine Optimisation — not ready; treated as a blocking readiness item; SEO team needs ≥2 months lead time | Confirmed |
| NPS | Net Promoter Score — customer satisfaction metric | Confirmed |
| SSO | Single Sign-On — across secure web applications; nuanced differences between apps | Confirmed |
| QA / QAG | Quality Assurance / QA Gate (release stage before production) **[validate QAG expansion]** | [validate] |
| PGW | Referenced in go-live readiness ("PGW testing") **[validate expansion]** | [validate] |
| PI / PI2 / PI3 | Program Increment (SAFe-style delivery increments). Front-end resources exit after PI2; PI3 focuses on Contact Us + calculators | Confirmed |
| RAID | Risks, Assumptions, Issues, Dependencies log | Confirmed |
| MFC | Product stakeholder/segment whose sign-off EasiPlus depends on **[validate expansion]** | [validate] |
| LV | "LV demo pages" — referenced in execution controls **[validate expansion]** | [validate] |
| MVP | Minimum Viable Product | Confirmed |

## Systems, platforms & tools

| System | Role / context | Confidence |
| --- | --- | --- |
| Contentstack | New-world CMS / platform. Publishing can only begin once Contentstack dev is complete; most components do not yet exist in Contentstack and must be built/mapped | Confirmed |
| V2 | New-generation templates / pages on the new platform | Confirmed |
| Figma | Design tool; a Figma audit is required to identify existing/designed-but-unused/reusable components | Confirmed |
| Google Analytics | Existing analytics; does not track LLM-based search sources | Confirmed |
| Glassbox | Customer-experience monitoring tool to be replaced; new CX monitoring solution required | Confirmed |
| Tableau | Potential country reporting integration | Confirmed |
| Dynatrace | Site observability; must be reconfigured to track browser + server-side behaviour post-migration | Confirmed |
| Grafana | Dashboards referenced for observability | Confirmed |
| ServiceNow | Requires updates as part of go-live readiness | Confirmed |
| Google Sheet | Current manual page-migration tracker (URL status, template needs, content/image readiness, redirects) | Confirmed |
| LLM search (ChatGPT, Copilot) | New SEO/analytics visibility area not captured by traditional Google Analytics | Confirmed |

## Geographies / sites in scope (regional)

| Area | Notes | Confidence |
| --- | --- | --- |
| South Africa | SEO ownership/tooling clarification needed (SA + OMAR) | Confirmed |
| Namibia | Secure web migration + servicing transactions **at risk** (resource/confirmation dependencies) | Confirmed |
| Botswana | Only 1 of 9 servicing transaction capabilities complete; recovery plan needed | Confirmed |
| East Africa: Kenya, Uganda, Malawi, Eswatini | Navigation + page work. Kenya more complex (more products) | Confirmed |
| Ghana | Two customer journeys identified | Confirmed |
| Malawi & Eswatini | Two components outstanding; already live → migrate "as-is" with minimal updates | Confirmed |
| Old Mutual Alternative Investments | Separate website, **not** part of the OMAR/"Onkosa" domain — distinct migration considerations. "Onkosa" **[validate spelling/term]** | [validate] |
| Faoli Bank | Bank brand to be treated as a **separate entity** from Old Mutual, with its own information architecture and governance; bank-section pages (incl. personal loans) need ownership confirmation. Spelling **[validate — likely "OM Bank" / a specific bank brand]**. Supersedes the earlier unclear "Boerewors" placeholder for bank-page treatment | [validate] |

## Additional terms (from S2 / S3)

| Term | Meaning / context | Confidence |
| --- | --- | --- |
| Phased decommissioning | Turn off old-platform components progressively as they are migrated, rather than all at the end | Confirmed (proposed approach) |
| Side drawer (EasiPlus) | The EasiPlus product page is a unique "side drawer" entry point that runs the quote/calc (rates table behind it); unlike other journeys where "buy" sends the user into a separate buy chain | Confirmed |
| Tactical vs strategic scope | Framing of delivery options: a smaller "tactical" deliverable (e.g. navigation-only across sites) vs the full "strategic" transformation | Confirmed |
| TFSA | Tax-Free Savings Account product page — template approach (new vs existing) to be confirmed | Confirmed |
| Desk check | BA + designer validation against approved designs before QA | Confirmed |
| DoD (Definition of Done) | Completion criteria for design artifacts before approval (incl. SEO input) | Confirmed |
| Compositions / components / patterns / templates | Design-system taxonomy needing an alignment session on definitions & naming conventions | Confirmed (needs alignment) |
| IP / PI Sprint | Increment/sprint boundary at which new team structure & resources (e.g. Debs) join | Confirmed |

## Terms needing validation (consolidated)

- **"Boerewors" → Faoli Bank** — the earlier unclear "Boerewors" reference now maps to **Faoli Bank** (separate-brand treatment). Validate the actual bank brand name/spelling.
- **"Onkosa" domain** — spelling/meaning unclear.
- Several acronym expansions above marked **[validate]**.
- **Named individual surnames** (Megan, Marlana, Joanne, Orisha, André; "Kash [surname unclear]") — validate.
- **"Amy" / "Mary"** in S3 transcript — likely transcription artefacts; validate.
