0603(1)
More options
Gareth Bew
Today at 8:06 am
3 hr 49 min

copy summary
Summary
Transcript

Template:
General
Overview
More options
The meeting focused on the migration of the KOSA website, emphasizing the need for a clear definition of done and the distinction between product-related and miscellaneous pages. The team discussed the potential for two different visual treatments: new designs for product pages and existing styles for other sections. They highlighted the importance of content audits, redirects, and analytics integration. The discussion also covered the need for a standardized testing framework, DevOps pipelines, and observability tools. The team agreed on the importance of stakeholder approval and a clear process for deployment and decommissioning of old infrastructure. The meeting focused on the challenges of managing and migrating web pages, particularly the issue of duplicate content and navigation. Bernice highlighted that there are 1530 pages to be managed, with specific counts for different sections: 410 in personal, 521 in corporate, 5067 in business, 35 in careers, and 412 in wealth. The team discussed the need for new templates, the importance of SEO and analytics, and the potential use of AI to streamline content management. Gareth Bew emphasized the necessity of a solid approach for secure web migration and the impact of resource constraints on the project timeline. The meeting focused on the need to reorganize the service tree and change dashboards, addressing three major issues: secure sites, portal convergence, and service access. Key points included the importance of a robust design system, single sign-on (SSO), and the impact of changing URLs on e-commerce campaigns. The cross-channel solutions team is evolving from front-end delivery to backend enablement, with a focus on calculators and product pages. Specific metrics highlighted were a 45% conversion rate for a funeral product page and the need for careful handling of URL changes to avoid impacting marketing campaigns.


Shorter

Bullet point

Longer


Action Items
More options
This list can be reordered. To drag an action item, press space or enter on the drag handle. Use the up and down arrow keys to move the action item. To drop the item, press space or enter again. To cancel drag and drop, press escape.


Own and drive the content audit and consolidation for all site URLs (identify pages to keep, consolidate, delete; produce consolidated list and recommended actions for each URL) and play back to stakeholders







Provide an updated quantification and breakdown of required redirects (current redirects, new redirects to add, and rough effort estimate) to inform migration planning







Draft an approach for handling 'migrate as-is' vs 'new treatment' pages including data checks, risk calls, suggested migration states, and acceptance criteria for moving pages as-is







Set up a meeting with Omar (and relevant segment owners) to confirm publishing scope, responsibilities for publishing/migrating their content, and whether Omar will manage ongoing publishing post-migration







Onboard Daniel and define the AI-assisted automated test specifications and the rules/skills for creating repeatable automated tests for deployment pipelines







Enable pipeline gates and produce an adoption plan (turn on CI/CD gates, test harness adoption, and enforcement rules for design-system usage and test coverage)







Define analytics tagging fields and naming conventions to be added to Content Stack (specify required tracking fields per component so analytics can be managed in the CMS)







Document the decommission approval process and required stakeholder sign-offs for switching off legacy infrastructure after migration







Provide an image/assets repository (Storybook or similar) and enable access so content publishers can download approved, pre-sized images for pages







Review the calculators and product pages with the publishing team, confirm which calculator and product pages are already migrated to v2, and confirm owners for any calculators without clear owners







Engage the SEO vendor and schedule SEO review support to start approximately two months before QA (confirm scope, tooling and timing for SEO tagging and migration impact)







Enable and communicate front-end design requirement: ensure Figma designs are labelled with design-system component IDs so developers and automation can map Figma -> Design System -> Content Stack






Add action item

Insights
New insight
More options
Outline
More options
Defining the Flow and Responsibilities


•
Gareth Bew emphasizes the need for a clear flow of responsibilities, highlighting the importance of peer handoffs and understanding the overlap between different areas.


•
Speaker 1 discusses the definition of done from a program management perspective, focusing on the migration of product-related information and the treatment of miscellaneous pages like careers and about us.


•
Speaker 2 mentions the possibility of migrating the site without the new changes, which would result in a different look for certain pages.


•
Bernice questions the definition of "as is" and how it affects the migration process, while Speaker 3 and Speaker 4 discuss the differences in page styles and the potential for anxiety if changes are made.


Structural Changes and Migration Timing


•
Justin introduces the idea of focusing on structural changes and the timing of the migration, suggesting that the site might look different in 2027 and 2028.


•
Bernice and Justin discuss the need to optimize and the potential for two different looks within the same website.


