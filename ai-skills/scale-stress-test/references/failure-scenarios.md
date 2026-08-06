# Scale Failure Scenarios — Reference Playbook

Detailed failure playbooks for the `scale-stress-test` skill.
Each scenario includes: trigger, failure mechanism, user impact, detection signal, and fix.

---

## Scenario 1: Database Connection Pool Exhaustion

**Trigger:** Concurrent requests exceed the connection pool size.

**Mechanism:**
```
pool_size = 20 connections
average_request_time = 500ms (holding connection)
max_safe_RPS = pool_size / request_time = 20 / 0.5s = 40 RPS

At 41 RPS:
- Connection 21 waits for a pool slot
- wait time grows → timeout → 500 error
- Timeouts stack → latency spikes for ALL users
- DB CPU: ~0% (it's idle, waiting) — misleading metric
```

**User Impact:** 500 errors and 30-second timeouts. Appears intermittent (race condition).

**Detection Signal:** `connection pool timeout` in error logs; DB CPU low while app CPU high.

**Fixes in order of impact:**
1. Enable connection pooler (PgBouncer Transaction Mode, or Supabase port 6543)
   → Multiplexes thousands of app connections to 20 DB connections
2. Increase pool size (if DB can support it)
3. Reduce query duration (indexes, query optimization)
4. Move slow queries to async background jobs

**Calculation template:**
```
safe_concurrent_users = pool_size × (1 / avg_hold_time_seconds)
e.g., pool=20, avg=200ms → 100 safe concurrent users
```

---

## Scenario 2: In-Memory State Desynchronization

**Trigger:** Second server instance deployed (horizontal scaling, rolling deploy, or crash restart).

**Mechanism:**
```
Instance A: Map { "session_abc123": { userId: 1 } }
Instance B: Map { } (empty — different process memory)

Load balancer routes request to Instance B → session not found → 401 → user logged out
```

**User Impact:** Random 401 errors and unexpected logouts. Appears to affect ~50% of requests
(whichever percentage hit the instance without the state).

**Detection Signal:** Users report "logged out randomly"; 401 errors spike during deploys.

**Fix:**
Replace in-process state with:
- **Sessions:** Cookie-based (Supabase SSR) or Redis-backed
- **Caches:** Redis with shared TTL
- **Queues:** Database-backed (pg-boss) or managed queue (SQS, Upstash)
- **Flags/Config:** DB-backed with per-request read (cached in Redis)

**Rule:** RAM-only is acceptable ONLY for:
- A cache in front of a durable store (cache miss falls back to DB)
- Genuinely disposable, re-derivable state (no business logic depends on it surviving)

---

## Scenario 3: CDN Cache Miss Storm (Origin Overwhelm)

**Trigger:** High traffic to pages with no CDN caching, or CDN cache expiry during a spike.

**Mechanism:**
```
100K users hit the homepage simultaneously
Each request: CDN miss → origin server → DB query → response
Origin: 100K × 200ms DB queries = 20,000 concurrent DB queries
DB: overwhelmed → latency spikes → timeouts → cascade failure
```

**User Impact:** Homepage becomes slow or unavailable. API still works (different path).

**Detection Signal:** Origin server CPU 100%; CDN cache hit rate near 0%; DB CPU spikes on read-only queries.

**Fixes:**
1. Enable ISR (Next.js `next: { revalidate: N }`) — one origin request serves all users for N seconds
2. Set CDN `Cache-Control: public, max-age=300, stale-while-revalidate=600` on public pages
3. Use Next.js `generateStaticParams` for known routes → fully static, zero origin load
4. Implement On-Demand Revalidation: only hit origin when data actually changes

**Cache-Control header strategy:**
```
Static assets (images, JS, CSS): public, max-age=31536000, immutable
HTML pages (ISR): public, s-maxage=300, stale-while-revalidate=600
Authenticated pages: private, no-store
API responses (public): public, max-age=60
API responses (authenticated): private, no-store
```

---

## Scenario 4: N+1 Query Amplification

**Trigger:** A list endpoint fetches related data in a loop.

**Mechanism:**
```
GET /api/posts?limit=100

1. SELECT * FROM posts LIMIT 100           → 1 query
2. for each post:
     SELECT * FROM authors WHERE id = ?    → 100 queries
     SELECT COUNT(*) FROM comments WHERE post_id = ? → 100 queries
TOTAL: 201 queries per request

At 50 concurrent users: 201 × 50 = 10,050 queries/second
DB connection pool = 20 → immediately exhausted → cascade failure
```

