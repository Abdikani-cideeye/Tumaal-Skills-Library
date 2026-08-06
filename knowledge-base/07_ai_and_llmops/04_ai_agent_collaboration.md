# AI AGENT COLLABORATION

## PLAN BEFORE CODE

- **ALWAYS** enforce a "Plan Before Code" protocol. NEVER instruct an AI agent to build a complex feature immediately. Command the agent to:
  1. Write a step-by-step architectural plan.
  2. Wait for human approval.
  3. Execute atomically, one step at a time.
- **ALWAYS** review and approve the plan before execution begins. Reject plans that attempt to build too much in a single step.

## EXPLICIT CONSTRAINTS

- **ALWAYS** provide explicit constraints when starting a new AI session:
  - Exact tech stack and versions.
  - Preferred libraries and packages.
  - Strict architectural boundaries (e.g., "Use App Router, avoid Class Components").
  - Styling approach (e.g., "Tailwind only, no inline styles").
  - File size limits (200 lines max per file).
- **NEVER** assume the AI retains context from a previous session. Re-establish constraints on every new conversation.

## ATOMIC EXECUTION

- **NEVER** accept monolithic refactors from AI agents. Command agents to break down large changes into small, isolated, single-file updates that are individually reviewable and testable.
- **ALWAYS** verify each atomic change before instructing the agent to proceed to the next step. NEVER let the agent chain multiple untested changes.
- **ALWAYS** require the agent to run a build/type-check after each change to confirm the codebase compiles.

## UNTRUSTED DRAFT REVIEW

- **ALWAYS** treat AI output as an untrusted draft. The developer remains the senior architect. Manually review AI-generated code for:
  - Edge cases the AI missed.
  - Security vulnerabilities (exposed secrets, unsanitized inputs, missing auth checks).
  - Adherence to global application state and design system.
  - Performance implications (unnecessary re-renders, missing lazy loading, N+1 queries).
  - Correct error handling (try/catch/finally, loading states, empty states).
- **NEVER** merge AI-generated code directly to the main branch without human review.

## WORKSPACE AWARENESS

- **ALWAYS** ensure the AI agent has access to and has read the relevant design system, architecture documents, and existing code before making changes.
- **NEVER** let an AI agent create components or patterns that contradict the established codebase conventions without explicit justification.
- **ALWAYS** point the AI back to existing utilities, hooks, and components before letting it create duplicates.

## SCOPE MANAGEMENT

- **ALWAYS** prioritize the Minimum Viable Product (MVP). If a complex feature threatens the deployment timeline, document it for "Phase 2" and execute the core functionality first.
- **NEVER** allow scope creep within a single AI session. If the agent suggests adding features beyond the current task, log them for future sessions but do not execute them now.
- **ALWAYS** define clear completion criteria for each AI task before starting. The agent should know exactly when to stop.

## ERROR RECOVERY

- **WHEN** an AI agent produces broken or incorrect output:
  1. Do NOT iteratively patch the broken output. Revert to the last known good state.
  2. Provide the agent with the error message and clear context about what went wrong.
  3. Command a fresh, focused attempt with more explicit constraints.
- **NEVER** let an AI agent enter a "fix loop" where it repeatedly patches the same broken code. After 2 failed attempts, revert and rethink the approach.

## SESSION HYGIENE

- **ALWAYS** start each AI coding session by re-establishing:
  1. The project's design system and architectural constraints.
  2. The specific task to accomplish.
  3. The files the agent is allowed to modify.
  4. The definition of done.
- **ALWAYS** end each AI session with a summary of changes made, tests run, and remaining work.
