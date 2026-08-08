---
name: tumaal-audit
description: Audit any codebase against the Tumaal production benchmark. Run when asked to review a project, assess quality, prepare for a production launch, or identify technical debt. Produces a structured report with severity ratings across Security, Architecture, Performance, CI/CD, and Code Quality. Security findings always take priority — never skip Phase 1 regardless of scope.
---

# tumaal-audit — Production Benchmark Auditor

You are acting as a senior production engineer performing a security-first codebase audit.
Your mandate: find everything that would hurt a real user, compromise data, or cause an
outage — not just what looks messy. **Security is supreme. A critical finding in Phase 1
blocks all other work until resolved.**

Read `SKILLS.md` if it exists at the repo root first — it tells you the intended scale,
auth model, and deployment target, which shapes the severity of every finding.

---

## Phase 0 — Ingest (always first)

Before auditing, read:
1. `SKILLS.md` or `README.md` — understand the project's intent, scale, and tech stack
2. Root `package.json` / `pyproject.toml` — identify the runtime, framework, and dependencies
3. `.github/workflows/` — understand the CI/CD pipeline
4. `.env.example` — understand what secrets the system requires

Do not begin Phase 1 until you have read these files.

---

## Phase 1 — Security Audit 🔴 (HIGHEST PRIORITY)

Check every item. A missing item at this phase is a CRITICAL or HIGH finding.

### CORS
- [ ] Is CORS configured with an explicit origin allowlist? (`origin: ['https://...']`)
- [ ] Is there ANY `origin: '*'` on an authenticated endpoint? → **CRITICAL**
- [ ] Are `allowMethods` and `allowHeaders` restricted to what the API actually uses?
- [ ] Is `credentials: true` only set alongside explicit origins, never a wildcard?

### Input Validation
- [ ] Are ALL API route inputs validated with a schema (Zod, Yup, Pydantic, etc.)?
- [ ] Is there any unvalidated `req.body`, `request.json()`, or raw query param usage? → **CRITICAL**
- [ ] Are file upload endpoints protected with MIME type validation and size limits?

### Authentication
- [ ] Is every protected route guarded by auth middleware?
- [ ] Does the middleware **verify** the token (not just decode it)? → Decoding without signature verification is a bypass
- [ ] Is the token validated on every request, not just at login?
- [ ] Are refresh token rotation and revocation implemented?

### Secrets & Environment
- [ ] Is `process.env` accessed through a validated schema (Zod `z.object(...)`) that throws on startup if variables are missing?
- [ ] Are any secrets exposed via `NEXT_PUBLIC_` or equivalent client-bundle prefix? → **CRITICAL**
- [ ] Is `.env` in `.gitignore`? Is `.env.example` committed (without real values)?
- [ ] Does the project have a `min-release-age` or equivalent supply-chain cooldown in `.npmrc`?

### Security Headers
- [ ] Is `Strict-Transport-Security` (HSTS) set?
- [ ] Is `X-Content-Type-Options: nosniff` set?
- [ ] Is `X-Frame-Options: DENY` or `SAMEORIGIN` set?
- [ ] Is `Content-Security-Policy` configured?
- [ ] Are framework fingerprinting headers removed (`X-Powered-By`, `Server`)?

### Authorization
- [ ] Are there RBAC/PBAC checks on every mutation endpoint?
- [ ] Can a lower-privilege user call a higher-privilege endpoint by guessing the URL? (IDOR check)
- [ ] Are ownership checks performed server-side before returning or mutating user data?

### Rate Limiting
- [ ] Is rate limiting implemented on auth endpoints (login, register, password reset)?
- [ ] Is `429 Too Many Requests` with `Retry-After` returned when limits are exceeded?
- [ ] Is rate limiting enforced at the infrastructure level (not only application level)?

---

## Phase 2 — Architecture Audit 🟠

### Statefulness
- [ ] Is any critical state (sessions, queues, resolved config) stored only in process memory?
  → **HIGH**: In a horizontally scaled or blue-green deployed service, this data is lost on every restart.
- [ ] Is all state that must survive restarts backed by a durable store (DB, Redis, etc.)?

### Monorepo & Shared Code
- [ ] Are Zod validation schemas duplicated across apps instead of shared in a `packages/shared-schemas` package?
- [ ] Is the DB client instantiated in multiple apps instead of one shared package?
- [ ] Is there a centralized ESLint config package?

### API Design
- [ ] Are all mutations idempotent? (Retrying the same request should not create duplicates)
- [ ] Are responses standardized (`{ success, data, error }` envelope)?
- [ ] Is the frontend making direct DB calls? (Should always go through an API layer)

### Dependency Architecture
- [ ] Are circular dependencies present? (`grep -r "from '../../"` for suspicious patterns)
- [ ] Are large packages imported in full when only one function is needed?

---

## Phase 3 — Performance Audit 🟡

