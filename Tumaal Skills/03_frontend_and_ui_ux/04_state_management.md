# STATE MANAGEMENT

## CLIENT STATE VS SERVER STATE

- **ALWAYS** separate client state from server state. These are fundamentally different concerns:
  - **Client State:** UI toggles, theme preference, sidebar open/closed, auth tokens, form drafts. Use a lightweight global store (e.g., Zustand, Jotai, Redux Toolkit).
  - **Server State:** Data fetched from the database or API. Use a server-state library (e.g., React Query / TanStack Query, SWR, Apollo Client) for fetching, caching, and synchronization.
- **NEVER** store server-fetched data in a client-side state management store. This leads to stale data, manual cache invalidation nightmares, and duplicated logic.

## COMPONENT STATE

- **ALWAYS** start with local component state (`useState`, `useReducer`). Only lift state up or globalize it when another component genuinely needs it.
- **ALWAYS** use `useState` for simple, independent pieces of state. Use `useReducer` for complex state where a single action updates multiple related values.
- **NEVER** prematurely globalize state. If only one component uses a piece of state, keep it local.

## SERVER CACHE STATE

- **ALWAYS** invalidate cache on mutation. Whenever a CREATE, UPDATE, or DELETE action succeeds, you MUST instantly invalidate the relevant query cache to trigger an automatic UI refresh. NEVER force the user to manually reload the page.
- **ALWAYS** define API requests as structured declarations colocated with their feature:
  - Type/validation schemas for request and response data.
  - A fetcher function using a singleton API client.
  - A hook that wraps the fetcher with caching logic (e.g., `useQuery`, `useMutation`).
- **ALWAYS** use a single, pre-configured instance of the API client. NEVER create API clients on the fly.

## FORM STATE

- **ALWAYS** use a form management library (e.g., React Hook Form, Formik) for forms with 3+ fields. NEVER manage complex form state with raw `useState` chains.
- **ALWAYS** integrate client-side validation with a schema validation library (e.g., Zod, Yup). Validate on blur and on submit.
- **ALWAYS** create abstracted `Form` and input field components that wrap the form library. The application should not import the form library directly in every form.

## URL STATE

- **ALWAYS** use URL parameters and query strings for state that should survive page refreshes, be shareable, or bookmarkable (e.g., filters, pagination, search terms, selected tabs).
- **NEVER** store ephemeral UI state (modal open/closed, tooltip visibility) in the URL.

## CONTEXT USAGE

- **ALWAYS** use React Context for low-velocity, widely-shared data: theme, locale, user session, feature flags.
- **NEVER** use Context for high-frequency data that changes on every render (e.g., mouse position, animation frames). This triggers unnecessary re-renders of all consumers.
- **ALWAYS** consider lifting state up or using composition before reaching for Context. Context is not a replacement for prop passing.

## CASCADING DROPDOWNS

- **ALWAYS** use cascading dropdowns for hierarchical data selections. NEVER dump massive datasets into a single dropdown. Force the user through a logical funnel (e.g., Country → Region → City) to prevent cognitive overload.

## STATE INITIALIZATION

- **ALWAYS** use the lazy initializer pattern for expensive initial state computations:
```javascript
// NEVER — executed on every re-render
const [state, setState] = useState(expensiveComputation());
// ALWAYS — executed only once
const [state, setState] = useState(() => expensiveComputation());
```
