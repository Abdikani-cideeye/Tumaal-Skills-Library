# ENVIRONMENT SEPARATION

## ATOMIC ENVIRONMENT ISOLATION

- **NEVER** deploy without atomic environment separation. ALWAYS maintain strictly isolated environments:
  - **Development** — Local developer machines. May use local databases and mock services.
  - **Preview/Staging** — Pre-production environment. MUST mirror production configuration as closely as possible.
  - **Production** — Live environment serving real users.
- **ALWAYS** use entirely separate database instances, API keys, and third-party service accounts for each environment. NEVER share a database between staging and production.
- **NEVER** run production workloads against a development or staging database, even "temporarily."

## INFRASTRUCTURE AS CODE (IaC)

- **ALWAYS** treat infrastructure as code. Maintain database migrations, storage bucket policies, authentication rules, CDN configuration, and environment setup as version-controlled code artifacts.
- **NEVER** rely on manual dashboard clicks to configure production infrastructure. If it's not in code, it's not reproducible.
- **ALWAYS** use IaC tools (e.g., Terraform, Pulumi, CloudFormation, or platform-native config files) for provisioning and managing cloud resources.
- **ALWAYS** review infrastructure changes in PRs with the same rigor as application code changes.

## ENVIRONMENT VARIABLE MANAGEMENT

- **ALWAYS** document all required environment variables in a `.env.example` file committed to the repository.
- **ALWAYS** validate environment variables at application startup. If a required variable is missing, the application MUST fail fast with a clear error message, not silently fall back to undefined behavior.
- **NEVER** hardcode environment-specific values (URLs, keys, feature flags) in source code. ALWAYS read them from environment variables.
- **ALWAYS** use a typed configuration loader (e.g., Pydantic BaseSettings, Zod schema, envalid) to parse and validate environment variables with type safety.

## FEATURE FLAGS

- **ALWAYS** use feature flags for rolling out new functionality incrementally. NEVER deploy unfinished features behind `if (false)` guards or commented-out code.
- **ALWAYS** clean up expired feature flags. Accumulated dead flags create confusion and technical debt.

## DATABASE ENVIRONMENT RULES

- **ALWAYS** use migration-based schema management in all environments. NEVER apply schema changes manually or use `db push` as a permanent solution.
- **ALWAYS** seed development and staging databases with realistic test data. NEVER test against empty databases.
- **NEVER** copy production data to development environments without anonymizing PII (personally identifiable information).

## DEPLOYMENT TARGETS

- **ALWAYS** configure separate deployment targets for decoupled applications in the same repository. Each workspace gets its own deployment, root directory, and environment variables.
- **ALWAYS** ensure build-time environment variables are injected into the correct workspace during CI/CD. A frontend workspace MUST NOT receive backend secrets.