•
Speaker 5 and Bernice agree on the need to have two different looks, with some pages remaining unchanged and others receiving new treatments.


•
The team debates the appetite for structural changes and the capacity to implement them within the given timeframe.


Consolidation and Redesign Decisions


•
Bernice and Justin discuss the need to consolidate pages and the potential for redesigning certain sections.


•
Speaker 5 and Bernice agree on the need to have a clear approach to deciding which pages to consolidate and which to redesign.


•
The team discusses the importance of stakeholder approval and the need to ensure that the new structure meets business requirements.


•
Justin emphasizes the need to balance the scope of the migration with the available resources and the need for a clear decision-making process.


Content Audit and Redirects


•
Gareth Bew and Justin discuss the importance of a content audit to determine which pages can be consolidated and which need to be redesigned.


•
Bernice highlights the need to manage redirects for pages that are being moved or deleted, estimating the need for around 1530 new redirects.


•
The team discusses the challenges of maintaining redirects and the impact on SEO, with Bernice emphasizing the need for manual updates to in-page links.


•
Justin suggests defining a clear approach to managing redirects and ensuring that the new structure is SEO-friendly.


Design System and Component Management


•
Speaker 17 discusses the need for a design system that includes components labeled in Figma and Content Stack, ensuring consistency across different platforms.


•
Bernice and Speaker 2 highlight the need for a clear naming convention for components to facilitate tracking and management.


•
The team discusses the importance of automating the process of updating components and ensuring that they are correctly implemented in both Figma and Content Stack.


•
Justin emphasizes the need for a clear approach to managing components and ensuring that the design system is scalable and maintainable.


Testing and Deployment Frameworks


•
Speaker 1 introduces the idea of using a testing framework to automate regression testing and ensure that deployments are repeatable.


•
The team discusses the need for DevOps pipelines to enforce standards and ensure that deployments are compliant with the design system.


•
Justin emphasizes the importance of having a clear process for testing and deployment, including the use of AI-assisted development to automate repetitive tasks.


•
The team discusses the need for a standardized approach to testing and deployment, ensuring that all teams follow the same processes.


Observability and Monitoring


•
Speaker 1 discusses the importance of observability for monitoring the functionality of the site, including the use of dynamic tracing and Grafana dashboards.


•
The team discusses the need for a standardized approach to monitoring, ensuring that all sites have the necessary tools to track errors and performance issues.


•
Justin emphasizes the importance of having a clear process for monitoring and ensuring that all teams are aware of the tools and processes in place.


•
The team discusses the need for a clear approach to monitoring and ensuring that all sites are compliant with the required standards.


Analytics and Content Integration


•
Speaker 1 discusses the importance of integrating analytics with content, ensuring that tracking information is dynamically updated as content changes.


•
The team discusses the need for a clear approach to managing analytics and ensuring that all teams are aware of the tools and processes in place.


•
Justin emphasizes the importance of having a clear process for managing analytics and ensuring that all sites are compliant with the required standards.


•
The team discusses the need for a standardized approach to managing analytics and ensuring that all teams follow the same processes.


Sequencing and Deployment


•
Speaker 1 discusses the need for a clear sequence for deployment, including the use of staging environments and beta testing.


•
The team discusses the importance of stakeholder engagement and ensuring that all stakeholders are aware of the deployment process and the expected outcomes.


•
Justin emphasizes the need for a clear process for deployment, ensuring that all teams are aware of the tools and processes in place.


•
The team discusses the need for a standardized approach to deployment, ensuring that all sites are compliant with the required standards.


Approval and Handover Processes


•
Justin discusses the need for a clear approval process for moving between different environments, including development, QA, and production.


•
The team discusses the importance of having a clear handover process for stakeholders, ensuring that all stakeholders are aware of the expected outcomes and the deployment process.


•
Speaker 1 emphasizes the need for a clear process for approval and handover, ensuring that all teams are aware of the tools and processes in place.


•
The team discusses the need for a standardized approach to approval and handover, ensuring that all sites are compliant with the required standards.


Duplicate Pages and Navigation Issues


•
Justin discusses the issue of duplicate pages and the need to consolidate content.


•
Bernice mentions that AI can help identify duplicate pages.


•
Kameshnee notes that different results are being obtained.


•
Justin explains the focus on navigation links and the impact on primary navigation.


•
Natalie provides a breakdown of page counts across different sections.


Page Type and URL Management


•
Natalie suggests defining labels for different types of pages.


