# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project
Angular **22** (CLI 22.1.4) frontend-only e-bookstore. No backend, no database. All data is served from `src/assets/mock/*.json` via `HttpClient`. Custom UI only — no Carbon Design System.

## Essential Commands
```bash
npm start                  # ng serve (dev server, port 4200)
npm run build              # ng build (production, default)
npm run build -- --configuration development   # dev build
npm test                   # ng test (Vitest — NOT Karma)
npm run lint               # ng lint (ESLint)
```

## Angular 22 Naming Conventions (differ from older guides)
- Root component file is `src/app/app.ts` (not `app.component.ts`)
- Root template is `src/app/app.html`, styles `src/app/app.scss`
- CLI-generated components also use short names (e.g. `home.ts`) — this project uses long names (`home.component.ts`) for all non-root components for clarity
- Test runner is **Vitest** (not Karma/Jasmine). Spec files use `vitest` APIs.
- Assets in `public/` are served at root; `src/assets/` is additionally configured in `angular.json` to serve at `/assets/`

## Architecture Constraints
- **Standalone components only** — no NgModules. Every component/pipe/directive uses `standalone: true`.
- **Lazy-loaded feature routes** — all feature pages live under `src/app/features/<name>/` and are loaded via `loadComponent()` in `app.routes.ts`.
- **Signals-first state** — cart, wishlist, and auth state are `signal()`/`computed()` in their respective services. Use `toSignal()` to bridge `Observable` → Signal in components.
- **Mock data path** — JSON files live at `src/assets/mock/`. `HttpClient` fetches them as `/assets/mock/books.json`. The `assets` glob in `angular.json` covers `src/assets/**` automatically.
- **No NgRx** — signals + services is the state layer. Do not introduce NgRx or ComponentStore.

## Key File Locations
| Purpose | Path |
|---|---|
| App bootstrap | `src/main.ts` |
| Router config | `src/app/app.routes.ts` |
| Global styles / theme tokens | `src/styles.scss` |
| Core models | `src/app/core/models/` |
| Core services | `src/app/core/services/` |
| Shared components | `src/app/shared/components/` |
| Feature pages | `src/app/features/<feature>/` |
| Mock JSON data | `src/assets/mock/` |

## Theming — CSS Custom Properties (non-negotiable)
All colours must reference the tokens defined in `src/styles.scss`:
```scss
--color-primary: #1A3A5C   // Warm Blue
--color-bg:      #F5F5F5   // Light Gray
--color-text:    #1C1C1C   // Near Black
--color-accent:  #2E6DA4   // Mid Blue
--color-muted:   #6B7280   // Gray-500
```
Never hardcode colour values in component SCSS files.

## Code Style (non-obvious rules)
- Use `inject()` function (not constructor injection) for all DI in standalone components.
- Cart/wishlist signals must also be persisted to `localStorage` via `effect()` on service init — state would otherwise reset on page refresh.
- `AuthService` stores the mock session in `localStorage` under the key `ebk_user`.
- All model interfaces live in `src/app/core/models/` and are **exported from a barrel** `index.ts` — always import from the barrel, not from individual files.
- Reactive Forms for checkout and auth forms; Template-driven forms are not used in this project.
- Pipes live in `src/app/shared/pipes/` — always declare them `standalone: true` and add to the consuming component's `imports` array directly.

## Testing
- Spec files live alongside their source file (e.g., `book.service.spec.ts` next to `book.service.ts`).
- Services that use `HttpClient` must use `provideHttpClientTesting()` in `TestBed`.
- Signal-based services: call `TestBed.runInInjectionContext(() => service.method())` when testing code that uses `effect()`.
