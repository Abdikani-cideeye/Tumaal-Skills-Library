# TUMAAL SKILLS LIBRARY — MASTER RULEBOOK

## IDENTITY

You are governed by the **Tumaal Skills Library**. This is the authoritative engineering codex. Every file in this library is a strict directive. You MUST treat every ALWAYS/NEVER rule as non-negotiable unless the human operator explicitly overrides it in the current session.

---

## MANDATORY READING ORDER

Ingest the library in this exact priority sequence. Earlier folders override later folders when rules conflict.

1. **`05_security_and_auth/`** — Security is supreme. NEVER trade security for convenience.
2. **`02_clean_code_and_patterns/`** — Code quality is the foundation. Read before writing any code.
3. **`03_frontend_and_ui_ux/`** — Editorial Minimalism is the DEFAULT design language.
4. **`04_backend_and_apis/`** — API and data layer rules.
5. **`01_system_design_and_architecture/`** — Scalability and infrastructure decision frameworks.
6. **`06_devops_and_cloud/`** — Deployment, CI/CD, and environment rules.
7. **`07_ai_and_llmops/`** — AI integration, prompt engineering, and RAG rules.
8. **`08_mobile_and_cross_platform/`** — Mobile-specific overrides and patterns.
9. **`09_tumaal_rules/`** — Stack-specific syntax rules for FastAPI, React/Vite, Next.js, and SQLite.

---

## PRIORITY HIERARCHY

When rules conflict, resolve using this hierarchy (highest to lowest):

1. **Security rules** — ALWAYS win. No exceptions.
2. **Data integrity rules** — NEVER corrupt or orphan data.
3. **User experience rules** — The user MUST never see a broken state.
4. **Code quality rules** — Maintainability over cleverness.
5. **Performance rules** — Optimize only after correctness is verified.
6. **Convenience rules** — Developer experience is last priority.

---

## DEFAULT DESIGN MODE

The default UI/UX design language is **Editorial Minimalism**. See `03_frontend_and_ui_ux/02_editorial_minimalism_default.md`.

Alternative design modes are documented in `03_frontend_and_ui_ux/03_alternative_design_modes.md`. These are **opt-in ONLY**. NEVER use Bento Box, Glassmorphism, or Neo-Brutalism unless the human operator explicitly requests it by name.

---

## PRODUCTION PRINCIPLES (Standing Directives)

These principles apply to ALL projects and override default behavior:

### Durable-by-Default
State stored only in process memory (Maps, arrays, module-level variables) is wiped on every server restart or deploy. **Anything that must survive a restart MUST live in a durable store (DB, Redis).** RAM-only is acceptable only as a cache in front of a durable store.

### Blast-Radius Thinking
Before changing any shared helper, count how many callers it has. A one-line change to a function with 50 importers is a HIGH-RISK change. **Judge change risk by callers, not by file count.**

### Adversarial Review Discipline
The context that produced a diff already believes it is correct — that belief is the bias review exists to defeat. **Never self-review in the authoring context.** Use the `adversarial-review` skill before every merge.

### Supply-Chain Security
**All projects MUST include `min-release-age=7` in `.npmrc`.** This prevents compromised packages (published then yanked within hours) from entering lockfiles.

### Fix All, Not One
When a bug or pattern is found, grep the whole codebase. **One fixed call site with untouched siblings is a regression waiting to be rediscovered.**

### Shrink, Don't Layer
Fixes should make the system simpler. **Prefer removing or consolidating code over adding a new flag, layer, or special case.**

---

## WHEN IN DOUBT

- **If unsure about a design choice →** Default to Editorial Minimalism.
- **If unsure about a security practice →** Choose the more restrictive option.
- **If unsure about data handling →** NEVER mutate or delete; prefer soft operations.
- **If unsure about architecture →** Choose the simpler, more decoupled option.
- **If unsure about a library choice →** Use the `tech-evaluator` skill to research before choosing.
- **If a rule is not covered →** Ask the human operator before proceeding.

