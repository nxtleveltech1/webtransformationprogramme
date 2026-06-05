# MASTER DEV PROMPT: Build Full OpenAI AI Platform Scaffolding Into Existing Platform

## 1. Mission

You are a senior multi-agent software engineering team responsible for implementing a complete, production-grade OpenAI AI platform scaffolding into the existing application.

This must not be a simple chatbot, isolated API call, or decorative AI widget.

The objective is to build a governed, scalable, secure, auditable, extensible AI capability layer that can support:

* AI assistants
* Agent workflows
* Multi-agent orchestration
* RAG / document intelligence
* Tool execution
* Structured outputs
* Workflow automation
* Human approval gates
* AI audit logging
* Usage and cost tracking
* Prompt management
* Model management
* Evaluation and regression testing
* Admin governance
* Future voice/realtime capability

The final implementation must integrate cleanly with the existing platform architecture, authentication model, authorization model, database layer, frontend framework, deployment structure, and coding standards.

---

## 2. Critical First Instruction

Before writing or changing code, inspect the existing codebase.

You must identify and document:

* Framework and runtime
* Application structure
* Routing model
* Frontend framework
* Backend/API structure
* Database technology
* ORM/query layer
* Authentication provider
* Authorization/RBAC model
* Existing user/tenant model
* Existing project/workflow modules
* Existing environment variable patterns
* Existing logging patterns
* Existing error-handling patterns
* Existing testing framework
* Existing lint/type/build commands
* Existing UI component system
* Existing design system
* Existing admin/settings structure
* Existing integration patterns
* Existing deployment assumptions

Do not assume the stack. Detect it from the repository.

If the repository uses Next.js, React, TypeScript, Tailwind, shadcn/ui, Prisma, Neon, Clerk, Better Auth, Supabase, or any other technologies, adapt to the actual implementation. Do not force a stack that is not present.

If the codebase contains no existing AI layer, create a clean modular AI foundation.

If an AI layer already exists, audit it, preserve what works, remove duplication, and extend it properly.

---

## 3. OpenAI Implementation Direction

Use OpenAI as a server-side platform capability.

Do not call OpenAI directly from frontend components.

Do not expose OpenAI API keys to the browser.

Do not scatter OpenAI API calls across random route handlers, components, hooks, or utilities.

All OpenAI interactions must flow through a controlled AI Gateway.

Preferred OpenAI platform approach:

* Use the OpenAI Responses API for new model interactions.
* Use Structured Outputs for application-bound JSON responses.
* Use OpenAI tool/function calling where appropriate.
* Use OpenAI built-in tools such as file search and web search only through governed server-side capability layers.
* Use OpenAI Agents SDK where agent orchestration, tool usage, handoffs, and multi-step workflows are required.
* Use the Realtime API only in a later phase if voice or live assistant capability is required.
* Use official OpenAI SDKs.
* Use official OpenAI documentation and Context7 MCP for current implementation guidance where available.

Do not use deprecated or legacy patterns unless the existing platform already depends on them and a migration path is documented.

---

## 4. Non-Negotiable Architecture Rule

The AI platform must follow this high-level architecture:

```text
Frontend UI
  ↓
Server-side API routes / server actions
  ↓
AI Gateway
  ↓
Prompt Registry + Model Registry + Guardrails
  ↓
Agent Runtime / RAG Layer / Tool Registry
  ↓
Application Services / Database / Integrations
  ↓
Audit Logs / Usage Logs / Cost Logs / Evaluation Logs
```

The AI Gateway is the only approved layer allowed to call OpenAI.

---

## 5. Multi-Agent Team Structure

Operate as the following specialist agents.

---

### Agent 1: Repository Audit Agent

Responsibilities:

* Inspect the repository.
* Identify architecture, stack, patterns, risks, and integration points.
* Identify existing AI-related code.
* Identify where the new AI platform layer should live.
* Identify which files should be added, modified, or avoided.
* Identify build/test commands.

Output required:

* Repository audit summary
* Existing architecture map
* AI integration opportunities
* Existing constraints
* Risk list
* Recommended implementation structure

---

### Agent 2: AI Platform Architect

Responsibilities:

* Design the full AI platform architecture.
* Define AI Gateway.
* Define model registry.
* Define prompt registry.
* Define agent runtime.
* Define tool registry.
* Define RAG/document intelligence layer.
* Define guardrails.
* Define approval gates.
* Define usage and cost tracking.
* Define audit model.
* Define evaluation framework.

Output required:

* AI architecture summary
* Package/folder structure
* Data flow
* Security model
* AI capability map
* Implementation roadmap

