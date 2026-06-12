# DEFENSIVE RENDERING

## LOADING STATES

- **NEVER** trust network speed. ALWAYS implement explicit `isLoading` states with skeleton loaders or spinners for every data-fetching operation.
- **NEVER** attempt to render array indexes (e.g., `data[0].image`) without optional chaining and loading guards. Always check `isLoading` AND `data` existence before rendering.
- **ALWAYS** release the loading state in a `finally` block. NEVER allow a failed API call to leave the UI in an infinite loading state.

## SAFE DATA ACCESS

- **ALWAYS** use safe mapping: NEVER map over an array without a fallback. Use `(data || []).map(...)` or `(data ?? []).map(...)` to prevent fatal runtime crashes when an API returns null, undefined, or an unexpected wrapper.
- **ALWAYS** use safe string manipulation: NEVER call `.replace()`, `.substring()`, or `.toLowerCase()` directly on API data. Wrap it: `String(variable || "").replace(...)`.
- **NEVER** trust API response shapes blindly. Implement a centralized unwrapper utility in your API client to safely extract data arrays from varying backend response wrappers (e.g., `{ data: [...] }` vs `[...]`).

## EMPTY STATES

- **ALWAYS** implement explicit `isEmpty` guards. When a list has zero items, render a meaningful empty state with:
  - A clear message explaining why the list is empty.
  - An actionable CTA to create the first item (if applicable).
  - An illustration or icon to prevent a stark blank area.
- **NEVER** render an empty container, an empty table, or a blank page when data is simply absent.

## ERROR BOUNDARIES

- **ALWAYS** scope error boundaries to the main content area (`<Outlet />` or page body). The sidebar and top navigation MUST remain visible and functional so the user can navigate away from a broken page.
- **ALWAYS** provide actionable fallbacks in error states: "Go Back", "Return to Dashboard", or "Retry" buttons. NEVER display raw stack traces or technical error messages to end users.
- **NEVER** use a single full-screen error boundary for the entire application. Multiple scoped boundaries are required.

## CONDITIONAL RENDERING

- **ALWAYS** handle all possible states for async data:
  1. **Loading** — Show skeleton/spinner.
  2. **Error** — Show error message with retry option.
  3. **Empty** — Show empty state with guidance.
  4. **Success** — Render the data.
- **NEVER** render a component that depends on async data without handling all four states above.

## OPTIMISTIC UPDATES

- **ALWAYS** implement optimistic updates for mutations where the expected outcome is highly predictable (e.g., toggling a like, updating a name). Roll back on failure.
- **NEVER** use optimistic updates for mutations with complex server-side validation or side effects that could fail unpredictably.

## FORM VALIDATION FEEDBACK

- **ALWAYS** display validation errors inline next to the offending field. NEVER display all errors in a single block at the top or bottom of the form.
- **ALWAYS** validate on blur for individual fields and on submit for the entire form. NEVER validate on every keystroke unless the field specifically requires it (e.g., password strength meter).

## TRUST BUT VERIFY FOR BULK ACTIONS

- **NEVER** dump bulk imported data (CSV/Excel uploads) directly into the database. ALWAYS parse the data, render it in a frontend preview grid for human review, and require a final "Submit" confirmation.
