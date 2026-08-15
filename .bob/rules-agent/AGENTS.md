# AGENTS.md — Agent Mode (Coding)

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Coding Rules

### Dependency Injection
Always use `inject()` inside the class body — **not** constructor parameters. This is the project-wide convention for standalone components:
```ts
// Correct
export class BookDetailComponent {
  private bookService = inject(BookService);
}
// Wrong — constructor injection is not used here
constructor(private bookService: BookService) {}
```

### Signal Persistence Pattern
Cart and wishlist services **must** sync their signal state to `localStorage` on every change using `effect()` in the constructor. Forgetting this causes state loss on refresh:
```ts
constructor() {
  effect(() => {
    localStorage.setItem('ebk_cart', JSON.stringify(this.items()));
  });
}
```

### Mock Data Loading
Services load JSON via `HttpClient` using a relative `/assets/mock/` URL. The service must be provided in `provideHttpClient()` at bootstrap level (`main.ts`), not in individual components.

### Route Params → Signal Bridge
In feature components that read route params, use `toSignal(this.route.paramMap)` — do NOT subscribe manually. Unsubscribed observables cause memory leaks in this project's SPA flow.

### Barrel Imports — Mandatory
Models are always imported from `src/app/core/models/index.ts` barrel:
```ts
// Correct
import { Book, CartItem } from '@core/models';
// Wrong
import { Book } from '@core/models/book.model';
```
The `@core` path alias is configured in `tsconfig.json`.

### Lazy Loading — `loadComponent()` Only
All feature routes use `loadComponent()`, never `loadChildren()` (no feature modules exist):
```ts
{ path: 'catalog', loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) }
```

### SCSS — No Hardcoded Colours
Component `.scss` files must reference `var(--color-*)` tokens only. Running lint will catch violations if the custom stylelint rule is active, but agents must enforce this manually during code generation.

### `HttpClient` for Mock JSON
The mock JSON fetch returns a cold `Observable`. Always pipe with `catchError` in services and expose the result as a `signal` via `toSignal(obs$, { initialValue: [] })` — never leave it as a raw observable in the template.