---

### Agent 3: Backend / API Engineer

Responsibilities:

* Implement server-side AI routes.
* Implement AI Gateway.
* Implement OpenAI client wrapper.
* Implement structured output handling.
* Implement DTOs and schemas.
* Implement service/adaptor layers.
* Implement database persistence for AI runs, prompts, agents, tools, approvals, usage, and audit logs.
* Ensure all routes are authenticated and permission-aware.

Output required:

* Server-side AI implementation
* Typed APIs
* Validation schemas
* Error handling
* Database schema/migrations where applicable
* Backend integration notes

---

### Agent 4: Agent Runtime Engineer

Responsibilities:

* Implement agent orchestration.
* Implement agent definitions.
* Implement multi-step agent runs.
* Implement agent step tracking.
* Implement agent handoffs.
* Implement approval-gated execution.
* Implement retry/failure handling.
* Implement agent trace persistence.

Required agents:

* Orchestrator Agent
* Planner Agent
* Research Agent
* Analyst Agent
* Project Management Agent
* Documentation Agent
* QA Agent
* Security Review Agent
* Approval Agent

Output required:

* Agent runtime
* Agent definitions
* Agent run model
* Agent trace model
* Handoff policy
* Error/retry policy

---

### Agent 5: RAG / Knowledge Engineer

Responsibilities:

* Implement document intelligence and retrieval scaffolding.
* Create an abstraction over vector storage.
* Support OpenAI File Search if appropriate.
* Prepare for future pgvector or other vector-store implementation if needed.
* Ensure retrieval is tenant-aware, permission-aware, and auditable.
* Implement citation support.
* Implement document ingestion scaffolding.

Output required:

* Knowledge base model
* Document ingestion flow
* Retrieval service
* Citation builder
* Vector-store adapter
* Document permission policy
* RAG integration notes

---

### Agent 6: Security / Governance Engineer

Responsibilities:

* Ensure AI features respect authentication and authorization.
* Enforce tenant/user/role context.
* Prevent unauthorized tool use.
* Add human approval gates for risky operations.
* Implement audit logging.
* Ensure no secrets are exposed.
* Ensure prompt injection and unsafe tool execution risks are mitigated.
* Ensure AI-generated writes are permission-gated.
* Ensure sensitive outputs are not logged carelessly.

Output required:

* AI permission model
* Tool risk matrix
* Approval gate model
* Audit model
* Security review notes
* Guardrail implementation

---

### Agent 7: Frontend / UX Engineer

Responsibilities:

* Build AI UI surfaces using the existing design system.
* Add AI Command Centre.
* Add agent run viewer.
* Add knowledge base UI.
* Add prompt management UI.
* Add model management UI.
* Add tool governance UI.
* Add usage/cost dashboard.
* Add approval queue UI.
* Add AI settings/admin pages.
* Ensure responsive and accessible design.

Output required:

* AI UI routes/pages/components
* Admin AI console
* AI assistant interface
* Agent trace viewer
* Knowledge base management UI
* Prompt and tool governance UI
* Accessibility notes

---

### Agent 8: QA / Testing Agent

Responsibilities:

* Add or update tests.
* Validate build.
* Validate types.
* Validate lint.
* Validate route rendering.
* Validate API route behaviour.
* Validate permission-gated behaviour.
* Validate structured outputs.
* Validate error states.
* Validate loading states.
* Validate empty states.
* Validate accessibility basics.
* Validate no OpenAI keys are exposed client-side.

Output required:

* Test implementation
* Validation report
* Manual QA checklist
* Known issues
* Follow-up test backlog

---

### Agent 9: Documentation Agent

Responsibilities:

* Document the full AI scaffolding.
* Document architecture decisions.
* Document environment variables.
* Document routes.
* Document services.
* Document database changes.
* Document security model.
* Document AI governance.
* Document prompt registry.
* Document model registry.
* Document agent runtime.
* Document tool registry.
* Document RAG layer.
* Document testing and validation.

Output required:

* AI implementation guide
* Developer handover
* Admin guide
* Security/governance guide
* Known limitations
* Follow-up backlog

---

## 6. Required AI Platform Capabilities

Implement or scaffold the following capabilities.

---

### 6.1 AI Gateway

Create a central AI Gateway.

Responsibilities:

* Own all OpenAI calls.
* Enforce server-only execution.
* Resolve authenticated user.
* Resolve tenant/context.
* Resolve permissions.
* Select approved model.
* Render approved prompt.
* Apply guardrails.
* Execute AI request.
* Validate structured output.
* Execute tool calls only through the Tool Registry.
* Log AI run.
* Log usage.
* Log costs where possible.
* Log errors.
* Return typed response.
* Prevent direct OpenAI access outside this layer.

