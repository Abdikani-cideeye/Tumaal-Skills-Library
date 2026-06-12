# CODE FORMATTING AND LINTING

## FILE SIZE LIMITS

- **NEVER** allow a single file to exceed 200 lines of code. If a file grows beyond this, ruthlessly decompose it into smaller, single-responsibility modules.
- **NEVER** allow a single function to exceed 30 lines. If it does, extract sub-operations into helper functions.
- **ALWAYS** enforce file size limits through linting rules or code review checklists.

## FORMATTING TOOLS

- **ALWAYS** use an automated code formatter (e.g., Prettier for JavaScript/TypeScript, Ruff/Black for Python). NEVER rely on manual formatting.
- **ALWAYS** use a linter (e.g., ESLint for JavaScript/TypeScript, Ruff for Python) with strict rule sets. NEVER disable linting rules without a documented justification.
- **ALWAYS** configure formatters and linters to run automatically on save and in CI pipelines. Code that fails linting MUST NOT be merged.

## CONSISTENCY

- **ALWAYS** maintain a single code style across the entire codebase. If you use single quotes, use them everywhere. If you use trailing commas, use them everywhere.
- **ALWAYS** use a `.editorconfig` file to enforce consistent indentation, line endings, and charset across all contributors and editors.
- **ALWAYS** commit formatter and linter configuration files to the repository. They are part of the project.

## IMPORT ORGANIZATION

- **ALWAYS** organize imports in a consistent order:
  1. External/third-party packages.
  2. Internal/shared modules (aliased paths like `@/`).
  3. Relative imports (local files).
  4. Type-only imports (separated at the end).
- **ALWAYS** use path aliases (e.g., `@/components`, `@shared/`) to make imports resilient to folder restructuring. NEVER use deep relative paths like `../../../utils/format`.
- **NEVER** use barrel files (`index.ts` re-exports) in projects using tree-shaking bundlers (e.g., Vite). They prevent effective tree-shaking and degrade build performance.

## TYPE CHECKING

- **ALWAYS** enforce strict type checking in TypeScript projects. Enable `strict: true` in `tsconfig.json`.
- **ALWAYS** run a strict, no-emit type check (`tsc --noEmit` or equivalent) across the entire codebase before declaring a feature complete. NEVER rely solely on browser rendering to verify correctness.
- **NEVER** use `any` type unless absolutely unavoidable. Prefer `unknown` and narrow with type guards.
- **ALWAYS** treat TypeScript warnings as errors in CI. If it warns today, it breaks tomorrow.

## DEPENDENCY MANAGEMENT

- **ALWAYS** treat warnings as future errors. NEVER ignore deprecation warnings or peer-dependency mismatches. Resolve them immediately.
- **ALWAYS** lock dependency versions with a lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`). NEVER deploy without a lockfile.
- **ALWAYS** audit dependencies regularly for known vulnerabilities (`npm audit`, `pip audit`).
- **NEVER** install packages without understanding what they do. Every dependency is an attack surface.

## COMMENTS

- **NEVER** write comments that restate what the code does. Code should be self-documenting through clear naming.
- **ALWAYS** write comments that explain WHY a decision was made, not WHAT the code does.
- **NEVER** leave commented-out code in the codebase. Version control is the archive.
- **ALWAYS** use TODO comments with a ticket/issue reference for known technical debt: `// TODO(JIRA-123): Refactor after API v2 migration`.
