import type { ScaffoldContext } from '../wizard';

export function skillsMd(ctx: ScaffoldContext): string {
  const today = new Date().toISOString().slice(0, 10);
  return `# ${ctx.projectName} — Architectural Decision Record

> This document is the single source of truth for AI agents working on this project.
> Fill in every section before your first AI-assisted development session.
> An AI that reads this file knows your constraints and won't guess wrong.

---

## Project Identity

- **Name:** ${ctx.projectName}
- **Description:** [One sentence — what does this product do for the user?]
- **Team size:** [N developers]
- **Owner / Contact:** [name or team]
- **Created:** ${today}

---

## Scale Target

- **Expected daily active users (DAU):** [e.g., 1,000 / 10,000 / 100,000]
- **Peak concurrent users:** [e.g., 500 simultaneous]
- **Data growth per year:** [e.g., 10GB / 1TB]
- **Availability SLA:** [e.g., 99.9% = ~8.7h downtime/year]
- **Geographic distribution:** [Single region / Multi-region]

---

## Rendering Strategy

| Surface | Strategy | Revalidation |
|---|---|---|
| Public frontend | [ ] SSG [ ] SSR [ ] ISR [x] CSR | e.g., 60 seconds |
| Admin frontend | [ ] SSG [ ] SSR [ ] ISR [x] CSR | N/A (private) |
| API | N/A | N/A |

**ISR revalidation triggers:** [e.g., on-demand via webhook when content changes]

---

## Security Model

- **Auth provider:** ${ctx.includeSupabase ? 'Supabase Auth (JWT, RS256)' : '[Specify: Clerk / Auth.js / custom]'}
- **Session strategy:** ${ctx.includeAuth ? 'JWT Bearer token in Authorization header' : '[Specify: cookie / JWT / both]'}
- **RBAC roles defined:** [e.g., viewer, editor, admin]
- **Actions that require human approval:** [e.g., deleting published content, changing billing]
- **Actions that are deliberately NOT automatable:** [e.g., admin grant changes, irreversible deletes]

---

## Data Layer

- **Database platform:** ${ctx.includeSupabase ? 'Supabase (PostgreSQL 15)' : '[PostgreSQL / MySQL / SQLite / other]'}
- **Connection pooler:** [Supabase Transaction Mode (port 6543) / PgBouncer / none]
- **Read replica strategy:** [None / Supabase read replicas / other]
- **Backup frequency:** [Continuous PITR / Daily snapshots / None — FILL THIS IN]
- **Soft delete convention:** [ ] Yes — \`deleted_at\` column [ ] No — hard deletes

---

## Caching Strategy

| Layer | Tool | TTL | Invalidation trigger |
|---|---|---|---|
| Browser | Cache-Control headers | Static: 1yr, Pages: 0 | On deploy |
| CDN | Vercel Edge / Cloudflare | [N] seconds | On-demand revalidation |
| Application | [Redis / none] | [N] seconds | On mutation |
| Database | [Materialized views / none] | [N] | Scheduled refresh |

---

## Deployment Target

- **API hosting:** ${ctx.deployTarget === 'vercel-railway' ? 'Railway' : ctx.deployTarget === 'flyio' ? 'Fly.io' : 'Docker / Self-Hosted'}
- **Frontend hosting:** ${ctx.deployTarget === 'vercel-railway' ? 'Vercel' : ctx.deployTarget === 'flyio' ? 'Fly.io' : 'Docker / Self-Hosted'}
- **Database hosting:** ${ctx.includeSupabase ? 'Supabase' : '[Specify]'}
- **Rollback mechanism:** [Vercel instant rollback / Railway rollback / manual]
- **Preview deployments:** [ ] Yes — for every PR [ ] No

---

## AI Interaction Context

- **Design mode:** Editorial Minimalism (Tumaal default) — override only with explicit instruction
- **Approved tech stack:** [List the exact packages the AI should use — no substitutions without asking]
- **Constraints for AI agents:**
  - NEVER add new dependencies without asking first
  - NEVER write files > 200 lines
  - ALWAYS validate environment variables with Zod at startup
  - ALWAYS use the existing \`${ctx.packageScope}/shared-schemas\` for Zod types
  - NEVER store state in process memory (use DB or Redis)
  - ALWAYS run the adversarial-review skill before suggesting a merge

---

## Key Architectural Decisions (ADR Log)

| Date | Decision | Rationale | Trade-off accepted |
|------|----------|-----------|-------------------|
| ${today} | Chose ${ctx.includeSupabase ? 'Supabase' : '[DB]'} for data layer | [why] | [what we gave up] |
| | | | |

---

## Known Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [e.g., Supabase outage] | Low | High | [e.g., read replica, graceful degradation] |
| | | | |
`;
}
