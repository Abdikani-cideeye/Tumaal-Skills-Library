# NAVIGATION AND OFFLINE

## NAVIGATOR ARCHITECTURE

- **ALWAYS** use strict conditional rendering for authentication-based navigation:
```jsx
if (isAuthenticated) return <MainStack />;
return <AuthStack />;
```
- **NEVER** stack an Auth Navigator on top of a Main Tab Navigator. This leaves the Tab Bar mounted in the background, causing "ghost screens," watermark bleed-throughs on the login screen, and wasted memory.
- **ALWAYS** unmount navigators that are not active. An unmounted navigator releases its screens, event listeners, and state from memory.

## TAB NAVIGATION

- **ALWAYS** limit bottom tab navigation to 3-5 tabs. More than 5 creates visual clutter and forces tiny touch targets.
- **ALWAYS** use icons with labels for tab bar items. Icons alone are ambiguous; labels alone waste space.
- **ALWAYS** persist tab state when switching between tabs. The user expects to return to the same scroll position and sub-screen they left.

## DEEP LINKING

- **ALWAYS** implement deep linking for key screens in the application. Users should be able to navigate directly to a specific screen via a URL (e.g., from a push notification or email link).
- **ALWAYS** handle deep links gracefully when the user is not authenticated. Redirect to login and navigate to the intended screen after successful authentication.
- **ALWAYS** validate deep link parameters before navigating. Malformed or malicious deep links MUST NOT crash the app.

## SCREEN TRANSITIONS

- **ALWAYS** use platform-native transitions (iOS: slide from right, Android: fade/slide up) unless the design explicitly requires custom transitions.
- **NEVER** use jarring, instant screen changes. Even a 200ms fade transition is better than no transition.
- **ALWAYS** implement shared element transitions for visual continuity when navigating between a list item and its detail screen (e.g., a card expanding into a full-screen view).

## OFFLINE-FIRST PERSISTENCE

- **ALWAYS** implement offline-first data persistence for mobile applications where users may have intermittent connectivity:
  - Cache critical read data locally (e.g., SQLite, WatermelonDB, MMKV, AsyncStorage for small datasets).
  - Queue write operations locally and sync when connectivity is restored.
- **ALWAYS** show the user cached data immediately while fetching fresh data in the background. NEVER show a loading spinner when cached data is available.
- **ALWAYS** indicate to the user when they are viewing offline/cached data (e.g., a subtle banner: "You're offline. Showing cached data.").

## SYNC STRATEGY

- **WHEN** implementing offline sync:
  - **ALWAYS** use optimistic writes with a sync queue. Write locally first, mark as "pending sync," and push to the server when online.
  - **ALWAYS** implement conflict resolution. If the server data changed while the user was offline, decide who wins (last-write-wins, merge, or user prompt).
  - **ALWAYS** implement retry logic with exponential backoff for failed syncs.
  - **NEVER** silently drop failed sync operations. Log them and notify the user if manual intervention is required.

## MEMORY MANAGEMENT

- **ALWAYS** clean up event listeners, timers, and subscriptions in the screen's cleanup function (e.g., `useEffect` return, `componentWillUnmount`). Memory leaks in mobile apps cause crashes.
- **ALWAYS** use `useFocusEffect` (or equivalent) instead of `useEffect` for operations that should run when a screen comes into focus (e.g., refreshing data). `useEffect` only runs on mount, but screens in a stack navigator may not unmount.
- **NEVER** keep heavy resources (large images, video players, WebSocket connections) alive on screens that are not visible.