**Detection Signal:** DB query count is 50–200× higher than expected; slow endpoint latency grows linearly with data volume.

**Fixes:**
1. JOIN: `SELECT posts.*, authors.name FROM posts JOIN authors ON posts.author_id = authors.id`
2. DataLoader (batching): batch all author IDs → single `WHERE id IN (...)` query
3. Include/eager-load in ORM: `db.posts.findMany({ include: { author: true, _count: { comments: true } } })`
4. Materialized view: pre-compute the joined result in DB

---

## Scenario 5: Missing Rate Limiting (DDoS / Abuse)

**Trigger:** Malicious or runaway client sends unbounded requests.

**Mechanism:**
```
Attacker: 10,000 requests/second to POST /api/login
Each request: DB query (SELECT user WHERE email = ?) + bcrypt compare (~100ms CPU)

10,000 RPS × 100ms CPU = DB overwhelmed + CPU saturated
Legitimate users: 503 Service Unavailable
```

**Detection Signal:** CPU at 100%; DB queries spike; legitimate traffic 503s; single IP dominates access logs.

**Fix Layers (apply all — defense in depth):**
1. **Infrastructure** (first line): Cloudflare / Vercel Edge rate limiting → blocks before hitting app
2. **Application** (second line): Rate limiting middleware per IP + per user
3. **Endpoint-specific**: Auth endpoints: 5 req/min; Public read: 100 req/min; Mutations: 30 req/min
4. **Response**: `429 Too Many Requests` with `Retry-After` header
5. **Monitoring**: Alert when 429 rate exceeds 1% of traffic

---

## Scenario 6: Synchronous CPU Work in Event Loop (Node.js)

**Trigger:** CPU-intensive operation runs in the main request handler.

**Mechanism:**
```
Node.js: single-threaded event loop
POST /api/upload → process image (CPU-intensive: 2 seconds)

During those 2 seconds: event loop is BLOCKED
All other requests: queued, not processed
At 5 concurrent uploads: all users wait 10 seconds for any response
```

**Detection Signal:** Event loop lag metrics spike; ALL endpoints slow during specific operations; CPU 100% on single core.

**Affected operations:**
- Image/video processing (sharp, ffmpeg)
- PDF generation
- Complex cryptographic operations (bcrypt with high rounds)
- Large JSON serialization
- Synchronous file reads in hot paths

**Fixes:**
1. Move to background worker / async queue (pg-boss, BullMQ)
2. Use worker threads (`worker_threads` module) for CPU-bound work
3. Use streaming instead of buffering large responses
4. For bcrypt: ensure it's using the async API (`bcrypt.hash()`, not `bcrypt.hashSync()`)

---

## Scenario 7: Missing Pagination (Unbounded Query)

**Trigger:** Data volume grows beyond what a single response can handle.

**Mechanism:**
```
At launch: GET /api/posts → 50 records → 50KB response → fast
At 6 months: GET /api/posts → 50,000 records → 50MB response → OOM + timeout
At 12 months: GET /api/posts → 500,000 records → server crashes
```

**User Impact:** Endpoint becomes progressively slower as data grows; eventually causes OOM crashes.

**Detection Signal:** Response times grow week-over-week on list endpoints; memory usage spikes; occasional 503s.

**Fix:**
```typescript
// Cursor-based pagination (preferred for large datasets)
app.get('/api/posts', async (c) => {
  const { cursor, limit = 20 } = c.req.query();
  const posts = await db.posts.findMany({
    take: Math.min(Number(limit), 100), // cap at 100
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ posts, nextCursor: posts[posts.length - 1]?.id });
});
```

---

## Scale Threshold Quick-Reference

| Component | Safe Limit (default config) | Fix at limit |
|---|---|---|
| PostgreSQL direct connections | ~50 concurrent | Add PgBouncer / Supabase pooler |
| Node.js event loop (single core) | ~2,000 RPS simple ops | Horizontal scale / offload CPU work |
| Supabase Free tier connections | 15 | Upgrade or add pooler |
| Next.js ISR without CDN | ~100 RPS | Enable CDN |
| bcrypt (cost=12, sync) | ~10 RPS | Use async + queue |
| In-memory session store | 1 instance | Redis |
| Unpaginated list query | ~10,000 records | Add LIMIT/cursor |
