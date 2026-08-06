# AUTHORIZATION AND RBAC

## ROLE-BASED ACCESS CONTROL (RBAC)

- **ALWAYS** implement strict RBAC with clearly defined role boundaries (e.g., `VIEWER`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`).
- **ALWAYS** check authorization on BOTH the server and client:
  - **Server-side:** MUST enforce authorization. This is the security boundary. NEVER rely solely on the client.
  - **Client-side:** Hides UI elements for better UX only. This is NOT a security measure.
- **NEVER** rely on frontend UI hiding (e.g., `if (isAdmin) renderButton()`) to protect data. The database and API MUST reject unauthorized requests regardless of what the client shows.

## PERMISSION-BASED ACCESS CONTROL (PBAC)

- **WHEN** RBAC is too coarse, implement permission-based access control for granular resource-level authorization (e.g., only the author of a comment can delete it, only the owner of a document can share it).
- **ALWAYS** combine RBAC and PBAC when needed: RBAC for broad access levels, PBAC for resource-specific ownership checks.

## DATABASE-LEVEL SECURITY

- **ALWAYS** enforce access control at the database layer using Row Level Security (RLS) or equivalent database-native policies.
- **NEVER** rely solely on application-level authorization. If the application has a bug, the database MUST still reject unauthorized queries.
- **ALWAYS** test RLS policies explicitly. Write tests that verify unauthorized users cannot access protected rows, even with direct database access.

## MIDDLEWARE PROTECTION

- **ALWAYS** protect sensitive routes at the edge/middleware level. Intercept and redirect unauthenticated or unauthorized users BEFORE the server generates the page or API response.
- **ALWAYS** ensure middleware matchers explicitly ignore static assets (images, CSS, JS, fonts) to prevent infinite redirect loops.
- **ALWAYS** implement route protection as a whitelist (explicitly allow public routes) rather than a blacklist (explicitly block private routes). Whitelisting is safer because new routes are protected by default.

## SERVICE ROLE KEYS

- **NEVER** use client-side database keys (anon/public keys) for administrative write operations. Client-side keys are inherently insecure for mutations.
- **ALWAYS** use elevated service role keys STRICTLY on the server-side to bypass RLS for authorized administrative actions.
- **NEVER** expose service role keys, admin tokens, or database bypass keys to the client-side bundle under any circumstances.

## AUTHORIZATION PATTERNS

- **ALWAYS** implement the principle of least privilege. Every user, service, and API key should have the minimum permissions required to perform its function.
- **ALWAYS** log authorization failures. Failed authorization attempts may indicate an attack or misconfiguration.
- **ALWAYS** implement account self-deletion guards. An admin MUST NOT be able to delete their own account or revoke their own admin privileges if they are the last admin.

## SCOPE SEPARATION

- **ALWAYS** separate administrative applications and routes from public-facing ones. Admin and public apps MUST use separate authentication providers, separate databases (or at minimum separate schemas), and separate deployment targets.
- **NEVER** share a single environment file across public and admin applications in production. Each workspace MUST have its own isolated environment configuration.