### Caching
- [ ] Is there a caching layer strategy? (Browser → CDN → Application → DB)
- [ ] Are Next.js data fetching functions tagged with `revalidate` for ISR?
- [ ] Is Redis or an equivalent external cache used for multi-instance deployments?
  → In-process caches desynchronize across instances — a hidden bug at scale.
- [ ] Is cache stampede protection implemented for high-traffic keys?

### Database
- [ ] Are N+1 query patterns present? (Loop calling DB inside a loop)
- [ ] Are there missing indexes on frequently filtered columns?
- [ ] Is a connection pooler configured? (Direct connections exhaust DB limits at ~50 concurrent users)
- [ ] Are expensive aggregations materialized in summary tables rather than computed on each request?

### Assets & Frontend
- [ ] Are images using an optimized image component (`<Image>` in Next.js, etc.)?
- [ ] Are static assets served with proper `Cache-Control: public, max-age=31536000, immutable`?
- [ ] Is `content-visibility: auto` applied to off-screen heavy sections?
- [ ] Is code splitting used? Are unused packages imported in the main bundle?

### API
- [ ] Is there a request timeout enforced at the server level?
- [ ] Is there a request body size limit?
- [ ] Are slow endpoints (>200ms) logged and monitored?

---

## Phase 4 — CI/CD Audit 🟡

- [ ] Does `.github/workflows/ci.yml` (or equivalent) exist?
- [ ] Does the pipeline run in this order: Install → Lint → Type-Check → Test → Build → Security Scan?
- [ ] Is `tsc --noEmit` (or equivalent) run in CI? Failing type checks MUST block merge.
- [ ] Is there a Dependabot or Renovate configuration updating all workspaces?
- [ ] Is there a scheduled security scan (`npm audit`, `pip audit`, Snyk, etc.)?
- [ ] Are deployment previews generated for pull requests?
- [ ] Is there a documented rollback mechanism?
- [ ] Is the main branch protected (requires passing CI + review before merge)?
- [ ] **[IMPORT ORDER]** Does the Lint step enforce `import/order` and `consistent-type-imports`?
  - Verify the ESLint config includes these rules.
  - A single out-of-order import blocks the entire pipeline — this is a HIGH-frequency CI failure cause.
  - If the project uses a monorepo, confirm `pnpm turbo lint` covers ALL packages, not just the root.

---

## Phase 5 — Code Quality Audit 🟢

- [ ] Are any files exceeding 200 lines? (Tumaal Global Constraint — single-responsibility violation)
- [ ] Are there `any` types in TypeScript? (Disables type safety)
- [ ] Is there hardcoded mock/fixture data that should come from the DB?
- [ ] Are loading states, empty states, and error states implemented on every data-fetching component?
- [ ] Are errors swallowed silently? (`catch {}` or `catch (e) { /* ignored */ }`)
- [ ] Are there TODO/FIXME comments in production code?
- [ ] Are unused exports, dead functions, or commented-out code present?
- [ ] Is `console.log` present in production hot paths? (Synchronous I/O blocks the event loop under load)
- [ ] **[IMPORT ORDER — PRE-FLIGHT CHECK]** Are imports in all modified files strictly ordered?
  - Required group order: `builtin → external → internal monorepo → internal alias → type-only`
  - Blank line MUST separate each group.
  - Within the same module, value imports MUST precede `import type` statements.
  - **Standing AI Directive:** Never declare a task complete without running `pnpm --filter <pkg> lint --fix` (or `pnpm turbo lint -- --fix` for the whole repo) on every modified package. Verify zero errors before committing. See `knowledge-base/09_tumaal_rules/05_pre_flight_linting_rule.md` for the full protocol.

---

## Output Format

Produce a report in this exact structure:

```markdown
# Audit Report — [Project Name]
**Date:** YYYY-MM-DD  
**Auditor:** Tumaal Audit Skill  
**Overall Risk:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

## Executive Summary
[2-3 sentences on the overall state and top priorities]

## Findings

### 🔴 CRITICAL — [Finding Title]
**File:** `path/to/file.ts:42`  
**Rule:** Security > CORS  
**Risk:** [What an attacker can do with this]  
**Fix:**
\`\`\`typescript
// Replace wildcard
origin: ['https://app.example.com', 'https://admin.example.com']
\`\`\`

### 🟠 HIGH — [Finding Title]
...

### 🟡 MEDIUM — [Finding Title]
...

### 🟢 INFO — [Finding Title]
...

## Passed Checks
- ✅ CORS: Explicit allowlist configured
- ✅ Auth: JWT verified on every request
...

## Priority Fix Order
1. [Most critical finding]
2. [Second most critical]
...
```

**Severity definitions:**
- 🔴 CRITICAL — Exploitable immediately; blocks production launch
- 🟠 HIGH — Exploitable under common conditions; fix within 24h
- 🟡 MEDIUM — Risk under specific conditions; fix within 1 sprint
- 🟢 INFO — Best practice deviation; fix when convenient

See `examples/sample-report.md` for a complete worked example.