•
Bernice emphasizes the importance of deciding whether to keep or delete certain pages.


•
Justin mentions the inclusion of PDFs in the content management.


•
Gareth Bew and Seba discuss the consolidation of fact sheets into one page.


•
The team discusses the technical aspects of URL management and the need for a clear process flow.


Content Stack and Image Management


•
Bernice explains the current process of uploading images to Content Stack.


•
Justin and Bernice discuss the need for two images (desktop and mobile) for better performance.


•
Kameshnee suggests adding a field for mobile images in Content Stack.


•
Justin and Bernice discuss the challenges of resizing images and the need for a standardized approach.


•
The team considers the impact of new templates on page building times.


Resource Constraints and Publishing Challenges


•
Bernice outlines the current publishing process and the need for new templates and components.


•
Gareth Bew highlights the resource constraints and the need for a clear roadmap.


•
Bernice mentions the importance of having all assets and URLs ready before starting the publishing process.


•
The team discusses the impact of new templates on page building times and the need for a more efficient process.


•
Natalie and Bernice discuss the need for a clear definition of done for each page.


Content Audit and Decommissioning


•
Gareth Bew emphasizes the need for a content audit to determine which pages to keep, delete, or redesign.


•
Bernice mentions the difficulty in getting responses from page owners to determine the status of pages.


•
The team discusses the importance of knowing which URLs belong to which areas for better decision-making.


•
Natalie suggests using analytics to identify low-traffic pages for decommissioning.


•
Bernice highlights the need for a clear process for switching off and deleting pages.


SEO and Analytics Integration


•
Gareth Bew discusses the need for SEO and analytics integration in the new platform.


•
Speaker 6 mentions the use of LLMs (Language Learning Models) for search and the need to adapt to new search behaviors.


•
The team discusses the integration of SEO tools and the need for guidance from experts.


•
Gareth Bew emphasizes the importance of understanding customer experience and using tools like Tableau for data reporting.


•
The team discusses the need for a pen test and security approvals before going live.


Omar and East Africa Dependencies


•
Speaker 6 highlights the dependencies on Omar and East Africa for the new platform.


•
The team discusses the challenges of migrating secure sites and the need for additional resources.


•
Bernice mentions the need for a clear plan for publishing and updating content on Omar.


•
The team discusses the importance of coordinating with other regions to ensure a smooth migration.


•
Gareth Bew emphasizes the need for a solid approach to secure web migration.


Resourcing and Capacity Constraints


•
Gareth Bew highlights the under-resourcing in every front and the need for a comprehensive approach.


•
Justin and Bernice discuss the impact of resourcing constraints on the project timeline.


•
The team considers the need for additional capacity and the importance of prioritizing tasks.


•
Natalie suggests having realistic conversations about resource needs and potential solutions.


•
Gareth Bew emphasizes the importance of not letting capacity constraints determine the project's design.


Information Architecture and Governance


•
Justin raises concerns about the governance of information architecture and the need for a clear approach.


•
Bernice mentions the need for a decision on who will manage the content under the "bank" section.


•
The team discusses the importance of defining the information architecture for different tenants.


•
Justin emphasizes the need for a clear process for managing content and URLs across different sections.


•
The team considers the impact of new templates on the overall information architecture.


Final Comments and Next Steps


•
Gareth Bew wraps up the meeting and emphasizes the need for a solid approach to secure web migration.


•
The team discusses the importance of addressing resource constraints and capacity issues.


•
Bernice mentions the need for a clear plan for publishing and updating content.


•
The team considers the impact of new templates on page building times and the need for a more efficient process.


•
Gareth Bew emphasizes the importance of coordinating with other regions and ensuring a smooth migration.


Organizational Challenges and Service Tree Reorganization


•
Speaker 22 discusses the need to reorganize the service tree and change dashboards, noting that the service team has not solved this problem for years.


•
Speaker 23 questions the level of reorganization expected, and Seba confirms it is a significant issue.


•
Speaker 22 raises concerns about secure sites and the convergence of portals, questioning their integration into the platform.


•
Bernice and Speaker 21 emphasize the need for an approach and decisions to understand what needs to be solved first.


Technical and Infrastructure Constraints


•
Gareth Bew and Speaker 6 discuss the technical constraints of secure web sites and their integration into the infrastructure.


•
Speaker 6 mentions the need for single sign-on (SSO) and the challenges of breaking out of secure environments.


