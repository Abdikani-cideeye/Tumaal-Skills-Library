# ERROR HANDLING PATTERNS

## CORE RULES

- **ALWAYS** implement `try/catch/finally` for every asynchronous data fetch. The `finally` block MUST release the loading state to prevent infinite loading spinners (the "White Screen of Death").
- **NEVER** use empty `catch` blocks. Every caught error MUST be logged, reported, or handled. Silent swallowing of errors is forbidden.
- **NEVER** use `try/catch` as a band-aid fix for crashes. ALWAYS trace the bug to its architectural root (missing database field, malformed API response, remounting issue) and fix it at the source.

## GRACEFUL DEGRADATION

- **ALWAYS** fail gracefully. NEVER allow an unhandled promise rejection or API 404 to result in a blank screen. ALWAYS implement fallback UI and safe default returns.
- **ALWAYS** return safe fallbacks from API clients when endpoints fail. Return empty arrays `[]` for list endpoints, `null` for single-entity endpoints, and descriptive error objects for mutation endpoints.
- **ALWAYS** implement global error boundaries (React `ErrorBoundary`, Vue `errorCaptured`, or equivalent). Scope them to content areas, NOT the entire app.

## ERROR BOUNDARY SCOPING

- **NEVER** use full-screen error boundaries. If a specific page crashes, the error boundary MUST be scoped to the main content area. Navigation (sidebar, top bar) MUST remain visible so the user can navigate away.
- **ALWAYS** provide actionable fallbacks in error boundaries: "Go Back", "Return to Dashboard", or "Retry" buttons. NEVER expose raw technical stack traces to end users.
- **ALWAYS** log the full error (including stack trace) to the console or an error-tracking service (e.g., Sentry). Technical details are for developers, not users.

## API ERROR HANDLING

- **ALWAYS** implement a centralized API error interceptor that:
  - Triggers user-facing notification toasts for non-critical errors.
  - Logs out unauthorized users (401) and redirects to login.
  - Refreshes expired tokens before retrying the request (if using refresh tokens).
- **ALWAYS** standardize error responses from your APIs: `{ success: false, message: string, code?: string }`.
- **NEVER** return raw database errors or internal exception messages to API consumers. Sanitize all error responses.

## PROMISE HANDLING

- **ALWAYS** prefer `async/await` over `.then()/.catch()` chains for readability.
- **NEVER** leave a Promise unhandled. Every Promise MUST be `await`ed, `.catch()`ed, or explicitly voided with a comment explaining why.
- **ALWAYS** use `Promise.allSettled()` instead of `Promise.all()` when partial failures are acceptable. `Promise.all()` short-circuits on the first rejection.

## ERROR TRACKING

- **ALWAYS** integrate an error tracking service (e.g., Sentry, Bugsnag) in production. Manual log monitoring does not scale.
- **ALWAYS** upload source maps to the error tracking service to see original source locations, not minified bundle locations.
- **ALWAYS** tag errors with environment, user context (anonymized), and release version for effective triage.

## ROOT CAUSE ANALYSIS

- **ALWAYS** distinguish between code bugs and environment bugs. Before rewriting code for a type error, verify if the IDE or language server is caching stale types. Restart the language server or regenerate the ORM client before altering working code.
- **NEVER** deploy a fix without understanding the root cause. A fix that addresses symptoms will break again.
