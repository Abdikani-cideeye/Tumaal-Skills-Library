# XSS, CSRF, AND INJECTION PREVENTION

## CROSS-SITE SCRIPTING (XSS) PREVENTION

- **NEVER** use `dangerouslySetInnerHTML` (React), `v-html` (Vue), or `[innerHTML]` (Angular) unless absolutely necessary. If required, ALWAYS pass the payload through a robust sanitizer (e.g., DOMPurify) before rendering.
- **ALWAYS** encode output data contextually:
  - HTML context: HTML entity encode (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`).
  - JavaScript context: JavaScript-encode or JSON-serialize.
  - URL context: URL-encode.
  - CSS context: CSS-encode.
- **ALWAYS** sanitize all user inputs before displaying them in the application. This is your primary defense against stored XSS.
- **ALWAYS** implement Content Security Policy (CSP) headers to restrict script sources:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
```
- **NEVER** use `'unsafe-eval'` in CSP unless absolutely required by a dependency. This re-enables `eval()` attacks.

## URL SANITIZATION

- **ALWAYS** implement lightweight URL validation for user-provided URLs. Only allow safe protocols (`http:`, `https:`, `data:image/`).
- **ALWAYS** explicitly reject executable URL schemes (`javascript:`, `data:text/html`, `vbscript:`).
- **NEVER** use heavy HTML sanitizers for URL-only fields. A strict protocol whitelist is sufficient and faster.

## CROSS-SITE REQUEST FORGERY (CSRF) PREVENTION

- **ALWAYS** implement CSRF protection for all state-changing requests (POST, PUT, PATCH, DELETE) on cookie-authenticated endpoints.
- **ALWAYS** use the synchronizer token pattern (server-generated CSRF token embedded in forms and validated on submission) or the double-submit cookie pattern.
- **ALWAYS** set `SameSite=Strict` or `SameSite=Lax` on authentication cookies. This is the strongest browser-native CSRF defense.
- **NEVER** rely solely on checking the `Referer` or `Origin` header for CSRF protection. These can be spoofed or absent.

## SQL INJECTION PREVENTION

- **NEVER** construct SQL queries by concatenating user input into query strings.
- **ALWAYS** use parameterized queries, prepared statements, or ORM query builders for all database interactions.
```python
# NEVER
query = f"SELECT * FROM users WHERE id = '{user_input}'"
# ALWAYS
query = "SELECT * FROM users WHERE id = $1"
await db.fetch(query, user_input)
```
- **ALWAYS** validate and type-check all user inputs before they reach any query layer, even when using parameterized queries.

## INPUT VALIDATION

- **ALWAYS** validate all inputs on the server side. Client-side validation is a UX enhancement, NOT a security measure.
- **ALWAYS** use an allowlist approach for input validation (define what IS allowed) rather than a denylist approach (define what is NOT allowed).
- **ALWAYS** enforce strict length limits on all string inputs. Unbounded strings enable denial-of-service and buffer overflow attacks.
- **ALWAYS** validate file uploads: check MIME type, file extension, file size, and scan content. NEVER trust the client-reported MIME type alone.

## PROTOTYPE POLLUTION (JAVASCRIPT)

- **NEVER** use `Object.assign()` or spread operators to merge untrusted user input into configuration objects without sanitizing keys. Attacker-controlled keys like `__proto__`, `constructor`, or `prototype` can inject properties into all objects.
- **ALWAYS** use `Object.create(null)` for lookup maps that ingest user-controlled keys, or explicitly filter out dangerous keys.