•
Gareth Bew highlights the importance of customer expectations and the need for a consistent presentation layer across applications.


•
Justin and Gareth Bew discuss the nuances of different apps and the need for a common design system.


Customer Expectations and Omnichannel Engagement


•
Gareth Bew explains the modern customer's expectation of having all their information in one place and the importance of omnichannel engagement.


•
Speaker 29 joins the meeting, and Gareth Bew relocates the camera and computer for better visibility.


•
Gareth Bew reiterates the importance of understanding scope, resourcing constraints, and the roadmap for migration.


•
Wayne provides context on the cross-channel solutions team and their responsibilities, differentiating them from the life and savings team.


Cross-Channel Solutions and Dependencies


•
Wayne explains the cross-channel solutions team's role in enabling capabilities across different digital platforms.


•
Gareth Bew asks Wayne to present his schedule of work, dependencies, and constraints to understand the delivery framework.


•
Wayne highlights the evolving role of the cross-channel solutions team from front-end delivery to backend enablement.


•
Wayne mentions the impact of business analysis capacity and the additional scope of work for the contact us piece.


Easy Plus Sales Journey and Product Pages


•
Wayne discusses the Easy Plus sales journey, a unique product page that starts on the public web and transitions to the buy journey.


•
Speaker 6 and Wayne discuss the challenges of the Easy Plus product page, including its high conversion rate and the need for careful changes.


•
Bernice asks for clarification on which pages are being built with the new template and which ones are already done.


•
Wayne confirms the need to work closely together to ensure all calculators are completed and the product pages are migrated correctly.


Tracking and Analytics Considerations


•
Wayne raises the issue of tracking analytics, specifically Google Analytics, and the impact of changing URLs.


•
Bernice acknowledges the need to work with the e-commerce team to ensure tracking is updated.


•
Keshi mentions the need to discuss additional calculator frames and their ownership.


•
Wayne and Keshi agree to start discussions with their teams to determine the best approach for handling these calculators.


Expert
More options
Meeting Notes: Website Migration Discovery Session
Date: June 3, 2026
Meeting Title: 0603(1) - Website Migration Process Flow Workshop
Purpose: Define end-to-end migration process, dependencies, and delivery approach for website transformation
Duration: Full day workshop session

Executive Summary
• Major Discovery: Website migration is significantly more complex than initially scoped, with 1,530+ pages requiring migration across multiple workstreams • Critical Resource Constraint: Publishing team severely under-resourced with only 2 publishers to handle entire migration plus BAU operations • URL Management Crisis: All URLs changing, requiring 1,500+ redirects with major SEO impact and complex redirect management • Template Dependency: New page builds cannot start until templates and components are complete in ContentStack • Timeline Risk: Current estimates suggest 4-6 months for publishing alone, creating significant delivery risk for November deadline • Scope Clarification Needed: Urgent decisions required on which pages get new treatment vs. moved "as-is" • Cross-team Dependencies: Heavy interdependencies between Design System, Content, Publishing, and Execution teams • Omar Markets Challenge: No dedicated publishers in international markets, creating additional resource pressure

