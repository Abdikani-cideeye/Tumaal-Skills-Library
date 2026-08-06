# PERFORMANCE OPTIMIZATION

## CODE SPLITTING

- **ALWAYS** implement code splitting at the route level. Only the code needed for the current route should load initially; additional routes load lazily on navigation.
- **NEVER** over-split. Excessive code splitting degrades performance due to the increased number of network requests. Split at route boundaries and heavy feature boundaries only.
- **ALWAYS** provide a loading fallback (skeleton or spinner) for lazily loaded routes.

## COMPONENT OPTIMIZATION

- **ALWAYS** keep state as close as possible to where it is used. Moving state up unnecessarily causes re-renders in sibling components that do not depend on that state.
- **ALWAYS** split global state into multiple targeted stores according to usage. A single monolithic store triggers unnecessary re-renders across the entire component tree.
- **ALWAYS** leverage the `children` prop as the most basic optimization. JSX passed as `children` represents an isolated VDOM structure that does not re-render when the parent's state changes.
```jsx
// Optimized: PureComponent won't re-render on count change
<Counter>
  <PureComponent />
</Counter>
```
- **NEVER** wrap every component in `React.memo` / `useMemo` / `useCallback` by default. Profile first, optimize only measured bottlenecks. Premature memoization adds complexity without benefit.

## IMAGE OPTIMIZATION

- **ALWAYS** lazy load images that are not in the initial viewport using `loading="lazy"` or Intersection Observer.
- **ALWAYS** use modern image formats (WebP, AVIF) for faster loading. Provide fallbacks for older browsers.
- **ALWAYS** use `srcset` and `sizes` attributes to serve the optimal image resolution for the client's screen size.
- **ALWAYS** specify explicit `width` and `height` attributes on images to prevent Cumulative Layout Shift (CLS).
- **NEVER** serve unoptimized, full-resolution images. Compress and resize on upload or use an image CDN with on-the-fly transformation.

## STYLING PERFORMANCE

- **ALWAYS** prefer zero-runtime styling solutions (CSS Modules, Tailwind, vanilla-extract) over runtime CSS-in-JS (styled-components, Emotion) for performance-critical applications. Runtime solutions generate styles on every render.
- **ALWAYS** keep CSS specificity flat and predictable. Deep nesting and `!important` overrides create maintenance nightmares and performance overhead.

## DATA PREFETCHING

- **ALWAYS** prefetch data for likely next navigations (e.g., prefetch page 2 data when viewing page 1, prefetch detail data on hover/focus of a list item).
- **ALWAYS** prefetch critical above-the-fold resources using `<link rel="preload">` for fonts, critical CSS, and hero images.

## WEB VITALS

- **ALWAYS** monitor Core Web Vitals in production:
  - **LCP (Largest Contentful Paint):** Target < 2.5s. Optimize critical rendering path, preload hero images.
  - **FID/INP (Interaction to Next Paint):** Target < 200ms. Minimize main thread blocking, defer non-critical JS.
  - **CLS (Cumulative Layout Shift):** Target < 0.1. Set explicit dimensions on media, avoid dynamic content injection above the fold.
- **ALWAYS** run Lighthouse audits before deployment. Performance scores below 80 require investigation.

## BUNDLE SIZE

- **ALWAYS** analyze bundle size with a bundle analyzer tool before each release. Identify and eliminate unexpectedly large dependencies.
- **NEVER** import entire utility libraries when only a single function is needed. Use tree-shakeable imports or standalone utility packages.
- **ALWAYS** remove unused dependencies from `package.json`. Dead dependencies increase install time and attack surface.

## SERVER-SIDE RENDERING

- **ALWAYS** fetch data server-side where possible for public-facing content to ensure optimal SEO and first-paint performance.
- **ALWAYS** use streaming SSR when available to progressively send HTML to the client before all data is resolved.