---

## GLOBAL CONSTRAINTS

- **NEVER** allow any single file to exceed 200 lines of code.
- **NEVER** ship hardcoded mock data. All dynamic content MUST come from a database.
- **NEVER** expose API keys, service tokens, or secrets to the client-side bundle.
- **NEVER** store critical state in process memory for multi-instance services.
- **ALWAYS** implement explicit loading states, empty states, and error states.
- **ALWAYS** use typed database clients and strict validation schemas (Zod, Pydantic, etc.).
- **ALWAYS** run strict type-checking (`tsc --noEmit` or equivalent) before declaring a feature complete.
- **ALWAYS** run the `adversarial-review` skill before merging any feature to main.
- **ALWAYS** include `min-release-age=7` in `.npmrc` for all new projects.

---

## TECH STACK GUIDANCE

Rules in this library are **framework-agnostic**. Parenthetical tool references (e.g., Prisma, Zustand, React Query) are preferred examples, not mandates. Adapt to the current project's stack while preserving the architectural principle.

When choosing technology, use the `ai-skills/tech-evaluator` skill — it searches the internet for current benchmarks, security advisories, and community health before recommending.

---

## AI SKILLS (Executable AI Tools)

The `ai-skills/` directory contains executable AI skills — specialized prompts that give an AI agent
superpowers for specific tasks. Load the relevant skill when the task applies.

| Skill | When to use |
|---|---|
| [`ai-skills/tumaal-audit/`](./ai-skills/tumaal-audit/SKILL.md) | Audit any codebase against the Tumaal benchmark |
| [`ai-skills/tech-evaluator/`](./ai-skills/tech-evaluator/SKILL.md) | Research & choose the right technology |
| [`ai-skills/adversarial-review/`](./ai-skills/adversarial-review/SKILL.md) | Break-it code review before any merge |
| [`ai-skills/scale-stress-test/`](./ai-skills/scale-stress-test/SKILL.md) | Stress-test architecture at 1M+ users |
| [`ai-skills/hidden-bug-hunter/`](./ai-skills/hidden-bug-hunter/SKILL.md) | Find race conditions, silent failures, data loss |

---

## CLI TOOLING

### `packages/create-tumaal-app` — Project Scaffolding

Scaffold a new production-grade monorepo in minutes:

```bash
# From the Tumaal Skills Library root:
cd packages/create-tumaal-app
pnpm install
pnpm dev

# Or once published:
pnpm create tumaal-app
```

The wizard asks 6 questions and generates:
- Complete pnpm + Turborepo monorepo
- Hono API with Zod env validation, CORS allowlist, security headers, JWT auth
- Next.js 15 App Router frontend
- Shared packages (schemas, eslint-config, database)
- 5-stage GitHub Actions CI (lint → type-check → test → build → security)
- Scheduled security scan + Dependabot for all workspaces
- `.npmrc` with `min-release-age=7` (supply-chain cooldown)
- `SKILLS.md` architect decision template

---

## FILE INDEX (`knowledge-base/`)

### `01_system_design_and_architecture/`
| File | Scope |
|---|---|
| `01_scalability_fundamentals.md` | Horizontal vs vertical scaling, CAP theorem, trade-off matrices |
| `02_caching_strategies.md` | CDN, application-level, database query caching, invalidation |
| `03_database_scaling.md` | Read replicas, sharding, partitioning, connection pooling |
| `04_load_balancing_and_networking.md` | LB algorithms, reverse proxy, DNS, CDN routing |
| `05_async_processing_and_queues.md` | Message queues, event-driven architecture, pub/sub |

### `02_clean_code_and_patterns/`
| File | Scope |
|---|---|
| `01_naming_and_variables.md` | Naming conventions, searchability, no magic numbers |
| `02_functions_and_modularity.md` | SRP, purity, argument limits, no boolean flags |
| `03_solid_principles.md` | SRP, OCP, LSP, ISP, DIP as strict directives |
| `04_error_handling_patterns.md` | Try/catch/finally, graceful degradation, no silent failures |
| `05_code_formatting_and_linting.md` | Consistency, tooling, file size enforcement |

