# CACHING STRATEGIES

## CACHING DECISION FRAMEWORK

- **ALWAYS** implement caching in layers. Each layer serves a different purpose:
  1. **Browser/Client Cache:** For static assets (images, CSS, JS). Set `Cache-Control` headers.
  2. **CDN/Edge Cache:** For public, non-personalized content. Offload from origin servers.
  3. **Application Cache:** For computed results, serialized responses, or session data (e.g., Redis, Memcached).
  4. **Database Query Cache:** For expensive, repeated queries. Use materialized views or ORM-level caching.
- **NEVER** cache sensitive or user-specific data at the CDN layer without explicit per-user cache keys.

## WHEN TO CACHE

- **ALWAYS** cache when:
  - The data is read far more often than it is written (read-heavy).
  - The computation to generate the data is expensive (complex joins, aggregations).
  - The data can tolerate staleness for a defined period.
- **NEVER** cache when:
  - Data must be real-time accurate (e.g., account balances during transactions).
  - The cache hit rate would be extremely low (highly unique queries).
  - The data changes on nearly every request.

## CACHE INVALIDATION

- **ALWAYS** invalidate cache on mutation. Whenever a CREATE, UPDATE, or DELETE action succeeds, you MUST instantly invalidate or update the relevant cache entries.
- **NEVER** rely solely on TTL (Time-To-Live) expiration for data that users expect to see immediately after mutation. Combine TTL with event-driven invalidation.
- **ALWAYS** prefer write-through or write-behind caching for critical data paths:
  - **Write-Through:** Write to cache and database simultaneously. Consistent but slower writes.
  - **Write-Behind:** Write to cache first, asynchronously persist to database. Faster writes but risk data loss.
  - **Cache-Aside (Lazy Loading):** Read from cache first; on miss, read from DB and populate cache. Best for read-heavy workloads.

## CACHE KEY DESIGN

- **ALWAYS** design cache keys to be deterministic and collision-free. Include entity type, ID, and version/hash.
- **NEVER** use user-controlled input directly as a cache key without sanitization. This prevents cache poisoning attacks.
- **ALWAYS** namespace cache keys by environment (e.g., `prod:users:123`, `staging:users:123`) to prevent cross-environment contamination.

## CDN CACHING

- **ALWAYS** prefer Edge caching for static, read-heavy, non-personalized operations. This reduces main server load and dramatically decreases latency.
- **ALWAYS** set appropriate `Cache-Control` headers:
  - `public, max-age=31536000, immutable` for fingerprinted static assets.
  - `public, max-age=0, must-revalidate` for HTML pages that may change.
  - `private, no-store` for authenticated or sensitive responses.
- **NEVER** cache API responses at the CDN level unless you explicitly control the cache key and invalidation strategy.

## APPLICATION-LEVEL CACHING

- **ALWAYS** use an external cache store (e.g., Redis, Memcached) instead of in-process memory caching for multi-instance deployments. In-process caches desynchronize across instances.
- **ALWAYS** set TTLs on all cache entries. NEVER allow cache entries to live indefinitely — this causes unbounded memory growth.
- **ALWAYS** implement cache stampede protection (e.g., locking, probabilistic early expiration) for high-traffic keys that expire simultaneously.

## DATABASE QUERY CACHING

- **ALWAYS** prefer materializing expensive aggregations into summary tables or materialized views rather than caching raw query results.
- **NEVER** cache queries that include user-specific filters at a shared level. Each user's result set must be cached independently or not at all.
