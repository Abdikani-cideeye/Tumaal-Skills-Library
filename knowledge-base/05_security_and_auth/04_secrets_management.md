# SECRETS MANAGEMENT

## THE "OPEN WALLET" RULE

- **NEVER** expose API keys, service tokens, database credentials, or any secret to the client-side bundle. Treat every exposed secret as a stolen credit card.
- **NEVER** prefix third-party API keys (AI services, payment gateways, email providers) with client-side exposure tags (e.g., `NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`).
- **ALWAYS** create a server-side API route to act as a proxy between the frontend and third-party services. The server holds the secret key, makes the request, and returns the sanitized result to the client.

## ENVIRONMENT VARIABLE MANAGEMENT

- **ALWAYS** isolate environment variables per application workspace. NEVER share a single `.env` file across public and admin applications in production.
- **ALWAYS** maintain isolated `development`, `preview/staging`, and `production` environments with entirely separate database instances and API keys.
- **NEVER** commit `.env` files to version control. Add `.env*` to `.gitignore` from project initialization.
- **ALWAYS** document all required environment variables in a `.env.example` or `.env.template` file committed to the repository.

## SECRET ROTATION

- **ALWAYS** design systems to support secret rotation without downtime. Use versioned secrets or dual-read patterns during rotation periods.
- **ALWAYS** rotate secrets immediately upon suspected compromise, team member departure, or security incident.
- **NEVER** use the same secret key across environments. Development, staging, and production MUST use different keys.

## SECRET STORAGE

- **ALWAYS** use a dedicated secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, Doppler, Vercel Environment Variables) for production secrets. NEVER store production secrets in plain text files, source code, or CI/CD configuration.
- **NEVER** log secrets. Ensure logging libraries and error reporters redact sensitive values from output.
- **NEVER** include secrets in Docker images, build artifacts, or client-side bundles. Inject them at runtime via environment variables.

## SEED FILES AND DEVELOPMENT

- **NEVER** hardcode secrets in seed files, migration scripts, or test fixtures. ALWAYS read default admin passwords or API keys from environment variables, even in development.
- **ALWAYS** use weak/obvious development-only secrets (e.g., `dev-secret-key`) that are clearly not production-grade, to prevent accidental use in production.

## API KEY SECURITY

- **ALWAYS** scope API keys to the minimum required permissions. A key that only needs read access MUST NOT have write access.
- **ALWAYS** set expiration dates on API keys. NEVER issue keys that never expire.
- **ALWAYS** implement API key revocation mechanisms. If a key is compromised, it MUST be revocable immediately without redeploying the application.
- **ALWAYS** rate-limit API key usage to prevent abuse even with valid keys.

## GIT HYGIENE

- **ALWAYS** use pre-commit hooks or CI checks to scan for accidentally committed secrets (e.g., `git-secrets`, `trufflehog`, `gitleaks`).
- **NEVER** attempt to "fix" a committed secret by deleting it in a subsequent commit. The secret is in the git history. Rotate the secret immediately and use `git filter-branch` or `BFG Repo Cleaner` to purge it from history.