### `03_frontend_and_ui_ux/`
| File | Scope |
|---|---|
| `01_component_architecture.md` | DDD structure, file limits, colocation, feature isolation |
| `02_editorial_minimalism_default.md` | Invisible cards, macro whitespace, typography, motion |
| `03_alternative_design_modes.md` | Bento Box, Glassmorphism, Neo-Brutalism (opt-in) |
| `04_state_management.md` | Client vs server state, cache invalidation, URL state |
| `05_defensive_rendering.md` | Loading guards, safe mapping, error boundaries, fallbacks |
| `06_performance_optimization.md` | Code splitting, image optimization, web vitals |

### `04_backend_and_apis/`
| File | Scope |
|---|---|
| `01_api_design_and_rest.md` | RESTful conventions, response standardization, filtering |
| `02_database_modeling.md` | Relational design, soft deletes, cascading, indexing |
| `03_orm_and_query_optimization.md` | Typed clients, SQL-first, N+1 prevention, transactions |
| `04_dependency_injection_and_validation.md` | DI patterns, schema validation, chained dependencies |
| `05_background_tasks_and_async.md` | BG tasks vs queues, async/sync routing, event loops |
| `06_project_structure_and_modularity.md` | Domain-driven structure, monorepo isolation, path aliases |

### `05_security_and_auth/`
| File | Scope |
|---|---|
| `01_authentication_and_jwt.md` | Token storage, HttpOnly cookies, refresh flows |
| `02_authorization_and_rbac.md` | RBAC/PBAC, RLS, middleware, service role keys |
| `03_xss_csrf_and_injection.md` | XSS prevention, CSRF tokens, SQL injection, sanitization |
| `04_secrets_management.md` | Env isolation, proxy pattern, rotation, never expose |
| `05_cors_ssrf_and_api_hardening.md` | CORS config, SSRF prevention, rate limiting, headers |

### `06_devops_and_cloud/`
| File | Scope |
|---|---|
| `01_cicd_pipelines.md` | Build verification, type checking, linting, deployment flow |
| `02_docker_and_containerization.md` | Multi-stage builds, security, compose patterns |
| `03_environment_separation.md` | Dev/staging/prod isolation, IaC, env var management |
| `04_edge_computing_and_cdn.md` | Edge functions, static caching, CDN invalidation |

### `07_ai_and_llmops/`
| File | Scope |
|---|---|
| `01_prompt_engineering_for_agents.md` | Phase 0, atomic prompting, context anchoring |
| `02_ai_integration_security.md` | Prompt injection, structured outputs, token management |
| `03_rag_architecture.md` | Retrieval patterns, chunking, embedding, fallbacks |
| `04_ai_agent_collaboration.md` | Plan-before-code, constraints, untrusted draft review |

### `08_mobile_and_cross_platform/`
| File | Scope |
|---|---|
| `01_keyboard_and_form_ergonomics.md` | KeyboardAvoidingView, scroll padding, tab navigation |
| `02_safe_areas_and_headers.md` | Native headers vs SafeAreaView, insets, Android quirks |
| `03_navigation_and_offline.md` | Conditional navigators, auth stacks, offline-first |

### `09_tumaal_rules/`
| File | Scope |
|---|---|
| `01_fastapi_and_python_rules.md` | Layer architecture, Pydantic V2, DI, domain exceptions, async routing |
| `02_react_vite_tailwind_rules.md` | Components, TypeScript strict, Tailwind v3, hooks, state, Vite config |
| `03_nextjs_app_router_rules.md` | RSC, Server Actions, data fetching, routing conventions, metadata |
| `04_sqlite_and_orm_rules.md` | SQLite PRAGMAs, SQLAlchemy 2.0, async sessions, indexing, migrations |
