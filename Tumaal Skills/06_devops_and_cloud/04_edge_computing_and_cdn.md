# EDGE COMPUTING AND CDN

## EDGE FUNCTIONS

- **ALWAYS** prefer Edge functions for:
  - Authentication and authorization middleware (token validation, redirects).
  - Geolocation-based routing and personalization.
  - Request/response header manipulation.
  - A/B testing and feature flag evaluation.
  - Bot detection and rate limiting.
- **NEVER** use Edge functions for:
  - Long-running computations (Edge has strict execution time limits, typically 5-30 seconds).
  - Heavy database operations (Edge is optimized for low-latency, lightweight logic).
  - Operations requiring large dependencies (Edge bundles have size limits).

## STATIC CACHING

- **ALWAYS** prefer Edge caching for static, read-heavy, non-personalized operations. This reduces main server load and dramatically decreases latency for end users.
- **ALWAYS** serve static assets (images, CSS, JS, fonts, videos) through a CDN. NEVER serve static files from the application server in production.
- **ALWAYS** use content-hash fingerprinting in static asset filenames (e.g., `app.a1b2c3.js`) to enable aggressive, long-lived caching with instant invalidation on deploy.

## CDN CONFIGURATION

- **ALWAYS** configure appropriate `Cache-Control` headers per asset type:
  - Fingerprinted assets: `public, max-age=31536000, immutable`
  - HTML pages: `public, max-age=0, must-revalidate` (or `s-maxage` for CDN-only caching)
  - API responses: `private, no-store` (unless explicitly designed for CDN caching)
- **ALWAYS** configure CDN origin shields to reduce cache miss traffic to your origin server.
- **ALWAYS** set up CDN cache purging as part of the deployment pipeline. Stale cached assets after deployment cause broken UIs.

## CDN INVALIDATION

- **ALWAYS** automate CDN cache invalidation on deployment. Manual invalidation is error-prone and causes user-facing bugs.
- **ALWAYS** prefer path-based invalidation (invalidate specific paths) over full-cache purges. Full purges cause a thundering herd of requests to the origin.
- **ALWAYS** monitor CDN cache hit ratios. A hit ratio below 80% indicates misconfigured caching headers or highly dynamic content that should not be cached.

## MULTI-REGION DEPLOYMENT

- **WHEN** the application serves users across multiple geographic regions:
  - **ALWAYS** deploy to multiple CDN edge locations for static assets (this is usually automatic with major CDN providers).
  - **ALWAYS** use DNS-based routing to direct users to the nearest application server region.
  - **ALWAYS** account for data replication lag between regions. See `01_system_design_and_architecture/03_database_scaling.md` for read replica consistency rules.

## EDGE SECURITY

- **ALWAYS** implement WAF (Web Application Firewall) rules at the CDN/Edge layer for DDoS protection, bot filtering, and geographic blocking.
- **ALWAYS** terminate TLS at the CDN edge. Internal traffic between CDN and origin may use HTTP or mTLS depending on security requirements.
- **NEVER** expose origin server IP addresses publicly. Route all traffic through the CDN/reverse proxy.
