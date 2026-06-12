# REACT, VITE, AND TAILWIND RULES

> **Stack:** React 18, Vite, TypeScript (strict), Tailwind CSS v3.

## COMPONENT ARCHITECTURE

- **ALWAYS** write functional components. NEVER use class components.
- **ALWAYS** use the `function` keyword for component declarations, not `const` with arrow functions. Function declarations hoist and read clearer.
```tsx
// ALWAYS
export function UserCard({ name, avatar }: UserCardProps) { ... }
// NEVER
export const UserCard = ({ name, avatar }: UserCardProps) => { ... }
```
- **ALWAYS** structure component files in this order: imports → interface/types → component → helpers → static content → export.
- **ALWAYS** use named exports for components. NEVER use default exports except for page-level route components.
- **NEVER** let a component file exceed 200 lines. Extract sub-components, hooks, and helpers into separate files.

## TYPESCRIPT STRICT MODE

- **ALWAYS** enable `strict: true` in `tsconfig.json`. This includes `strictNullChecks`, `noImplicitAny`, and `strictFunctionTypes`.
- **ALWAYS** prefer `interface` over `type` for object definitions. Use `type` only for unions, intersections, and mapped types.
- **NEVER** use `any`. Prefer `unknown` with type guards for unknown data. Use `as` assertions only when narrowing is impossible.
- **NEVER** use `enum`. Use `const` maps or literal union types instead:
```typescript
// NEVER
enum Status { Active, Inactive }
// ALWAYS
const STATUS = { ACTIVE: "active", INACTIVE: "inactive" } as const;
type Status = (typeof STATUS)[keyof typeof STATUS];
```
- **ALWAYS** suffix component props interfaces with `Props`: `ButtonProps`, `UserCardProps`, `ModalProps`.
- **ALWAYS** prefix event handler props with `on` and handler implementations with `handle`: `onClick` → `handleClick`.

## TAILWIND CSS V3

- **ALWAYS** use Tailwind utility classes for ALL styling. NEVER use inline `style` attributes. NEVER write custom CSS unless Tailwind cannot express it.
- **ALWAYS** use a mobile-first approach: start with base (mobile) classes, then layer `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- **ALWAYS** configure the `tailwind.config.ts` with a custom design system: colors, spacing, fonts, breakpoints. NEVER rely on Tailwind defaults for production.
- **ALWAYS** use semantic color names in the Tailwind config (`primary`, `secondary`, `destructive`, `muted`) mapped to HSL values. NEVER hardcode hex colors in JSX.
- **ALWAYS** group related utilities with `@apply` in a CSS file ONLY for highly reused atomic patterns (e.g., `.btn-primary`). NEVER use `@apply` for one-off component styles.
- **ALWAYS** use `clsx` or `cn()` (classnames utility) for conditional class composition:
```tsx
import { cn } from "@/lib/utils";
<button className={cn("px-4 py-2 rounded", isActive && "bg-primary text-white")} />
```

## HOOKS

- **ALWAYS** follow the Rules of Hooks. NEVER call hooks conditionally or inside loops.
- **ALWAYS** use `useState` for simple local state and `useReducer` for complex state with multiple related values.
- **ALWAYS** extract reusable logic into custom hooks named `use<Purpose>` (e.g., `useDebounce`, `useMediaQuery`, `useAuth`).
- **ALWAYS** include proper cleanup in `useEffect` return functions for subscriptions, timers, and event listeners.
- **ALWAYS** memoize expensive computations with `useMemo` and callback references with `useCallback` ONLY when profiling reveals a performance problem. NEVER memoize by default.
- **ALWAYS** use the `children` prop as the most basic render optimization. JSX passed as `children` does not re-render when parent state changes.

## DATA FETCHING (NON-NEXT.JS VITE APPS)

- **ALWAYS** use TanStack Query (React Query) for all server-state management. NEVER store fetched data in Zustand, Redux, or Context.
- **ALWAYS** define query keys as structured, hierarchical arrays using a factory pattern:
```typescript
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
```
- **ALWAYS** invalidate query cache on mutation success. NEVER force the user to manually refresh.
- **ALWAYS** colocate query definitions with their feature: `features/users/api/queries.ts`.

## STATE MANAGEMENT

- **ALWAYS** use Zustand ONLY for genuinely shared client state (theme, sidebar toggle, auth session). NEVER duplicate server data into Zustand.
- **ALWAYS** subscribe to the smallest possible slice: `useStore((state) => state.value)`. NEVER call a store hook without a selector.
- **ALWAYS** use URL state (`useSearchParams`) for filters, pagination, tabs, and sort orders. NEVER put shareable state in component state.
- **NEVER** persist secrets, tokens, or PII to browser storage via Zustand `persist` middleware.

## VITE CONFIGURATION

- **ALWAYS** configure path aliases in both `vite.config.ts` and `tsconfig.json`:
```typescript
// vite.config.ts
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```
- **ALWAYS** implement code splitting at the route level using `React.lazy()` with `<Suspense>` fallbacks.
- **ALWAYS** optimize the build with Vite's chunk splitting strategy for vendor dependencies.

## ACCESSIBILITY

- **ALWAYS** use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<button>`) instead of generic `<div>` with click handlers.
- **ALWAYS** implement proper ARIA attributes, keyboard navigation, and focus management.
- **ALWAYS** provide `alt` text for images and `aria-label` for icon-only buttons.

## FILE AND DIRECTORY NAMING

- **ALWAYS** use lowercase with dashes for directories: `components/auth-wizard/`, `features/user-profile/`.
- **ALWAYS** use PascalCase for component files: `UserCard.tsx`, `AuthWizard.tsx`.
- **ALWAYS** use camelCase for utility, hook, and service files: `useDebounce.ts`, `formatCurrency.ts`.