Key Discussion Themes
Migration Scope and Page Treatment
Current State: 1,530 pages identified for migration (excluding Wealth section)
Treatment Options: New template pages (2 hours each) vs. "as-is" moves (30 minutes each)
Content Audit Required: Page-by-page decisions needed on keep/consolidate/delete/redesign
About Us Example: 35 pages under About Us section requiring individual assessment
Analytics-Based Decisions: Low-traffic pages identified for potential deletion (some with only 12 views in 6 months)
Resource Constraints Across All Workstreams
Publishing: 2 people managing 14 sites plus migration
Design System: Limited capacity for component development
Content: Shared resources between content audit and publishing
International Markets: Namibia and Botswana identified as high-risk due to limited resources
Technical Infrastructure and Dependencies
URL Structure: Complete restructuring required, affecting all downstream systems
Analytics Integration: Decision needed on ContentStack vs. browser-based tracking
Image Management: New requirement for desktop and mobile image versions
Redirect Management: 3,200+ existing redirects to be cleaned up, 1,500+ new ones required
Design and Component Dependencies
Template Development: Red zone (header/nav/footer) vs. green zone (content areas) approach
Component Naming: Consistency required across Figma, Design System, and ContentStack
Asset Management: Image repository and resizing processes need definition
Decisions Made
Decision	Owner	Impact	Status
Page treatment approach needed (new vs. as-is)	Content team	Determines publishing timeline	Pending
URL structure mapping required before any publishing	Bernice	Blocks all page migration	Confirmed
Two-image approach (desktop/mobile) for components	Design System	Additional fields needed in ContentStack	Agreed
Content audit to be conducted section by section	Justin (Content)	Determines final page count	Confirmed
SEO agency engagement for 2-month support period	Nitin	External support secured	Confirmed
Action Register
Action	Owner	Due Date	Priority	Status
Define approach for "as-is" vs. new page treatment	Content team	Not confirmed	Critical	New
Complete URL structure mapping and redirect plan	Bernice	Not confirmed	Critical	New
Conduct comprehensive content audit by section	Justin	Not confirmed	High	New
Confirm publishing resource allocation/additional support	Management	Not confirmed	Critical	New
Define analytics approach (ContentStack vs. browser)	Technical team	Not confirmed	High	New
Establish component naming conventions across tools	Design System	Not confirmed	Medium	New
Engage with international markets on publishing support	Nitin	Not confirmed	High	New
Clarify Old Mutual Bank scope and ownership	Not confirmed	Not confirmed	Medium	New
Risks
Risk	Impact	Owner	Mitigation Required
Publishing timeline exceeds November deadline	High - Programme failure	Bernice/Management	Additional resources or scope reduction
URL changes cause significant SEO ranking loss	High - Business impact	SEO agency/Bernice	Professional SEO support engaged
International markets cannot complete migration	Medium - Partial delivery	Nitin	Resource allocation or timeline adjustment
Content audit reveals more consolidation work	Medium - Timeline impact	Justin	Early engagement and decision-making
Template dependencies delay all downstream work	High - Programme delay	Design System team	Prioritize foundation templates
Issues
Issue	Impact	Owner	Next Step
Publishing team capacity severely constrained	Critical	Management	Immediate resource planning
No dedicated publishers in international markets	High	Omar markets	Define support model
3,200+ existing redirects need cleanup	Medium	Bernice	Systematic cleanup plan
Component development blockers	Medium	Design System	Foundation work prioritization
Dependencies
Dependency	From	To	Blocker?
URL structure completion	All publishing	Content team	Yes
Template availability	Publishing	Design System	Yes
Content audit completion	Template design	Content team	Yes
Component naming standards	Development	Design System	No
International market resource confirmation	Global timeline	Management	Yes
Assumptions
SEO rankings will drop temporarily during migration regardless of redirect strategy
Current 2-hour estimate for new pages is conservative and may increase initially
International markets can provide some local development support
ContentStack can accommodate required new field structures
November deadline is non-negotiable
Additional publishing resources can be secured if business case is made
Stakeholder Positions
Bernice (Publishing Lead): Extremely concerned about timeline feasibility with current resources; needs clear scope decisions urgently

Justin (Content): Committed to content audit approach but concerned about timeline dependencies

Design System Team: Focused on quality foundation templates; concerned about downstream capacity constraints

Nitin (Operations): Supportive of additional external support; realistic about international market challenges

Management: Need clearer options on scope vs. timeline vs. resources trade-offs

Open Questions
What is the final decision on page treatment approach (new vs. as-is percentages)?
Can additional publishing resources be secured for the migration period?
How will international markets handle publishing if no local resources available?
What is the acceptable timeline extension if scope cannot be reduced?
Should Old Mutual Bank section be included in this migration or handled separately?
What is the final analytics tracking approach decision?
How will dual site maintenance be handled during transition period?
Parking Lot
Advanced AI-assisted publishing automation
Long-term image repository strategy
Secure web integration approach
Post-migration optimization planning
Customer experience monitoring tools implementation
Tableau integration requirements
Next Steps
Immediate (This Week): Content team to define page treatment approach and present options
Urgent (Next Week): Complete URL structure mapping for priority sections
Critical (Within 2 Weeks): Secure additional publishing resources or revise timeline
High Priority: Begin content audit for Personal section as pilot
Medium Priority: Establish component naming conventions workshop
Ongoing: Weekly international market check-ins on resource availability
Strategic: Present scope/timeline/resource options to executive leadership
Operational: Set up SEO agency engagement and monitoring
Technical: Finalize analytics approach and ContentStack field requirements
Governance: Establish weekly migration progress review cadence
Next Meeting: Continue with remaining workstream reviews and consolidated roadmap development.

