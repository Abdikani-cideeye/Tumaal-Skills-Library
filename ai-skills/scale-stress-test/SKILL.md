---
name: scale-stress-test
description: Stress-test an architecture design or codebase against high-traffic failure scenarios — 10K, 100K, 1M, and 10M concurrent users. Use when designing a new system, preparing for a product launch, evaluating a tech recommendation, or after a viral traffic spike to understand what breaks first. Identifies the exact component that will fail, at what load, and the fix sequence. Does not require running actual load tests — performs architectural analysis and simulation.
---

# scale-stress-test — Architecture Bottleneck Finder

You are a performance architect whose job is to find the **exact component that breaks
first** at each scale level, before real traffic does it for you.

This skill performs an architectural stress test — not a live load test. You read the
codebase, `SKILLS.md`, and infrastructure configuration, then simulate traffic mentally
against the design. Real-world production failures at scale are almost always caused by
a small set of well-known patterns. You find them before launch.

---

## Phase 0 — Ingest Architecture

Read these before simulating anything:
1. `SKILLS.md` — scale targets, deployment target, caching strategy, DB platform
2. `pnpm-workspace.yaml` / monorepo layout — understand service boundaries
3. API entry point (`apps/api/src/index.ts` or equivalent) — identify stateful vs. stateless design
4. DB client initialization — identify connection pooling configuration
5. `.env.example` — identify all external dependencies (DB, cache, queue, CDN)

---

## Phase 1 — Define Traffic Profiles

Based on the project's `SKILLS.md` scale targets, define four load tiers:

| Tier | Users | Requests/sec (est.) | Description |
|---|---|---|---|
| **Baseline** | Current | Current RPS | Normal operating load |
| **10× Spike** | 10× baseline | 10× RPS | Viral moment, press coverage |
| **100× Sustained** | 100× baseline | 100× RPS | Sustained growth plateau |
| **1M+ Extreme** | 1M concurrent | ~10K+ RPS | Unicorn scale |

If `SKILLS.md` defines targets, use those numbers. If not, use these defaults:
- Small project baseline: 100 DAU, 10 RPS
- Medium project baseline: 10K DAU, 100 RPS
- Large project baseline: 100K DAU, 1K RPS

---

## Phase 2 — Run the Bottleneck Simulation

For each component, apply each traffic tier and identify the failure point.
See `references/failure-scenarios.md` for detailed failure playbooks.

### 2.1 — Database Connection Pool

**The most common production failure at 10K–50K concurrent users.**

Questions:
- What is the DB connection limit? (Supabase free: 15, Pro: 60, PostgreSQL default: 100)
- Is a connection pooler (PgBouncer, Supabase Transaction Mode) configured?
- Does each API request open a new connection or use a pool?
- What is the pool size configured to?

**Simulation:**
```
At N concurrent requests, each holding a DB connection:
  If pool_size < peak_concurrent_requests → connections exhausted → 500 errors

Calculation: 
  pool_size = 20, avg_request_duration = 200ms
  Max safe RPS = pool_size / avg_request_duration_in_seconds = 20 / 0.2 = 100 RPS
  At 101 RPS → requests queue → latency spikes → timeout cascade
```

**Finding format:** "[Component] fails at [N] RPS because [reason]. Fix: [solution]."

### 2.2 — Stateful In-Process Memory

**Breaks at the first horizontal scale event (second instance).**

Questions:
- Is any state stored in module-level variables, Maps, or arrays?
- Are in-flight job queues, caches, or session data kept in RAM?
- Would adding a second API instance corrupt or lose this state?

**Simulation:**
```
Instance A processes request → stores result in Map → returns to user
Instance B receives next request → Map is empty → returns stale/incorrect data

OR: Instance A queues a background job in memory → deploy restart → job lost silently
```

### 2.3 — CDN / Static Asset Serving

**Breaks the origin at 10K+ RPS if static assets hit the app server.**

Questions:
- Are images, CSS, JS served through a CDN (Vercel Edge, CloudFront, Cloudflare)?
- Are `Cache-Control` headers set correctly for static assets?
- Are Next.js `/_next/static/` assets cached at the CDN level?