Expected location, adapted to repo:

```text
packages/ai/src/gateway/aiGateway.ts
```

or, if no packages structure exists:

```text
src/lib/ai/gateway/aiGateway.ts
```

Required interfaces:

```ts
export type AiCapability =
  | "assistant.chat"
  | "project.summary"
  | "meeting.extractActions"
  | "raid.analyse"
  | "document.query"
  | "document.summarise"
  | "report.generate"
  | "agent.run"
  | "workflow.recommend"
  | "tool.execute";

export interface AiGatewayRequest<TInput = unknown> {
  tenantId: string;
  userId: string;
  roleIds: string[];
  capability: AiCapability;
  input: TInput;
  context?: AiExecutionContext;
  requireApproval?: boolean;
}

export interface AiGatewayResponse<TOutput = unknown> {
  runId: string;
  output: TOutput;
  model: string;
  status: "completed" | "failed" | "requires_approval";
  usage?: AiUsage;
  citations?: AiCitation[];
  safety?: AiSafetyResult;
  toolCalls?: AiToolCall[];
  error?: AiError;
}
```

---

### 6.2 OpenAI Client Wrapper

Create a single OpenAI client wrapper.

Responsibilities:

* Initialize official OpenAI SDK.
* Validate required environment variables.
* Keep API key server-side.
* Prevent accidental client import.
* Normalize OpenAI errors.
* Support streaming where appropriate.
* Support structured outputs.
* Support tool usage.
* Support future model/provider abstraction.

Expected file:

```text
packages/ai/src/client/openaiClient.ts
```

Required environment variables:

```env
OPENAI_API_KEY=
OPENAI_DEFAULT_MODEL=
OPENAI_FAST_MODEL=
OPENAI_REASONING_MODEL=
OPENAI_EMBEDDING_MODEL=
OPENAI_ORG_ID=
OPENAI_PROJECT_ID=
AI_FEATURES_ENABLED=true
AI_LOG_LEVEL=info
AI_MAX_TOKENS_PER_REQUEST=
AI_DAILY_COST_LIMIT=
AI_REQUIRE_APPROVAL_FOR_WRITES=true
```

Only include variables actually required by the implementation. Add missing ones to `.env.example`. Do not commit real secrets.

---

### 6.3 Model Registry

Create a model registry. Do not hardcode model names across the application.

Expected file:

```text
packages/ai/src/models/modelRegistry.ts
```

The registry must map business capabilities to approved models.

Example structure:

```ts
export interface AiModelDefinition {
  id: string;
  provider: "openai";
  model: string;
  purpose: string;
  reasoningEffort?: "low" | "medium" | "high";
  supportsStructuredOutputs?: boolean;
  supportsTools?: boolean;
  supportsVision?: boolean;
  supportsAudio?: boolean;
  maxInputTokens?: number;
  enabled: boolean;
}

export const AI_MODEL_REGISTRY: Record<string, AiModelDefinition> = {
  fastAssistant: {
    id: "fastAssistant",
    provider: "openai",
    model: process.env.OPENAI_FAST_MODEL ?? "gpt-4.1-mini",
    purpose: "Fast general assistant responses",
    supportsStructuredOutputs: true,
    supportsTools: true,
    enabled: true,
  },
  reasoning: {
    id: "reasoning",
    provider: "openai",
    model: process.env.OPENAI_REASONING_MODEL ?? "gpt-4.1",
    purpose: "Complex reasoning, analysis, planning, and review",
    supportsStructuredOutputs: true,
    supportsTools: true,
    enabled: true,
  },
};
```

Adapt model names to current official OpenAI documentation and environment configuration. Do not invent unsupported model names.

---

### 6.4 Prompt Registry

Create a prompt registry with versioning.

Expected files:

```text
packages/ai/src/prompts/promptRegistry.ts
packages/ai/src/prompts/promptRenderer.ts
packages/ai/src/prompts/systemPrompts.ts
```

Prompt definition:

```ts
export interface PromptDefinition {
  id: string;
  name: string;
  version: string;
  owner: string;
  description: string;
  system: string;
  constraints: string[];
  allowedTools?: string[];
  outputSchemaId?: string;
  requiresHumanApproval?: boolean;
  status: "draft" | "active" | "deprecated";
}
```

Required prompts:

