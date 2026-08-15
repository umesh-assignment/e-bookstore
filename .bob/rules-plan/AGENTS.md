# AGENTS.md — Plan Mode (Architecture / Design)

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Architectural Constraints

### Standalone-only — no NgModules anywhere
The entire app is bootstrapped with `bootstrapApplication()` in `main.ts`. There are no feature modules, no shared modules, no app module. Architectural plans must never propose a module. Providers are configured via `ApplicationConfig` in `app.config.ts`.

### Lazy loading is per-component, not per-module
Because there are no modules, code-splitting is achieved with `loadComponent()` in `app.routes.ts`. Each feature folder (`src/app/features/<name>/`) contains exactly one routed component plus its sub-components (not lazy-loaded separately).

### Signal ownership — one service, one signal
Each piece of global state (cart items, wishlist, current user) is owned by exactly one service. Components never hold writeable signals for shared state — they call service methods. This prevents split-brain state bugs.

### `localStorage` as persistence layer
The app has no session/cookie infrastructure. Cart, wishlist, and auth state survive refresh only via `localStorage`. Any new persistent state must follow the same `effect()` → `localStorage` pattern already used in `CartService` and `WishlistService`. Do not plan for IndexedDB or sessionStorage.

### Order flow is entirely client-side
Checkout does not call any endpoint. On "Place Order", `CartService.clearCart()` is called and an order summary object is saved to `localStorage` (key `ebk_last_order`). `OrderConfirmationComponent` reads from that key. Planning a real payment gateway or API integration is out of scope.

### Search is client-side filter over in-memory signal
`BookService` holds all books in a `signal<Book[]>`. Catalog filtering and search are `computed()` derivations of that signal filtered by query params. There is no server-side search — do not plan for debounced API calls.

### Route guard — mock only
`AuthGuard` checks `AuthService.isLoggedIn()` (a `computed` signal). It redirects to `/login` if false. The guard is applied only to `/checkout` and `/wishlist`. Extending it to other routes requires updating `app.routes.ts` only.

### Image strategy
Book cover images reference Open Library Covers API URLs stored directly in `src/assets/mock/books.json` (`coverUrl` field). There is no local image asset management. A fallback placeholder URL must be included in every `Book` object for offline/404 resilience.
