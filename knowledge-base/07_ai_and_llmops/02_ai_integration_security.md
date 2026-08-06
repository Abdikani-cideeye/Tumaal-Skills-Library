# AI INTEGRATION SECURITY

## PROMPT INJECTION PREVENTION

- **ALWAYS** isolate system instructions from user inputs. NEVER concatenate untrusted user input directly into the core system prompt.
- **ALWAYS** use distinct system/developer message roles and user message roles to create a separation boundary. The system prompt should be immutable and not influenced by user content.
- **ALWAYS** implement input sanitization on user-provided text before passing it to AI models. Strip or escape control characters, prompt delimiters, and instruction-like patterns.
- **NEVER** allow user input to modify, override, or append to system-level instructions. Treat all user input as untrusted data, not instructions.

## STRUCTURED OUTPUT ENFORCEMENT

- **ALWAYS** enforce structured outputs when querying AI models for application logic. Explicitly demand and strictly parse responses against a defined schema (e.g., JSON Schema, Zod, Pydantic) before utilizing the data.
- **NEVER** trust raw AI text output for structured operations (database writes, API calls, UI rendering). ALWAYS validate and parse.
- **ALWAYS** implement fallback behavior when AI output fails schema validation. Return a safe default, retry with a more explicit prompt, or surface an error to the user.
```javascript
// ALWAYS validate AI output
const schema = z.object({ title: z.string(), tags: z.array(z.string()) });
const parsed = schema.safeParse(aiResponse);
if (!parsed.success) {
  return fallbackResponse;
}
```

## TOKEN AND CONTEXT MANAGEMENT

- **ALWAYS** implement resilient token management. Anticipate context window limits before they cause silent truncation or degraded responses.
- **ALWAYS** implement dynamic truncation, text chunking, or summarization pipelines before sending massive payloads to generation models.
- **ALWAYS** track token usage per request for cost monitoring and budget enforcement. Set hard limits per user/session.
- **NEVER** send the entire database, full document, or complete conversation history to an AI model without first applying relevance filtering or summarization.

## AVAILABILITY AND RESILIENCE

- **NEVER** assume AI availability. ALWAYS implement:
  - **Circuit breakers:** Stop calling a failing AI provider temporarily.
  - **Retry logic:** Exponential backoff with jitter for transient failures.
  - **Fallback providers:** If the primary model is down, fall back to a secondary model or a non-AI default.
  - **Timeout enforcement:** Set strict timeouts on AI API calls (typically 30-60 seconds max).
- **ALWAYS** design the application to function (in degraded mode) without AI. AI features should enhance, not gate, core functionality.

## DATA PRIVACY WITH AI

- **NEVER** send personally identifiable information (PII), credentials, or sensitive business data to external AI APIs without explicit user consent and data processing agreements.
- **ALWAYS** anonymize or redact sensitive data before sending it to AI models for processing.
- **ALWAYS** audit and log what data is sent to external AI services. Maintain a record for compliance.

## MODEL OUTPUT SAFETY

- **ALWAYS** treat AI-generated content as untrusted user input for rendering purposes. Apply the same XSS sanitization rules to AI output as you would to user-submitted content.
- **NEVER** execute AI-generated code or SQL directly without sandboxing, validation, and human review.
- **ALWAYS** implement content moderation on AI-generated user-facing content to filter harmful, biased, or inappropriate outputs.