* Platform Assistant
* Project Summary
* Meeting Notes to Actions
* RAID Analysis
* Risk Extraction
* Issue Extraction
* Decision Extraction
* Steering Committee Report
* Document Summary
* Document Q&A
* Workflow Recommendation
* QA Review
* Security Review

Rules:

* Do not hardcode large prompts inside API routes.
* Do not duplicate prompts.
* Support versioning.
* Support prompt testing in admin UI where practical.
* Include prompt status: draft, active, deprecated.
* Include owner and description.

---

### 6.5 Structured Outputs

Use structured outputs for any AI response that feeds application logic, database writes, workflows, reports, or UI components.

Create schema files:

```text
packages/ai/src/schemas/projectSummary.schema.ts
packages/ai/src/schemas/actionExtraction.schema.ts
packages/ai/src/schemas/raidAnalysis.schema.ts
packages/ai/src/schemas/riskExtraction.schema.ts
packages/ai/src/schemas/issueExtraction.schema.ts
packages/ai/src/schemas/decisionExtraction.schema.ts
packages/ai/src/schemas/reportGeneration.schema.ts
packages/ai/src/schemas/documentSummary.schema.ts
```

Use the existing validation library if present. Prefer Zod if the project already uses it.

Example schema:

```ts
export const AiActionExtractionSchema = z.object({
  summary: z.string(),
  actions: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]),
      relatedProject: z.string().optional(),
      relatedWorkstream: z.string().optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
  risks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      likelihood: z.enum(["low", "medium", "high", "critical"]),
      impact: z.enum(["low", "medium", "high", "critical"]),
      mitigation: z.string().optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
  issues: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      owner: z.string().optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
  decisions: z.array(
    z.object({
      title: z.string(),
      decision: z.string(),
      rationale: z.string().optional(),
      owner: z.string().optional(),
      confidence: z.number().min(0).max(1),
    })
  ),
});
```

---

### 6.6 Agent Runtime

Create an agent runtime capable of executing multi-step workflows.

Expected files:

```text
packages/agents/src/runtime/agentRuntime.ts
packages/agents/src/runtime/agentOrchestrator.ts
packages/agents/src/runtime/agentRunState.ts
packages/agents/src/agents/orchestratorAgent.ts
packages/agents/src/agents/plannerAgent.ts
packages/agents/src/agents/researchAgent.ts
packages/agents/src/agents/analystAgent.ts
packages/agents/src/agents/projectManagerAgent.ts
packages/agents/src/agents/documentationAgent.ts
packages/agents/src/agents/qaAgent.ts
packages/agents/src/agents/securityAgent.ts
packages/agents/src/approvals/approvalGate.ts
```

Required agent types:

```ts
export type AgentId =
  | "orchestrator"
  | "planner"
  | "researcher"
  | "analyst"
  | "projectManager"
  | "documentation"
  | "qa"
  | "security"
  | "approval";
```

Required agent run statuses:

```ts
export type AgentRunStatus =
  | "queued"
  | "running"
  | "requires_approval"
  | "completed"
  | "failed"
  | "cancelled";
```

The runtime must support:

* Multi-step runs
* Agent handoffs
* Tool calls
* Human approval gates
* Retry handling
* Failure logging
* Cancellation
* Trace persistence
* Permission-aware execution

Do not create one giant agent that does everything.

---

### 6.7 Tool Registry

Create a governed tool registry.

Expected files:

```text
packages/tools/src/registry/toolRegistry.ts
packages/tools/src/types.ts
packages/tools/src/project/createTask.tool.ts
packages/tools/src/project/createRisk.tool.ts
packages/tools/src/project/createIssue.tool.ts
packages/tools/src/project/createDecision.tool.ts
packages/tools/src/project/createChangeRequest.tool.ts
packages/tools/src/documents/searchDocuments.tool.ts
packages/tools/src/reporting/generateStatusReport.tool.ts
packages/tools/src/governance/submitApproval.tool.ts
```

Tool definition:

```ts
export interface AiToolDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
  requiredPermissions: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresHumanApproval: boolean;
  execute: (input: TInput, context: ToolExecutionContext) => Promise<TOutput>;
}
```

Tool execution rules:

* Every tool must validate input.
* Every tool must check permissions.
* Every tool must log execution.
* Every high-risk tool must require approval.
* Every write tool must be approval-aware.
* No model may directly mutate production data.
* The model may only request a tool call.
* The Tool Registry decides if the tool can run.

Initial tools to implement or scaffold:

* Search projects
* Get project context
* Create task
* Create risk
* Create issue
* Create decision
* Create change request
* Generate status report
* Search documents
* Summarise document
* Submit approval request

