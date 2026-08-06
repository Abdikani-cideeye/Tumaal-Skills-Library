# PROJECT STRUCTURE AND MODULARITY

## DOMAIN-DRIVEN STRUCTURE

- **ALWAYS** organize code by feature/domain, not by technical type. A domain module should contain its own router, schemas, models, services, dependencies, and utils.
```
src/
├── auth/
│   ├── router.py (or routes.ts)
│   ├── schemas.py (or types.ts)
│   ├── models.py
│   ├── service.py
│   ├── dependencies.py
│   ├── constants.py
│   ├── exceptions.py
│   └── utils.py
├── orders/
│   └── ... (same structure)
├── config.py          # global config
├── database.py        # db connection
└── main.py            # app entry point
```
- **NEVER** organize code into flat folders by type (e.g., `/controllers/`, `/models/`, `/services/`). This pattern does not scale beyond small microservices.

## MONOREPO ISOLATION

- **ALWAYS** enforce workspace isolation in monorepo projects. Separate the public app, admin CMS, and backend core into isolated workspaces. They should only share typed backend utilities, NEVER UI state.
- **ALWAYS** use workspace-aware package managers (e.g., NPM/Yarn/PNPM Workspaces) when managing decoupled applications in a single repository.
- **ALWAYS** configure a root-level `package.json` with scripts that can run, build, and lint all workspaces concurrently.
- **ALWAYS** isolate shared logic into a dedicated internal package (e.g., `packages/backend`, `packages/shared`). This package MUST contain all database clients, shared types, validation schemas, and utility functions.

## IMPORT MANAGEMENT

- **ALWAYS** use path aliases (e.g., `@/components`, `@shared/utils`) to make imports resilient to folder restructuring. NEVER use deep relative paths like `../../../utils/format`.
- **WHEN** importing from other packages in a monorepo, use explicit module names:
```python
from src.auth import constants as auth_constants
from src.notifications import service as notification_service
```
- **ALWAYS** ensure that moving or refactoring files updates all relative import paths across the entire monorepo.

## SEPARATION OF CONCERNS

- **NEVER** mix administrative API routes with public API routes in the same application instance.
- **ALWAYS** decouple public-facing applications from internal/administrative applications. They have different security profiles, user bases, and deployment cadences.
- **ALWAYS** fetch data server-side where possible for public-facing content to ensure SEO and performance.

## MODULE BOUNDARIES

- **NEVER** allow circular dependencies between modules. If Module A depends on Module B and vice versa, extract the shared logic into a third module.
- **ALWAYS** define explicit public APIs for each module. Internal implementation details MUST NOT be imported by other modules.
- **ALWAYS** keep modules cohesive. If a module's files do not relate to each other, it is not a cohesive module — split it.

## DEPLOYMENT ARCHITECTURE

- **ALWAYS** configure separate deployment targets for decoupled applications. In platforms like Vercel, create separate projects pointing to the same repository but with different root directories.
- **ALWAYS** ensure environment variables are properly distributed to the specific workspaces that need them during the build step.
