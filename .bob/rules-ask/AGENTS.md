# AGENTS.md — Ask Mode (Documentation / Q&A)

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Documentation Context

### "No backend" means all data is local assets
There is no API server, no REST endpoints, and no environment variables for API URLs. When a user asks "how does data loading work", the answer is always: `HttpClient` fetching static JSON files under `src/assets/mock/`.

### State management is Signals — not NgRx, not BehaviorSubjects alone
If asked about state management, the answer is Angular Signals (`signal`, `computed`, `effect`) in services. `BehaviorSubject` / RxJS is used only in services that need multi-subscriber observable streams (e.g., search input debounce). Do not suggest NgRx — it is explicitly excluded.

### "Auth" is entirely mocked
Login and register write a user object to `localStorage` key `ebk_user`. There is no JWT, no session token, and no real password hashing. `AuthService` reads that key on init to restore session.

### Two separate SCSS concerns
- `src/styles.scss` — global tokens, resets, typography (edit here for theme changes)
- Component `.scss` files — layout and component-specific rules only (consume tokens via `var()`)
Asking "where do I change the primary colour" → `src/styles.scss` only.

### Path aliases are configured in `tsconfig.json`
`@core` → `src/app/core/`, `@shared` → `src/app/shared/`, `@features` → `src/app/features/`, `@assets` → `src/assets/`. These are not Angular-default — they were added manually to `tsconfig.json` `paths`.

### Testing context
- `ng test` runs Karma in a headless Chrome. There is no Jest setup.
- Signal-based service tests require `TestBed.runInInjectionContext()` wrapper for `effect()`.
- HTTP-dependent services need `provideHttpClientTesting()`, not `HttpClientTestingModule` (deprecated in Angular 18+).