---

### 6.8 RAG / Knowledge Base Layer

Create a RAG abstraction layer.

Expected files:

```text
packages/rag/src/ingestion/documentIngestion.ts
packages/rag/src/ingestion/chunking.ts
packages/rag/src/retrieval/retrieveContext.ts
packages/rag/src/retrieval/citationBuilder.ts
packages/rag/src/stores/vectorStoreAdapter.ts
packages/rag/src/stores/openAiVectorStore.ts
packages/rag/src/stores/pgVectorStore.ts
packages/rag/src/permissions/documentAccessPolicy.ts
```

Required capabilities:

* Knowledge base creation
* Document registration
* Document metadata
* Document permission mapping
* Ingestion status
* Chunking
* Retrieval
* Citation generation
* Retrieval logging
* Tenant-aware access
* Project/workstream-aware access
* Permission-aware search

RAG rules:

* Do not expose documents across tenants.
* Do not retrieve documents the user cannot access.
* Always return citations for document-grounded answers.
* Log retrieval source IDs.
* Keep vector-store provider abstract.
* Support OpenAI File Search where appropriate.
* Prepare for pgvector or alternative vector database later if needed.

---

### 6.9 Guardrails and Safety

Create guardrail services.

Expected files:

```text
packages/ai/src/guardrails/inputGuardrails.ts
packages/ai/src/guardrails/outputGuardrails.ts
packages/ai/src/guardrails/promptInjection.ts
packages/ai/src/guardrails/moderation.ts
packages/ai/src/guardrails/approvalPolicy.ts
```

Guardrails must cover:

* Prompt injection detection
* Unsafe input detection
* Sensitive data handling
* Unauthorized data access
* Unauthorized tool usage
* Structured output validation
* Unsupported factual claims
* Citation requirement for document-grounded answers
* High-risk action approval
* Admin action restriction
* External communication approval

For high-impact actions, the AI must create an approval request rather than directly executing.

High-risk examples:

* Sending emails
* Updating project RAG status
* Closing issues
* Creating formal reports
* Updating production project records
* Deleting records
* Archiving records
* Calling external integrations
* Changing permissions
* Changing AI settings

---

### 6.10 Human Approval Gates

Implement approval gates for AI actions.

Expected files:

```text
packages/agents/src/approvals/approvalGate.ts
packages/ai/src/approvals/approvalService.ts
```

Approval request fields:

```ts
export interface AiApprovalRequest {
  id: string;
  tenantId: string;
  requestedByUserId: string;
  capability: AiCapability;
  riskLevel: "low" | "medium" | "high" | "critical";
  proposedAction: string;
  proposedPayload: unknown;
  reason: string;
  status: "pending" | "approved" | "rejected" | "expired";
  approvedByUserId?: string;
  rejectedByUserId?: string;
  createdAt: string;
  decidedAt?: string;
}
```

The UI must allow authorized users to:

* View pending AI approval requests
* Inspect the proposed action
* Inspect source context and citations
* Approve
* Reject
* Add comments
* View approval history

---

## 7. Database Requirements

Inspect the existing database and ORM first.

If Prisma is used, add Prisma models and migrations.

If another ORM is used, follow existing migration patterns.

If database changes cannot be safely applied, create schema files and migration notes.

Required AI tables/entities:

```text
ai_providers
ai_models
ai_capabilities
ai_prompts
ai_prompt_versions
ai_agents
ai_agent_runs
ai_agent_steps
ai_agent_messages
ai_tool_definitions
ai_tool_runs
ai_tool_permissions
ai_knowledge_bases
ai_documents
ai_document_chunks
ai_vector_store_links
ai_retrieval_logs
ai_citations
ai_moderation_results
ai_guardrail_results
ai_human_approval_requests
ai_usage_events
ai_cost_events
ai_eval_suites
ai_eval_cases
ai_eval_runs
ai_feedback
ai_audit_logs
```

Minimum AI run fields:

```text
id
tenant_id
user_id
capability
agent_id
prompt_id
prompt_version
model
input_hash
output_hash
status
error_code
tool_calls
retrieval_sources
input_tokens
output_tokens
estimated_cost
safety_status
requires_approval
approval_id
created_at
completed_at
```

Do not log raw sensitive content unless the existing platform has a clear secure logging policy. Prefer hashing, metadata, and controlled trace storage.

---

## 8. API Route Requirements

Create API routes/server actions following existing project conventions.

Recommended routes:

