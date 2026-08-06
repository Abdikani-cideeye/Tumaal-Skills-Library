# Audit Report — Example Project

**Date:** 2025-01-15
**Auditor:** Tumaal Audit Skill
**Overall Risk:** 🔴 CRITICAL

## Executive Summary

The project has two critical vulnerabilities that block production launch: a wildcard CORS
origin on an authenticated endpoint and a missing Zod schema on the `/api/users` route
allowing arbitrary JSON bodies. The architecture also stores session state in process
memory, which will cause random logouts the moment a second server instance is deployed.

---

## Findings

### 🔴 CRITICAL — Wildcard CORS on Authenticated Endpoint

**File:** `src/index.ts:23`
**Rule:** Security > CORS
**Risk:** Any website on the internet can make authenticated requests to this API on behalf
of a logged-in user. An attacker hosts `evil.com`, which silently calls
`POST /api/transfer` using the victim's session cookie. Because CORS allows all origins
and credentials are enabled, the browser sends the cookie — the request succeeds.

**Fix:**
```typescript
// BEFORE (vulnerable)
app.use(cors({ origin: '*', credentials: true }));

// AFTER (safe)
app.use(cors({
  origin: [
    'https://app.example.com',
    'https://admin.example.com',
    process.env.ADMIN_FRONTEND_URL ?? '',
  ].filter(Boolean),
  credentials: true,
}));
```

---

### 🔴 CRITICAL — Unvalidated Request Body on User Route

**File:** `src/routes/users.ts:41`
**Rule:** Security > Input Validation
**Risk:** Any JSON body is accepted and passed directly to the ORM. An attacker can
send `{ "role": "admin", "isActive": true }` to escalate their own privileges.

**Fix:**
```typescript
// BEFORE (vulnerable)
app.post('/api/users', async (req, res) => {
  const user = await db.users.create(req.body); // arbitrary fields accepted
});

// AFTER (safe)
const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

app.post('/api/users', zValidator('json', updateUserSchema), async (c) => {
  const body = c.req.valid('json'); // only validated fields accessible
  const user = await db.users.create(body);
});
```

---

### 🟠 HIGH — Session State in Process Memory

**File:** `src/lib/session-store.ts:8`
**Rule:** Architecture > Statefulness
**Risk:** Sessions are stored in a module-level `Map`. This works with one server instance.
The moment a load balancer routes a request to a second instance, the session is not found
and the user is logged out. On Vercel, Railway, or any cloud platform, this happens on
every new deployment.

**Fix:** Replace with Redis or use `@supabase/ssr` cookie-based sessions.

```typescript
// BEFORE (broken at horizontal scale)
const sessions = new Map<string, Session>(); // dies on deploy

// AFTER (durable)
import { createClient } from 'redis';
const redis = createClient({ url: env.REDIS_URL });
await redis.set(`session:${token}`, JSON.stringify(session), { EX: 3600 });
```

---

### 🟠 HIGH — Missing Supply-Chain Cooldown

**File:** `.npmrc` (missing)
**Rule:** Security > Dependency Security
**Risk:** Without `min-release-age`, a compromised npm package version published and yanked
within 12 hours can enter your lockfile during `npm install`. The window is small but the
impact is catastrophic (remote code execution in CI or production).

**Fix:** Create `.npmrc` with:
```
min-release-age=7
```

---

### 🟡 MEDIUM — No Connection Pooler Configured

**File:** `packages/database/src/client.ts:5`
**Rule:** Performance > Database
**Risk:** The Prisma client connects directly to PostgreSQL. At ~50 concurrent requests,
PostgreSQL's connection limit is reached and new requests fail with
`too many connections for role "postgres"`.

**Fix:** Enable Supabase Transaction Mode pooling (port 6543 instead of 5432), or
add PgBouncer. Update `DATABASE_URL` in `.env.example` to document this.

---

### 🟡 MEDIUM — Missing ISR on Homepage

**File:** `apps/frontend/src/app/page.tsx:12`
**Rule:** Performance > Caching
**Risk:** The homepage fetches destination data on every request (SSR with no revalidation).
Under traffic spikes, every concurrent user generates a DB query. With ISR, one cached
response serves 10,000 users.

**Fix:**
```typescript
// Add revalidation to the data fetch
const destinations = await fetch('/api/destinations', {
  next: { revalidate: 60 }, // cache for 60 seconds, auto-invalidate
});
```

---

### 🟡 MEDIUM — CI Pipeline Missing Security Scan Stage

**File:** `.github/workflows/ci.yml`
**Rule:** CI/CD > Pipeline Stages
**Risk:** Known vulnerabilities in dependencies are not caught before deploy. A dependency
with a critical CVE can silently ship to production.

**Fix:** Add to `ci.yml`:
```yaml
security:
  name: Security Scan
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm audit --audit-level=high
```

---

### 🟢 INFO — 3 Files Exceed 200-Line Limit

**Files:**
- `src/routes/users.ts` — 287 lines
- `src/lib/auth.ts` — 312 lines
- `apps/frontend/src/app/dashboard/page.tsx` — 244 lines

**Rule:** Code Quality > File Size (Tumaal Global Constraint)
**Risk:** Large files indicate mixed responsibilities. Harder to test and review.
**Fix:** Extract logical sections into focused sub-modules.

---

## Passed Checks

- ✅ JWT verified via `supabase.auth.getUser()` (not just decoded)
- ✅ `.gitignore` includes `.env`, `.env.local`, all variants
- ✅ `.env.example` committed without real secrets
- ✅ Security headers middleware applied globally (`X-Frame-Options`, `HSTS`, etc.)
- ✅ All list endpoints paginated (no unbounded `findAll`)
- ✅ TypeScript strict mode enabled
- ✅ Dependabot configured for all workspaces

---

## Priority Fix Order

1. 🔴 Wildcard CORS — immediate exploit risk
2. 🔴 Unvalidated request body — privilege escalation risk
3. 🟠 In-memory session store — will break on first horizontal scale event
4. 🟠 Add `.npmrc` `min-release-age=7`
5. 🟡 Enable Supabase connection pooler
6. 🟡 Add ISR to homepage data fetch
7. 🟡 Add security scan to CI pipeline
8. 🟢 Refactor 3 oversized files
