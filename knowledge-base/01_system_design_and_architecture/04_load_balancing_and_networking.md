# LOAD BALANCING AND NETWORKING

## LOAD BALANCING DECISION FRAMEWORK

- **ALWAYS** place a load balancer in front of any service that runs more than one instance. Direct client-to-server connections do not scale.
- **ALWAYS** choose the load balancing algorithm based on workload characteristics:
  - **Round Robin:** WHEN all servers have identical capacity and requests have similar processing times.
  - **Least Connections:** WHEN request processing times vary significantly (e.g., some requests hit cache, others hit DB).
  - **IP Hash / Sticky Sessions:** WHEN the application requires session affinity (AVOID this; prefer stateless design instead).
  - **Weighted Round Robin:** WHEN servers have different capacities (e.g., mixed instance types).
- **NEVER** rely on sticky sessions as a primary architecture. They break horizontal scaling and complicate failover.

## REVERSE PROXY

- **ALWAYS** place a reverse proxy (e.g., Nginx, Caddy, cloud load balancer) in front of application servers. NEVER expose application servers directly to the internet.
- **ALWAYS** terminate TLS/SSL at the reverse proxy or load balancer. Application servers should handle only plaintext HTTP internally.
- **ALWAYS** configure the reverse proxy to add security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).

## DNS AND DOMAIN ARCHITECTURE

- **ALWAYS** use DNS-level load balancing (e.g., Route 53, Cloudflare) for multi-region deployments. Route users to the nearest healthy region.
- **ALWAYS** set appropriate TTLs on DNS records:
  - Low TTL (60-300s) for records that may need rapid failover.
  - High TTL (3600s+) for stable records to reduce DNS lookup latency.
- **NEVER** hardcode IP addresses in application configuration. ALWAYS use DNS names to enable seamless infrastructure changes.

## CDN ROUTING

- **ALWAYS** serve static assets (images, CSS, JS, fonts) through a CDN. NEVER serve static files from the application server in production.
- **ALWAYS** use cache-busting techniques (content hashing in filenames) for static assets to enable aggressive CDN caching.
- **ALWAYS** configure CDN origin shields to reduce the number of requests hitting your origin server during cache misses.

## HEALTH CHECKS AND FAILOVER

- **ALWAYS** implement health check endpoints (`/health` or `/healthz`) that verify:
  - The application process is running.
  - Critical dependencies (database, cache) are reachable.
- **ALWAYS** configure load balancers to remove unhealthy instances from the pool automatically.
- **NEVER** return a healthy status if a critical dependency is down. A server that cannot serve requests correctly MUST report unhealthy.

## RATE LIMITING

- **ALWAYS** implement rate limiting at the load balancer or API gateway level to protect backend services from abuse.
- **ALWAYS** return `429 Too Many Requests` with a `Retry-After` header when rate limits are exceeded.
- **NEVER** implement rate limiting only at the application level. Malicious traffic should be blocked before it reaches your application servers.

## SERVICE MESH AND INTER-SERVICE COMMUNICATION

- **ALWAYS** use service discovery (DNS-based or registry-based) for inter-service communication. NEVER hardcode service addresses.
- **ALWAYS** implement circuit breakers for inter-service calls. If a downstream service is failing, stop sending requests to it temporarily to prevent cascading failures.
- **ALWAYS** set timeouts on all inter-service HTTP calls. NEVER allow a request to hang indefinitely waiting for a downstream response.