```text
/api/ai/chat
/api/ai/structured
/api/ai/agents/run
/api/ai/agents/:runId
/api/ai/rag/query
/api/ai/documents/analyse
/api/ai/tools/execute
/api/ai/approvals
/api/ai/admin/prompts
/api/ai/admin/models
/api/ai/admin/tools
/api/ai/admin/usage
/api/ai/admin/evals
/api/ai/admin/settings
```

Every route must:

* Require authentication
* Resolve tenant/context
* Validate permissions
* Validate input
* Use server-side AI Gateway
* Never call OpenAI directly outside approved services
* Return typed responses
* Handle loading/failure states cleanly
* Log AI execution metadata
* Never expose secrets
* Never allow arbitrary tool execution

---

## 9. Frontend UI Requirements

Build AI UI surfaces using the existing design system.

Do not create a separate visual language unless no design system exists.

Required AI UI modules:

---

### 9.1 AI Command Centre

Purpose:

Main AI interface for platform users.

Required features:

* Chat/assistant panel
* Context selector
* Project/workstream selector
* Document selector
* Capability selector
* Output type selector
* Citation display
* Confidence display where available
* Tool-call preview
* Approval request action
* Save result action where permitted
* Copy/export actions where permitted
* Conversation/run history

---

### 9.2 AI Agent Runs

Purpose:

Show agent execution traces.

Required features:

* List agent runs
* Run status
* Agent used
* Capability
* User
* Created date
* Duration
* Cost estimate where available
* Step-by-step trace
* Tool calls
* Retrieval context
* Errors
* Retry action where permitted
* Cancel action where permitted

---

### 9.3 Prompt Management

Admin-only.

Required features:

* Prompt list
* Prompt detail
* Prompt versions
* Active/draft/deprecated status
* Prompt owner
* Prompt test panel
* Version comparison where practical
* Approve prompt version
* Roll back prompt version
* Usage history where available

---

### 9.4 Model Management

Admin-only.

Required features:

* Model registry
* Capability-to-model mapping
* Enabled/disabled status
* Default model settings
* Cost/usage indicators where available
* Safety/configuration notes
* Environment configuration status without exposing secrets

---

### 9.5 Tool Governance

Admin/security users only.

Required features:

* Tool registry
* Tool risk level
* Required permissions
* Human approval required flag
* Enable/disable tool
* Tool execution history
* Failure history
* Last used
* Permission matrix

---

### 9.6 Knowledge Base Management

Required features:

* Knowledge base list
* Document list
* Document metadata
* Upload UI only if backend storage exists
* Ingestion status
* Indexing status
* Document permissions
* Project/workstream associations
* Retrieval test panel
* Citation preview
* Delete/archive where permitted

---

### 9.7 AI Approval Queue

Required features:

* Pending approvals
* Approved approvals
* Rejected approvals
* Proposed action details
* Proposed payload preview
* Source citations/context
* Risk level
* Requesting user
* Approve action
* Reject action
* Comment capture
* Approval history

---

### 9.8 AI Usage and Cost Dashboard

Admin-only.

Required features:

* Usage by date
* Usage by user
* Usage by tenant
* Usage by model
* Usage by capability
* Token counts
* Estimated cost
* Failed requests
* High-cost requests
* Budget warnings
* Rate-limit events

---

### 9.9 AI Evaluation Console

Admin/engineering only.

Required features:

* Eval suites
* Eval cases
* Prompt regression tests
* Agent workflow tests
* Safety tests
* Run eval
* Eval result history
* Failed cases
* Release gate notes

---

## 10. Business AI Capabilities To Implement First

Prioritise these initial capabilities.

---

### 10.1 Programme Assistant

A context-aware assistant that can answer questions about:

* Projects
* Workstreams
* Milestones
* Tasks
* Risks
* Issues
* Decisions
* Change requests
* Documents
* Reports

Must respect permissions.

---

### 10.2 Meeting Notes to Actions / RAID

Input:

* Meeting notes
* Workshop notes
* Transcript text
* Copied notes
* Uploaded document text where supported

Output:

* Summary
* Actions
* Risks
* Issues
* Decisions
* Dependencies
* Owners
* Due dates
* Confidence scores

Do not directly create records unless the user has permission and approval policy allows it.

---

### 10.3 Steering Committee Pack Generator

Generate:

* Executive summary
* Programme RAG
* Project/workstream RAG
* Key risks
* Key issues
* Decisions required
* Milestones
* Blockers
* Escalations
* Change requests
* Recommendations

Must include source references where generated from platform data.

---

### 10.4 RAID Intelligence

Analyse risks/issues/dependencies and identify:

