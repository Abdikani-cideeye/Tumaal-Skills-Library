# CI/CD PIPELINES

## BUILD VERIFICATION

- **ALWAYS** run a strict build check (`npm run build`, `tsc --noEmit`, or equivalent) immediately after major architectural refactoring (moving files, changing import paths, upgrading dependencies).
- **NEVER** proceed to UI development or deploy if the build process throws TypeScript or module resolution errors.
- **ALWAYS** treat the build pipeline as the gatekeeper. Code that fails to build MUST NOT be merged to the main branch.

## TYPE CHECKING

- **ALWAYS** run strict, no-emit type checking across the entire codebase before declaring a feature complete.
- **ALWAYS** enable `strict: true` in TypeScript configurations. For Python, enforce type checking with `mypy` or `pyright` in strict mode.
- **NEVER** declare a feature "complete" just because it renders in the browser. Hidden type errors break production.

## LINTING AND FORMATTING GATES

- **ALWAYS** enforce linting and formatting in CI. PRs that fail lint checks MUST NOT be merged.
- **ALWAYS** run linters with the `--max-warnings=0` flag. Warnings are future errors.
- **ALWAYS** use automated code formatters (Prettier, Ruff, Black) in CI to catch inconsistencies.

## PIPELINE STAGES

- **ALWAYS** structure CI/CD pipelines in this order:
  1. **Install** — Install dependencies from lockfile.
  2. **Lint** — Run linters and formatters.
  3. **Type Check** — Run static type analysis.
  4. **Test** — Run unit and integration tests.
  5. **Build** — Compile/bundle the application.
  6. **Security Scan** — Audit dependencies for vulnerabilities.
  7. **Deploy** — Deploy to the target environment.
- **NEVER** skip stages for "speed." Every stage catches a different class of errors.

## DEPLOYMENT FLOW

- **ALWAYS** deploy through automated pipelines. NEVER deploy by manually copying files, running local build commands, or SSHing into servers.
- **ALWAYS** implement deployment previews for pull requests. Reviewers MUST be able to see the live result before merging.
- **ALWAYS** implement rollback mechanisms. If a deployment fails health checks, automatically revert to the previous version.
- **NEVER** deploy directly to production without passing through a staging/preview environment first.

## BRANCH STRATEGY

- **ALWAYS** protect the main branch. Require PR reviews and passing CI checks before merging.
- **ALWAYS** use short-lived feature branches. Long-lived branches accumulate merge conflicts and drift.
- **NEVER** commit directly to the main branch for anything beyond trivial documentation fixes.

## CACHING IN CI

- **ALWAYS** cache dependency installation (`node_modules`, `.venv`, pip cache) between CI runs to reduce build times.
- **ALWAYS** cache build artifacts when possible (e.g., Next.js `.next` cache, Turborepo cache).
