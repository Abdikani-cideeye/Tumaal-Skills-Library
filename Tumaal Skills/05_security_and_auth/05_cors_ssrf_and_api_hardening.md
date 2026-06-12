# CORS, SSRF, AND API HARDENING

## CORS CONFIGURATION

- **ALWAYS** configure CORS (Cross-Origin Resource Sharing) explicitly. NEVER use `Access-Control-Allow-Origin: *` on authenticated endpoints.
- **ALWAYS** whitelist specific, trusted origins. Use an exact match list or a validated regex pattern for allowed origins.
- **ALWAYS** restrict `Access-Control-Allow-Methods` to only the HTTP methods your API actually supports.
- **ALWAYS** restrict `Access-Control-Allow-Headers` to only the headers your API actually requires.
- **NEVER** set `Access-Control-Allow-Credentials: true` with a wildcard origin. This is blocked by browsers but indicates a misconfiguration.
- **ALWAYS** set `Access-Control-Max-Age` to cache preflight responses and reduce OPTIONS request overhead.

## SSRF (SERVER-SIDE REQUEST FORGERY) PREVENTION

- **NEVER** allow user-supplied URLs to be fetched directly by the server without validation. Attackers can use SSRF to access internal services, metadata endpoints, and private networks.
- **ALWAYS** validate and sanitize user-supplied URLs:
  - Resolve the URL to an IP address and reject private/internal IP ranges (`10.x.x.x`, `172.16.x.x`, `192.168.x.x`, `127.0.0.1`, `169.254.169.254`).
  - Reject non-HTTP/HTTPS protocols.
  - Use an allowlist of permitted domains when possible.
- **ALWAYS** enforce egress firewall rules on servers to restrict which external services they can communicate with.
- **NEVER** allow the server to fetch cloud metadata endpoints (e.g., `http://169.254.169.254/`) based on user input. This is the most common cloud SSRF attack vector.

## HTTP SECURITY HEADERS

- **ALWAYS** set the following security headers on all responses:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` — Forces HTTPS.
  - `X-Content-Type-Options: nosniff` — Prevents MIME type sniffing.
  - `X-Frame-Options: DENY` or `SAMEORIGIN` — Prevents clickjacking.
  - `X-XSS-Protection: 0` — Disable legacy XSS filter (rely on CSP instead).
  - `Referrer-Policy: strict-origin-when-cross-origin` — Limits referrer information leakage.
  - `Permissions-Policy` — Restrict access to browser features (camera, microphone, geolocation).
- **ALWAYS** implement Content Security Policy (CSP) headers. See `03_xss_csrf_and_injection.md` for CSP details.

## RATE LIMITING

- **ALWAYS** implement rate limiting on all public-facing API endpoints, especially authentication endpoints (login, registration, password reset).
- **ALWAYS** return `429 Too Many Requests` with a `Retry-After` header when limits are exceeded.
- **ALWAYS** implement graduated rate limiting: stricter limits on sensitive endpoints (login: 5 attempts/minute) and looser limits on read-only endpoints (100 requests/minute).
- **NEVER** implement rate limiting only at the application level. Use infrastructure-level rate limiting (API gateway, load balancer, WAF) as the first line of defense.

## API HARDENING

- **ALWAYS** disable server version headers and framework fingerprinting headers (e.g., `X-Powered-By`, `Server`). These expose technology stack information to attackers.
- **ALWAYS** implement request size limits on all endpoints. Reject payloads exceeding a reasonable maximum (e.g., 10MB for file uploads, 1MB for JSON bodies).
- **ALWAYS** validate `Content-Type` headers on incoming requests. Reject requests with unexpected content types.
- **ALWAYS** implement request timeout at the server level. NEVER allow a single request to consume server resources indefinitely.
- **NEVER** return detailed error information in production API responses. Return generic error messages and log details server-side.

## DEPENDENCY SECURITY

- **ALWAYS** audit dependencies for known vulnerabilities regularly (`npm audit`, `pip audit`, `snyk`).
- **ALWAYS** pin dependency versions and review changelogs before upgrading. NEVER blindly auto-upgrade dependencies in production.
- **NEVER** install packages from untrusted sources. Every dependency is an attack surface.