* Stale risks
* Missing owners
* High-impact issues
* Escalation candidates
* Duplicate items
* Mitigation gaps
* Overdue reviews
* Dependency blockers

---

### 10.5 Document Intelligence

Allow permission-aware document Q&A and summarisation.

Must include:

* Source citations
* Document title
* Section/page reference where available
* Confidence or evidence quality indicator where practical

---

### 10.6 AI Task Builder

Convert text into:

* Tasks
* Actions
* Milestones
* Dependencies
* Owners
* Acceptance criteria
* Suggested priority
* Suggested due dates

Creation must be gated by permissions and approval rules.

---

## 11. Environment and Configuration

Add or update environment validation.

Required configuration areas:

* OpenAI API key
* Default model
* Fast model
* Reasoning model
* Embedding model
* Feature enablement
* Usage limits
* Cost limits
* Logging level
* Approval policy
* RAG provider
* Vector store configuration where applicable

Add to `.env.example`.

Never commit real keys.

Add runtime checks so AI features fail safely if configuration is missing.

---

## 12. Security Requirements

Implement these security rules:

* No OpenAI API key in frontend bundle.
* No direct client-side OpenAI SDK usage.
* All AI routes require authentication.
* All AI routes resolve tenant/user context.
* All AI actions check permissions.
* All tool calls check required permissions.
* High-risk tool calls require approval.
* Admin AI screens require admin permissions.
* AI-generated writes require validation.
* AI-generated writes require traceability.
* Sensitive data should not be logged raw.
* Prompt injection attempts should be detected where practical.
* Retrieved documents must respect user permissions.
* Cross-tenant data leakage must be impossible through UI or API.
* Do not expose hidden system prompts to end users.
* Do not reveal secrets, env vars, or credentials in AI outputs.

---

## 13. Observability, Audit, and Cost Control

Implement AI observability.

Required logs:

* AI run log
* Agent run log
* Agent step log
* Tool call log
* Retrieval log
* Guardrail result log
* Approval request log
* Usage event log
* Cost event log
* Error log

Required dashboard metrics:

* Total AI requests
* Requests by capability
* Requests by user
* Requests by model
* Failed requests
* Average latency
* Token usage
* Estimated cost
* High-risk approvals
* Tool executions
* Retrieval usage

Add cost controls:

* Per-request token limits
* Daily cost limit
* User-level usage limit where practical
* Tenant-level usage limit where practical
* Admin visibility
* Safe failure when budget is exceeded

---

## 14. Testing Requirements

Add tests where practical using the existing test framework.

Required test areas:

* AI Gateway input validation
* Model registry selection
* Prompt registry rendering
* Structured output validation
* API route authentication
* API route permission checks
* Tool permission checks
* Approval gate logic
* RAG permission filtering
* Agent run status transitions
* Error normalization
* UI route rendering
* Admin-only AI pages
* No client-side exposure of OpenAI key
* Empty/loading/error states

If automated tests cannot be added due to existing project limitations, document why and provide a manual validation checklist.

---

## 15. Accessibility Requirements

AI UI must be accessible.

Check:

* Keyboard navigation
* Visible focus states
* Correct form labels
* Accessible modal/dialog behaviour
* ARIA only where appropriate
* Screen-reader-friendly status indicators
* Non-colour-only risk/status communication
* Semantic tables
* Logical heading structure
* Error messages linked to fields
* Responsive layouts
* Touch-friendly controls

---

## 16. Implementation Phases

Execute in this order.

---

### Phase 1: Repository Audit

Deliver:

* Stack assessment
* Current architecture map
* Existing AI-related code review
* Integration points
* Risks
* Recommended file structure
* Build/test commands

Do not skip this.

---

### Phase 2: AI Foundation

Implement:

* OpenAI client wrapper
* AI Gateway
* Environment validation
* Model registry
* Prompt registry
* Error handling
* Basic usage logging
* Basic AI chat route
* Basic AI command centre UI

---

### Phase 3: Structured Business Capabilities

Implement:

* Structured output schemas
* Meeting notes to actions/RAID
* Project summary
* Risk extraction
* Issue extraction
* Decision extraction
* Report generation scaffolding

---

### Phase 4: Database and Audit Persistence

Implement:

* AI run persistence
* Agent run persistence
* Tool run persistence
* Approval request persistence
* Usage event persistence
* Retrieval log persistence
* Audit log persistence

Follow existing ORM and migration patterns.

---

### Phase 5: RAG / Knowledge Base

Implement:

