# COMPONENT ARCHITECTURE

## FILE SIZE AND DECOMPOSITION

- **NEVER** allow a component file to exceed 200 lines. If a file grows beyond this, ruthlessly decompose it into smaller, single-responsibility sub-components.
- **NEVER** add multiple rendering functions inside a single component. If a piece of UI can be considered a unit, extract it into a separate component.
- **ALWAYS** limit the number of props a component accepts. If it exceeds 5-7 props, consider splitting into multiple components or using composition via `children` or slots.

## DOMAIN-DRIVEN STRUCTURE

- **ALWAYS** organize components by feature/domain, not by technical type:
  - `components/ui/` — Strictly for dumb, generic, reusable primitives (Button, Input, Spinner, Modal).
  - `features/<domain>/components/` — For business-logic-heavy components scoped to a specific feature (e.g., `auth/`, `checkout/`, `dashboard/`).
- **ALWAYS** colocate route-specific code within that route's directory. If a component is used by exactly one page, keep it local. NEVER pollute the global shared components folder.
- **ALWAYS** colocate related files (component, hooks, types, utils, tests) within the feature directory:
```
features/orders/
├── api/
├── components/
├── hooks/
├── types/
├── utils/
└── index.ts
```

## UNIDIRECTIONAL CODE FLOW

- **ALWAYS** enforce unidirectional architecture: `shared → features → app`. Shared modules can be used by any part of the codebase, but features MUST NOT import from other features. Compose features at the application level.
- **NEVER** allow cross-feature imports. Feature A MUST NOT import from Feature B directly. If they share logic, extract it to a shared module.
- **ALWAYS** enforce import boundaries using lint rules (e.g., `import/no-restricted-paths` in ESLint).

## COMPONENT LIBRARIES

- **ALWAYS** wrap third-party component libraries in adapter components. The application should depend on your abstraction, not the library's raw API. This makes future library swaps painless.
- **ALWAYS** prefer headless component libraries (e.g., Radix UI, Headless UI, Base UI) when implementing a custom design system. Fully styled libraries (e.g., MUI, AntD) are acceptable for admin dashboards or internal tools.
- **ALWAYS** abstract shared components into a reusable component library. Identify repetitions before creating components to avoid wrong abstractions.

## STATIC DATA ISOLATION

- **NEVER** clutter component files with large static arrays, configuration objects, or mock data. Extract them into dedicated `[componentName].data.ts` or `constants.ts` files.
- **NEVER** ship hardcoded mock data in production. All dynamic content MUST be fetched from a database or API.

## BARREL FILES

- **NEVER** use barrel files (`index.ts` re-exports) in projects using tree-shaking bundlers (e.g., Vite). They prevent effective tree-shaking and cause performance issues. Import files directly.

## CONSISTENCY

- **ALWAYS** keep code style consistent. If you use PascalCase for component names, do it everywhere. If you use named exports, do it everywhere.
- **ALWAYS** maintain a consistent component file structure: imports → types → component → styles (if colocated) → export.
