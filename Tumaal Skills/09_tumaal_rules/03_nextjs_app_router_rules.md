# NEXT.JS APP ROUTER RULES

> **Stack:** Next.js (App Router), React Server Components, TypeScript, Tailwind CSS.

## SERVER COMPONENTS BY DEFAULT

- **ALWAYS** use React Server Components (RSC) by default. NEVER add `'use client'` unless the component genuinely needs browser APIs, event handlers, or client-side state.
- **ALWAYS** minimize `'use client'` scope. If a page needs one interactive widget, extract ONLY that widget into a small client component. The rest of the page stays as RSC.
- **NEVER** use `'use client'` for data fetching or state management. Fetch data server-side and pass it as props.
- **ALWAYS** wrap client components in `<Suspense>` with a meaningful fallback (skeleton loader, spinner):
```tsx
<Suspense fallback={<PostsSkeleton />}>
  <PostsList />
</Suspense>
```

## DATA FETCHING

- **ALWAYS** fetch data directly in Server Components using `async` functions. No `useEffect`, no `useState` for initial data.
```tsx
// ALWAYS — Server Component
export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```
- **ALWAYS** use `fetch()` with appropriate caching and revalidation strategies:
  - `{ cache: 'force-cache' }` — Static data, cached until revalidated.
  - `{ next: { revalidate: 3600 } }` — ISR, revalidate every hour.
  - `{ cache: 'no-store' }` — Dynamic data, never cached.
- **WHEN** using TanStack Query with App Router, ALWAYS hydrate the query cache server-side using `HydrationBoundary`:
```tsx
// Server Component — prefetch and dehydrate
const queryClient = new QueryClient();
await queryClient.prefetchQuery(postsQueryOptions());
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <PostsList /> {/* Client Component reads from pre-populated cache */}
  </HydrationBoundary>
);
```
- **ALWAYS** create one `QueryClient` per request on the server. Create one `QueryClient` per browser session on the client (via `useState` in the provider).

## SERVER ACTIONS

- **ALWAYS** use Server Actions for form mutations and data writes:
```tsx
// app/posts/actions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createPost(data: { title: string; body: string }) {
  const post = await db.post.create({ data });
  revalidatePath('/posts');
  return post;
}
```
- **ALWAYS** validate Server Action inputs with Zod schemas. NEVER trust client-submitted data.
- **ALWAYS** use `useActionState` (React 19) instead of deprecated `useFormState` for managing form submission state.
- **ALWAYS** model expected errors as return values from Server Actions. Use `try/catch` ONLY for unexpected errors.

## ROUTING AND FILE CONVENTIONS

- **ALWAYS** follow Next.js App Router file conventions:
  - `page.tsx` — Route UI.
  - `layout.tsx` — Shared layout (persists across child navigations).
  - `loading.tsx` — Loading UI (Suspense fallback for the route segment).
  - `error.tsx` — Error boundary (`'use client'` required).
  - `not-found.tsx` — 404 UI.
  - `route.ts` — API route handler (replaces Pages Router API routes).
- **ALWAYS** use `layout.tsx` for shared navigation and providers. NEVER duplicate layout elements across pages.
- **ALWAYS** keep route handlers (`route.ts`) thin. Parse/validate input and call a service function. NEVER put business logic in route handlers.

## METADATA AND SEO

- **ALWAYS** export `metadata` or `generateMetadata()` from page and layout files:
```tsx
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Posts — Tumaal',
  description: 'Browse all published posts.',
};
```
- **ALWAYS** use dynamic `generateMetadata()` for pages with dynamic content (e.g., product detail pages).
- **ALWAYS** use the Next.js `<Image>` component for optimized image loading with WebP, lazy loading, and explicit `width`/`height`.

## PROJECT STRUCTURE

- **ALWAYS** place `app/` and `components/` under a `src/` directory:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── posts/
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   └── _components/    ← private, route-specific components
│   └── api/
│       └── posts/route.ts
├── components/
│   └── ui/                  ← shared, reusable primitives
├── features/                ← domain-specific business logic
├── lib/                     ← utilities, config, API clients
├── providers/               ← QueryProvider, ThemeProvider
└── queries/                 ← TanStack Query key factories + options
```
- **ALWAYS** use `_components/` (underscore prefix) inside route directories for page-private components. Keep `components/` for cross-page shared components.

## PERFORMANCE

- **ALWAYS** use dynamic imports (`next/dynamic`) for heavy, non-critical client components:
```tsx
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```
- **ALWAYS** optimize Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **NEVER** fetch data client-side in `useEffect` when it can be fetched server-side. Client waterfalls destroy LCP.
- **ALWAYS** use `next/font` for font optimization. NEVER load fonts via `<link>` tags.

## ENVIRONMENT VARIABLES

- **ALWAYS** prefix client-exposed env vars with `NEXT_PUBLIC_`. NEVER expose server secrets.
- **ALWAYS** validate environment variables at startup using a Zod schema in `src/lib/env.ts`.
- **NEVER** import `process.env` directly throughout the codebase. Centralize in one validated config module.

## ERROR HANDLING

- **ALWAYS** implement `error.tsx` at the root and critical route segments. Error boundaries MUST be `'use client'`.
- **ALWAYS** provide `reset` and "Go Back" actions in error fallback UIs.
- **ALWAYS** implement `not-found.tsx` for graceful 404 handling.
- **ALWAYS** implement `global-error.tsx` for root-level error boundary.