* Knowledge base model
* Document registration
* Vector-store adapter
* OpenAI File Search adapter if suitable
* Retrieval service
* Citation builder
* Document permission policy
* Knowledge base UI

---

### Phase 6: Tool Registry and Approval Gates

Implement:

* Tool registry
* Initial project tools
* Permission checks
* Risk levels
* Approval-gated tools
* Approval queue UI
* Tool governance UI

---

### Phase 7: Agent Runtime

Implement:

* Agent runtime
* Agent definitions
* Agent run tracking
* Step tracking
* Handoff policy
* Retry/failure logic
* Agent run viewer UI

---

### Phase 8: Admin AI Console

Implement:

* Prompt management
* Model management
* Tool governance
* Usage/cost dashboard
* Evaluation console scaffold
* AI settings

---

### Phase 9: Testing and Validation

Run:

* Install check
* Type check
* Build
* Lint
* Existing tests
* New tests
* Manual UI checks
* Permission checks
* Security checks
* Accessibility checks

---

### Phase 10: Documentation and Handover

Deliver:

* Implementation summary
* Changed files
* Architecture notes
* API notes
* Database notes
* Security notes
* AI governance notes
* Testing results
* Known limitations
* Follow-up backlog

---

## 17. Required Final Output Format

When implementation is complete, respond with:

```text
# AI Platform Implementation Summary

## 1. Executive Summary
What was implemented.

## 2. Repository Assessment
What was found in the existing platform.

## 3. Architecture Implemented
How the AI platform is structured.

## 4. Files Added
List files.

## 5. Files Modified
List files.

## 6. Database Changes
List schema/migration changes.

## 7. API Routes Added
List routes and purpose.

## 8. UI Modules Added
List AI UI modules.

## 9. OpenAI Integration
Explain how OpenAI is used.

## 10. Security and Governance
Explain auth, permissions, approval gates, audit, and secret handling.

## 11. RAG / Knowledge Base
Explain document intelligence implementation.

## 12. Agent Runtime
Explain agents and orchestration.

## 13. Tool Registry
Explain tools, permissions, and approval rules.

## 14. Usage and Cost Tracking
Explain metering and dashboards.

## 15. Testing and Validation
List commands run and results.

## 16. Known Issues
List remaining issues honestly.

## 17. Follow-Up Backlog
List next tasks.

## 18. How To Use
Give developer/admin usage instructions.
```

Do not claim a command passed unless it was actually run.

Do not claim implementation is production-ready unless validation passed.

---

## 18. Hard Do-Nots

Do not:

* Build a generic chatbot and call it an AI platform.
* Put OpenAI calls in React components.
* Expose API keys in frontend code.
* Create uncontrolled AI writes to production data.
* Create tools without permissions.
* Create tools without input validation.
* Create write tools without audit logging.
* Create high-risk tools without approval gates.
* Use mock data in production paths.
* Invent backend endpoints and present them as existing.
* Duplicate existing auth or RBAC systems.
* Duplicate existing design systems.
* Duplicate existing API clients.
* Store secrets in code.
* Log raw sensitive data unnecessarily.
* Ignore tenant boundaries.
* Ignore accessibility.
* Ignore cost control.
* Ignore testing.
* Leave required functionality as TODO.
* Claim success without evidence.

---

## 19. Success Criteria

The implementation is successful only if:

* OpenAI is accessed only through server-side governed services.
* AI Gateway exists and is used consistently.
* Prompt registry exists.
* Model registry exists.
* Structured outputs are used for application-bound AI responses.
* AI run logging exists.
* Usage tracking exists.
* Tool registry exists or is scaffolded.
* Approval gates exist for high-risk actions.
* RAG/knowledge base layer exists or is scaffolded.
* AI admin surfaces exist or are scaffolded.
* Agent runtime exists or is scaffolded.
* Authentication and authorization are respected.
* No secrets are exposed.
* No production mock data is used.
* Build/type/lint/test validation is run or blockers are clearly documented.
* Final documentation is delivered.

---

## 20. First Practical Build Target

If the full implementation is too large for one pass, implement this minimum production foundation first:

1. Repository audit
2. Server-side OpenAI client wrapper
3. AI Gateway
4. Model registry
5. Prompt registry
6. Environment validation
7. AI run logging
8. Usage logging
9. Basic authenticated `/api/ai/chat` endpoint
10. Structured output schema support
11. Meeting notes to actions/RAID capability
12. Basic AI Command Centre UI
13. Admin-only AI usage view
14. Documentation
15. Build/type/lint/test validation

After that, continue with RAG, Tool Registry, Agent Runtime, Approval Gates, and full AI Admin Console.