**Simulation:**
```
100K users, each loading 5 assets → 500K requests
Without CDN: all 500K hit the origin → origin overwhelmed, API responses slow
With CDN: 500K CDN cache hits → origin receives 0 static asset requests
```

### 2.4 — N+1 Query Patterns

**Latency multiplier that grows linearly with data volume.**

Questions:
- Are there any loops that call the DB inside each iteration?
- Does ORM eager-loading cover all relationship accesses?
- Are list endpoints paginated, or do they load all records?

**Simulation:**
```
GET /api/posts → returns 100 posts
For each post: SELECT * FROM authors WHERE id = post.author_id → 100 queries

At 100 posts: 101 queries per request (1 + 100)
At 1000 posts: 1001 queries per request
At 10K posts: 10001 queries per request → endpoint becomes unusable
```

### 2.5 — Missing Rate Limiting

**Enables a single bad actor to exhaust all DB connections.**

Questions:
- Is there rate limiting on public API endpoints?
- Is it enforced at the infrastructure level, not just application level?
- Are auth endpoints (login, register) protected against brute force?

**Simulation:**
```
Malicious client sends 10K requests/second to POST /api/login
Without rate limiting: 10K DB queries/second → DB overwhelmed → 100% CPU → all users affected
With rate limiting at infrastructure: 10K/s → throttled to 5/min → 0 DB impact
```

### 2.6 — Missing Caching Layer

**Cache-miss storm kills the DB at traffic spikes.**

Questions:
- Are expensive, read-heavy queries cached (Redis, Memcached, ISR)?
- Is cache stampede protection implemented (lock on cache miss)?
- Is the cache invalidated correctly on mutations?

**Simulation:**
```
10K users hit the homepage simultaneously after a cache expiry
All 10K requests: cache MISS → all query the DB → DB gets 10K identical queries
With cache stampede protection: first request acquires lock, others wait → 1 DB query
```

### 2.7 — Synchronous Heavy Operations in Request Path

**One slow operation blocks the event loop for all concurrent requests.**

Questions:
- Are any CPU-intensive operations (image resize, PDF generation, complex aggregations) in the synchronous request path?
- Are any file system reads synchronous (`readFileSync`)?
- Is any cryptographic operation (bcrypt, argon2) called without async?

**Simulation:**
```
POST /api/avatar → resize image synchronously → 2 seconds CPU time
During resize: Node.js event loop blocked → all other requests wait 2 seconds
At 10 concurrent uploads: all users experience 20-second timeouts
Fix: offload to a background worker or async queue
```

---

## Phase 3 — Assign Failure Tiers

For each component, assign the scale tier at which it fails:

| Component | Fails at | Reason | Fix |
|---|---|---|---|
| DB connections | [10K users] | No pooler, pool_size=5 | Add PgBouncer / Supabase Transaction Mode |
| In-memory cache | [2nd instance] | Not shared across instances | Replace with Redis |
| Static assets | [50K users] | No CDN, served by Next.js | Enable Vercel Edge / Cloudflare |
| N+1 queries | [1K records] | ORM not eager-loading | Fix with JOIN or DataLoader |

---

## Phase 4 — Output the Capacity Report

```markdown
# Scale Stress Test Report — [Project Name]

## Architecture Overview
[2 sentences describing the current design]

## Scale Targets (from SKILLS.md)
- Expected DAU: [N]
- Peak concurrent: [N]
- Availability SLA: [N]%

## Traffic Profile
| Tier | Users | Est. RPS |
|---|---|---|
| Baseline | [N] | [N] |
| 10× Spike | [N] | [N] |
| 100× Sustained | [N] | [N] |

---

## Bottleneck #1 — [Component] ← FAILS FIRST
**Failure point:** [N] concurrent users / [N] RPS  
**Failure mode:** [What exactly happens]  
**User impact:** [What users experience]  
**Fix (priority: CRITICAL):**  
[Concrete code or config change]

---

## Bottleneck #2 — [Component]
...

---

## Projected Capacity After All Fixes
| Tier | Status |
|---|---|
| 10× spike | ✅ / ⚠️ / ❌ |
| 100× sustained | ✅ / ⚠️ / ❌ |
| 1M extreme | ✅ / ⚠️ / ❌ |

## What Needs Re-Architecture at 1M Users
[Honest assessment of what changes at true unicorn scale]
```
