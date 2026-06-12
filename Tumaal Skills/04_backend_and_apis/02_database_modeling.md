# DATABASE MODELING

## RELATIONAL DESIGN

- **NEVER** use flat string columns (e.g., `category: "Science"`) if the domain has a hierarchy. Build relational trees (Category → Subcategory → Item) to ensure data integrity and scalability.
- **ALWAYS** normalize data to at least Third Normal Form (3NF) for transactional databases. Denormalize strategically only for read-heavy query optimization.
- **ALWAYS** use foreign keys with explicit referential integrity constraints. NEVER rely on application-level logic alone to maintain relationships.

## NAMING CONVENTIONS

- **ALWAYS** use `lower_case_snake` for all database identifiers (tables, columns, indexes).
- **ALWAYS** use singular form for table names (e.g., `user`, `post`, `payment_account`).
- **ALWAYS** group related tables with a module prefix (e.g., `payment_account`, `payment_bill`, `post`, `post_like`).
- **ALWAYS** use `_at` suffix for datetime columns (e.g., `created_at`, `updated_at`, `deleted_at`).
- **ALWAYS** use `_date` suffix for date-only columns (e.g., `birth_date`, `due_date`).
- **ALWAYS** stay consistent across tables but use concrete naming where appropriate (e.g., `profile_id` globally, but `creator_id` when the column specifically references creator profiles).

## SOFT DELETES

- **ALWAYS** use soft deletes for critical entities. NEVER permanently destroy user-generated data, financial records, or audit-trail records.
- **ALWAYS** implement soft deletes using a `deleted_at` timestamp or a `status` flag (`ACTIVE`, `DELETED`, `INACTIVE`). A timestamp is preferred because it records when the deletion occurred.
- **ALWAYS** filter out soft-deleted records in default queries. Create explicit queries or scopes for including deleted records when needed.

## CASCADING DELETES

- **ALWAYS** implement cascading deletes carefully. Use `ON DELETE CASCADE` for true child records (e.g., comments when a post is deleted). Use `ON DELETE RESTRICT` for related but independent entities (e.g., users who authored posts).
- **NEVER** cascade hard deletes across entities with financial or audit significance. Use soft deletes or status flags instead.

## INDEXING

- **ALWAYS** index foreign keys and lookup columns proactively. Missing indexes on foreign keys cause full table scans on joins.
- **ALWAYS** index columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.
- **ALWAYS** use composite indexes when queries filter on multiple columns. Order columns by selectivity (most selective first).
- **NEVER** over-index write-heavy tables. Each index slows down INSERT, UPDATE, and DELETE operations.

## SCHEMA CHANGES AND MIGRATIONS

- **NEVER** bypass migration history. NEVER use force-push commands (e.g., `db push`) as a permanent solution. ALWAYS generate proper migration files to maintain a strict, auditable history.
- **ALWAYS** make migration files descriptive and dated (e.g., `2024-08-24_add_post_content_index.sql`).
- **ALWAYS** backfill data on schema changes. When adding new columns (especially required ones), write a one-time backfill script to populate legacy rows with safe default values. NEVER let legacy rows return `null` or `NaN` to the frontend.
- **ALWAYS** resolve schema drift cleanly. If the development database drifts from migration history, perform a clean reset and re-seed.

## MAKER-CHECKER WORKFLOWS

- **ALWAYS** implement maker-checker workflows for critical data entry. Separate the "Maker" (who inputs data) from the "Checker" (who approves it). Use a `status` field (`PENDING`, `APPROVED`, `REJECTED`) to govern visibility.

## SEED SCRIPTS

- **ALWAYS** make seed scripts idempotent. Clear existing data (bottom-up, respecting foreign keys) before inserting. They MUST be runnable multiple times without unique constraint errors.
- **NEVER** hardcode secrets in seed files. Read default admin passwords or API keys from environment variables.
- **ALWAYS** use realistic, domain-specific data for enterprise demos. NEVER use random gibberish generators if it breaks the professional illusion.
