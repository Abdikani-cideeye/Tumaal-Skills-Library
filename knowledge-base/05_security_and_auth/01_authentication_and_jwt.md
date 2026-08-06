# AUTHENTICATION AND JWT

## TOKEN STORAGE

- **NEVER** store authentication tokens in `localStorage`. It is vulnerable to Cross-Site Scripting (XSS) attacks — any injected script can steal the token.
- **ALWAYS** store tokens in cookies configured with:
  - `HttpOnly` — Inaccessible to client-side JavaScript.
  - `Secure` — Transmitted only over HTTPS.
  - `SameSite=Strict` or `SameSite=Lax` — Prevents CSRF via cross-site requests.
  - Appropriate `Path` and `Domain` scoping.
- **WHEN** cookies are not feasible (e.g., native mobile apps), store tokens in secure platform storage (e.g., Keychain on iOS, EncryptedSharedPreferences on Android). NEVER store in plain AsyncStorage or SharedPreferences.

## JWT BEST PRACTICES

- **ALWAYS** use short-lived access tokens (5–15 minutes) paired with long-lived refresh tokens (7–30 days).
- **ALWAYS** validate JWTs on the server for EVERY protected request. NEVER trust a token's claims without server-side verification.
- **ALWAYS** verify the token's signature, expiration (`exp`), issuer (`iss`), and audience (`aud`) claims.
- **NEVER** store sensitive data (passwords, PII, full user profiles) in JWT payloads. JWTs are base64-encoded, NOT encrypted. Anyone can decode and read them.
- **ALWAYS** use asymmetric signing algorithms (RS256, ES256) for production systems. Symmetric algorithms (HS256) share the same secret for signing and verification, which is a single point of compromise.
- **NEVER** disable token expiration. NEVER set tokens to "never expire."

## REFRESH TOKEN FLOW

- **ALWAYS** implement a secure refresh token rotation flow:
  1. Client sends expired access token + refresh token.
  2. Server validates refresh token, issues new access token AND new refresh token.
  3. Server invalidates the old refresh token.
- **ALWAYS** implement refresh token reuse detection. If a previously rotated refresh token is used, revoke ALL tokens for that user (indicates potential token theft).
- **ALWAYS** store refresh tokens server-side (database or Redis) with an associated user ID and expiration. NEVER rely solely on the token's self-contained claims.

## SESSION MANAGEMENT

- **ALWAYS** invalidate all tokens on password change, password reset, or account compromise detection.
- **ALWAYS** implement a logout endpoint that revokes the refresh token server-side. Client-side token deletion alone is insufficient.
- **ALWAYS** set session idle timeouts for sensitive applications. If a user is inactive for a configured period, require re-authentication.

## PASSWORD STORAGE

- **NEVER** store passwords in plaintext or with reversible encryption.
- **ALWAYS** hash passwords with a modern, slow hashing algorithm: Argon2id (preferred), bcrypt, or scrypt.
- **ALWAYS** use a unique, random salt per password. Modern hashing libraries (Argon2, bcrypt) handle this automatically.
- **NEVER** implement custom password hashing. Use battle-tested libraries.

## AUTHENTICATION FLOW ISOLATION

- **ALWAYS** separate authentication flows. If the public app does not require user accounts, keep login logic and authentication providers strictly confined to the admin or authenticated workspace.
- **NEVER** expose registration or login endpoints on public-facing APIs that do not require user accounts.

## MULTI-FACTOR AUTHENTICATION

- **ALWAYS** support MFA for administrative and high-privilege accounts. TOTP (time-based one-time passwords) is the minimum viable MFA implementation.
- **NEVER** rely solely on SMS-based 2FA for high-security accounts. SMS is vulnerable to SIM-swapping attacks.
