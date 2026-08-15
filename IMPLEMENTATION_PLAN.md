# IMPLEMENTATION_PLAN.md

## Angular Online Bookstore — Implementation Plan

**Version:** 1.0  
**Status:** Ready for Implementation  
**Source:** REQUIREMENT.md v1.0  

---

## Table of Contents

1. [Angular Architecture](#1-angular-architecture)
2. [Folder Structure](#2-folder-structure)
3. [Routing Architecture](#3-routing-architecture)
4. [Component Architecture](#4-component-architecture)
5. [Services](#5-services)
6. [Models and Interfaces](#6-models-and-interfaces)
7. [State Management](#7-state-management)
8. [Mock Data Architecture](#8-mock-data-architecture)
9. [Authentication Architecture](#9-authentication-architecture)
10. [Catalogue Architecture](#10-catalogue-architecture)
11. [Basket Architecture](#11-basket-architecture)
12. [Checkout Architecture](#12-checkout-architecture)
13. [Payment Simulation](#13-payment-simulation)
14. [Gift Points](#14-gift-points)
15. [Order Management](#15-order-management)
16. [Recommendation Engine](#16-recommendation-engine)
17. [Cancellation Logic](#17-cancellation-logic)
18. [Responsive UI Architecture](#18-responsive-ui-architecture)
19. [Accessibility](#19-accessibility)
20. [Error Handling](#20-error-handling)
21. [Loading States](#21-loading-states)
22. [Testing Strategy](#22-testing-strategy)
23. [Git Workflow](#23-git-workflow)
24. [Implementation Phases](#24-implementation-phases)
25. [Acceptance Testing](#25-acceptance-testing)

---

## 1. Angular Architecture

### 1.1 Bootstrap Strategy

The application uses `bootstrapApplication()` in `src/main.ts` with a standalone `AppComponent`. There are **no NgModules** anywhere in the codebase. All providers are registered via `ApplicationConfig` in `src/app/app.config.ts`.

```
src/main.ts
  └── bootstrapApplication(AppComponent, appConfig)
        └── app.config.ts  (provideRouter, provideHttpClient, provideAnimations)
```

### 1.2 Core Principles

| Principle | Implementation |
|---|---|
| Standalone everywhere | Every component, pipe, and directive uses `standalone: true` |
| Signals-first state | `signal()` / `computed()` / `effect()` for all mutable shared state |
| RxJS for streams | `Observable` + `BehaviorSubject` for multi-step async flows (search debounce) |
| Lazy loading | Every feature route loaded via `loadComponent()` |
| No NgRx | Angular Signals replace NgRx for all state needs |
| Reactive Forms | All forms use `FormGroup` / `FormControl` / `Validators` |
| inject() DI | `inject()` function used in class body, never constructor injection |

### 1.3 Application Config (`app.config.ts`)

Providers registered at bootstrap:
- `provideRouter(routes, withComponentInputBinding())` — enables route param binding to component inputs
- `provideHttpClient(withFetch())` — enables `HttpClient` with Fetch API
- `provideAnimations()` — enables Angular animations for transitions

---

## 2. Folder Structure

```
e-bookstore/
├── src/
│   ├── main.ts
│   ├── styles.scss                          # Global tokens, resets, typography
│   ├── index.html
│   ├── assets/
│   │   ├── mock/
│   │   │   ├── books.json                   # 24+ books
│   │   │   ├── categories.json              # Genre list
│   │   │   └── reviews.json                 # Reviews per book
│   │   └── images/
│   │       └── placeholder-cover.svg        # Fallback book cover
│   └── app/
│       ├── app.component.ts                 # Root shell (router-outlet, navbar, footer)
│       ├── app.component.scss
│       ├── app.component.html
│       ├── app.config.ts                    # ApplicationConfig
│       ├── app.routes.ts                    # Top-level route definitions
│       │
│       ├── core/
│       │   ├── models/
│       │   │   ├── book.model.ts
│       │   │   ├── cart.model.ts
│       │   │   ├── user.model.ts
│       │   │   ├── order.model.ts
│       │   │   ├── review.model.ts
│       │   │   ├── category.model.ts
│       │   │   └── index.ts                 # Barrel export
│       │   ├── services/
│       │   │   ├── book.service.ts
│       │   │   ├── cart.service.ts
│       │   │   ├── wishlist.service.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── order.service.ts
│       │   │   ├── gift-points.service.ts
│       │   │   ├── recommendation.service.ts
│       │   │   ├── toast.service.ts
│       │   │   └── storage.service.ts       # localStorage wrapper
│       │   └── guards/
│       │       ├── auth.guard.ts
│       │       └── non-empty-cart.guard.ts
│       │
│       ├── shared/
│       │   ├── components/
│       │   │   ├── navbar/
│       │   │   ├── footer/
│       │   │   ├── book-card/
│       │   │   ├── star-rating/
│       │   │   ├── breadcrumb/
│       │   │   ├── spinner/
│       │   │   ├── skeleton-card/
│       │   │   ├── toast/
│       │   │   ├── modal/
│       │   │   ├── pagination/
│       │   │   └── badge/
│       │   ├── pipes/
│       │   │   ├── currency-gbp.pipe.ts
│       │   │   └── truncate.pipe.ts
│       │   └── directives/
│       │       └── img-fallback.directive.ts
│       │
│       └── features/
│           ├── home/
│           │   └── home.component.ts
│           ├── catalogue/
│           │   ├── catalogue.component.ts
│           │   └── components/
│           │       ├── filter-panel/
│           │       ├── filter-chips/
│           │       └── sort-control/
│           ├── book-detail/
│           │   └── book-detail.component.ts
│           ├── basket/
│           │   └── basket.component.ts
│           ├── checkout/
│           │   ├── checkout.component.ts
│           │   └── components/
│           │       ├── address-form/
│           │       ├── payment-form/
│           │       └── order-summary/
│           ├── order-confirmation/
│           │   └── order-confirmation.component.ts
│           ├── orders/
│           │   ├── order-list/
│           │   │   └── order-list.component.ts
│           │   └── order-detail/
│           │       └── order-detail.component.ts
│           ├── wishlist/
│           │   └── wishlist.component.ts
│           ├── account/
│           │   └── account.component.ts
│           ├── auth/
│           │   ├── login/
│           │   │   └── login.component.ts
│           │   └── register/
│           │       └── register.component.ts
│           └── not-found/
│               └── not-found.component.ts
├── AGENTS.md
├── REQUIREMENT.md
├── IMPLEMENTATION_PLAN.md
├── README.md
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── .eslintrc.json
└── .gitignore
```

---

## 3. Routing Architecture

### 3.1 Route Table

| Path | Component | Guard | Lazy |
|---|---|---|---|
| `` (empty) | `HomeComponent` | None | Yes |
| `catalogue` | `CatalogueComponent` | None | Yes |
| `catalogue/:id` | `BookDetailComponent` | None | Yes |
| `basket` | `BasketComponent` | None | Yes |
| `checkout` | `CheckoutComponent` | `authGuard`, `nonEmptyCartGuard` | Yes |
| `order-confirmation` | `OrderConfirmationComponent` | `authGuard` | Yes |
| `orders` | `OrderListComponent` | `authGuard` | Yes |
| `orders/:id` | `OrderDetailComponent` | `authGuard` | Yes |
| `wishlist` | `WishlistComponent` | `authGuard` | Yes |
| `account` | `AccountComponent` | `authGuard` | Yes |
| `login` | `LoginComponent` | None | Yes |
| `register` | `RegisterComponent` | None | Yes |
| `**` | `NotFoundComponent` | None | Yes |

### 3.2 Route Guards

**`authGuard`** (functional guard):
- Reads `AuthService.isLoggedIn()` signal
- If false: stores attempted URL in Router state, redirects to `/login`
- If true: allows activation

**`nonEmptyCartGuard`** (functional guard):
- Reads `CartService.totalItems()` computed signal
- If 0: redirects to `/basket`
- If > 0: allows activation

### 3.3 Route Configuration in `app.routes.ts`

All routes use `loadComponent()`. Route inputs binding (`withComponentInputBinding()`) allows `:id` to be injected directly as a component `@Input()`.

---

## 4. Component Architecture

### 4.1 Shell Components (always rendered)

| Component | Responsibility |
|---|---|
| `AppComponent` | Root shell. Renders `<app-navbar>`, `<router-outlet>`, `<app-footer>`, `<app-toast>` |
| `NavbarComponent` | Logo, search bar, nav links, basket badge, auth menu. Consumes `CartService.totalItems` and `AuthService.currentUser` signals directly. |
| `FooterComponent` | Static links. No service dependencies. |
| `ToastComponent` | Global notification host. Subscribes to `ToastService.toasts$` observable. Positioned fixed top-right. |

### 4.2 Shared Components

| Component | Inputs | Notes |
|---|---|---|
| `BookCardComponent` | `book: Book`, `compact?: boolean` | Emits `addToBasket`, `toggleWishlist` events. Wishlist state read from `WishlistService`. |
| `StarRatingComponent` | `rating: number`, `reviewCount?: number`, `size?: 'sm' \| 'md'` | Read-only display. Uses `aria-label`. |
| `BreadcrumbComponent` | `crumbs: Breadcrumb[]` | Purely presentational. |
| `SpinnerComponent` | `overlay?: boolean` | If `overlay=true`, covers parent container with semi-transparent backdrop. |
| `SkeletonCardComponent` | `count?: number` | Renders N placeholder cards during loading. |
| `ModalComponent` | `title`, `open`, `confirmLabel`, `cancelLabel` | Traps focus. Emits `confirmed`, `dismissed`. |
| `PaginationComponent` | `currentPage`, `totalPages` | Emits `pageChange`. |
| `BadgeComponent` | `label`, `variant: 'success' \| 'danger' \| 'info' \| 'muted'` | Status badges for orders. |

### 4.3 Feature Component Breakdown

#### HomeComponent
- Sections: Hero banner, Featured Books, New Arrivals, Top Rated, Recommended for You
- Data: Derives all book lists from `BookService` signals via `computed()`
- No form logic

#### CatalogueComponent
- Owns a local `filterState` signal (`{ genres, minPrice, maxPrice, minRating, sortBy, query, page }`)
- Derives `filteredBooks` and `paginatedBooks` as `computed()` from filterState + BookService books signal
- Sub-components: `FilterPanelComponent`, `FilterChipsComponent`, `SortControlComponent`
- Search input uses RxJS `Subject` + `debounceTime(300)` → updates filterState signal

#### BookDetailComponent
- Route param `:id` injected via `@Input()` (withComponentInputBinding)
- Derives book via `BookService.getById(id)`
- Tracks last-viewed genre in `sessionStorage` for recommendation engine
- Child sections: reviews list, "You Might Also Like" row, "Customers Also Bought" row

#### BasketComponent
- Reads `CartService.items` signal
- Quantity stepper, remove, save-for-later interactions delegate to `CartService`
- Order summary panel uses `CartService.subtotal` and `CartService.deliveryFee` computed signals

#### CheckoutComponent
- Internal `currentStep` signal (1 or 2) controls which sub-form is displayed
- Step 1: `AddressFormComponent` (Reactive Form)
- Step 2: `PaymentFormComponent` (Reactive Form) + `OrderSummaryComponent` (read-only)
- Place Order action calls `OrderService.placeOrder()` which returns mock Observable with 1.5s delay

#### OrderConfirmationComponent
- Reads order data from `Router` navigation state (`this.router.getCurrentNavigation().extras.state`)
- Falls back to `StorageService.get('ebk_last_order')` if navigated directly

#### OrderListComponent / OrderDetailComponent
- Read from `OrderService.getOrdersForCurrentUser()` (reads `ebk_orders` from localStorage)
- Cancel and Buy Again actions delegate to `OrderService` and `CartService`

---

## 5. Services

### 5.1 Service Responsibilities

| Service | Provided In | Primary Responsibility |
|---|---|---|
| `BookService` | `root` | Load and cache `books.json`. Expose `books` signal. Provide query methods. |
| `CartService` | `root` | Manage `items` signal. Persist to `ebk_cart`. Computed totals. |
| `WishlistService` | `root` | Manage `items` signal. Persist to `ebk_wishlist`. |
| `AuthService` | `root` | Mock login/register. Manage `currentUser` signal. Persist to `ebk_user` / `ebk_users`. |
| `OrderService` | `root` | Place orders. Read/write `ebk_orders`. Cancellation logic. |
| `GiftPointsService` | `root` | Earn, redeem, reverse points. Update `ebk_user.giftPoints` and `pointsHistory`. |
| `RecommendationService` | `root` | Compute recommendation lists from BookService signal. |
| `ToastService` | `root` | Emit toast messages via RxJS `Subject`. |
| `StorageService` | `root` | Typed `localStorage` wrapper with error handling. |

### 5.2 Service Interaction Map

```
AuthService ──────────────────────────────────► ebk_user (localStorage)
     │                                          ebk_users (localStorage)
     │
     ▼
GiftPointsService ◄──── OrderService ◄───────── CartService
     │                       │                       │
     ▼                       ▼                       ▼
ebk_user.giftPoints     ebk_orders              ebk_cart
ebk_user.pointsHistory  ebk_last_order
```

---

## 6. Models and Interfaces

### 6.1 `book.model.ts`

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  description: string;
  price: number;
  originalPrice: number | null;
  coverUrl: string;
  rating: number;
  reviewCount: number;
  isbn: string;
  publisher: string;
  publishedDate: string;
  pages: number;
  language: string;
  inStock: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  crossSellIds: string[];
}
```

### 6.2 `cart.model.ts`

```typescript
interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  quantity: number;
}
```

### 6.3 `user.model.ts`

```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;       // base64 obfuscation only — not real hashing
  giftPoints: number;
  pointsHistory: PointsTransaction[];
  savedAddress?: DeliveryAddress;
  createdAt: string;
}

interface PointsTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'reverse' | 'refund';
  points: number;
  orderId: string;
  date: string;
  description: string;
}
```

### 6.4 `order.model.ts`

```typescript
type OrderStatus = 'Processing' | 'Delivered' | 'Cancelled';

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  payment: PaymentSummary;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  quantity: number;
}

interface DeliveryAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

interface PaymentSummary {
  method: 'card' | 'points' | 'mixed';
  last4?: string;
  pointsUsed?: number;
  amountFromCard?: number;
}
```

### 6.5 `review.model.ts`

```typescript
interface Review {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}
```

### 6.6 `category.model.ts`

```typescript
interface Category {
  id: string;
  name: string;
  icon: string;         // Unicode emoji or icon name
  bookCount?: number;   // computed at runtime
}
```

### 6.7 Barrel Export (`index.ts`)

All interfaces exported from `src/app/core/models/index.ts`. All imports use `@core/models`.

---

## 7. State Management

### 7.1 Signal Architecture

| Signal | Owner | Type | Persisted |
|---|---|---|---|
| `books` | `BookService` | `Signal<Book[]>` | No (memory only — loaded once) |
| `isLoading` | `BookService` | `Signal<boolean>` | No |
| `items` | `CartService` | `Signal<CartItem[]>` | Yes — `ebk_cart` |
| `totalItems` | `CartService` | `computed` | Derived |
| `subtotal` | `CartService` | `computed` | Derived |
| `deliveryFee` | `CartService` | `computed` | Derived |
| `items` | `WishlistService` | `Signal<string[]>` (book IDs) | Yes — `ebk_wishlist` |
| `currentUser` | `AuthService` | `Signal<User \| null>` | Yes — `ebk_user` |
| `isLoggedIn` | `AuthService` | `computed` | Derived |

### 7.2 Signal Persistence Pattern

Every service with a persisted signal initialises from `StorageService` on construction and writes back via `effect()`:

```typescript
// Pattern used in CartService, WishlistService, AuthService
constructor() {
  const saved = this.storage.get<CartItem[]>('ebk_cart') ?? [];
  this._items = signal<CartItem[]>(saved);
  effect(() => {
    this.storage.set('ebk_cart', this._items());
  });
}
```

### 7.3 RxJS Usage

RxJS is used only for:
- Search input debounce (`Subject<string>` + `debounceTime(300)` in `CatalogueComponent`)
- Mock async delays in `OrderService.placeOrder()` (`of(order).pipe(delay(1500))`)
- Toast notification stream (`Subject<Toast>` in `ToastService`, `Observable<Toast>` consumed by `ToastComponent`)

`toSignal()` bridges all Observables to Signals in components where needed.

---

## 8. Mock Data Architecture

### 8.1 Data Files

**`src/assets/mock/books.json`** — Array of 24 `Book` objects spanning 6 genres:
- Fiction (4 books), Science Fiction (4), Non-Fiction (4), Mystery & Thriller (4), Fantasy (4), Biography (4)
- 4 books marked `isFeatured: true`
- 4 books marked `isNewArrival: true`
- 3 books marked `inStock: false` (to test out-of-stock states)
- Cover URLs: Open Library format `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`
- Each book has `crossSellIds` pointing to 2–3 other book IDs

**`src/assets/mock/categories.json`** — Array of 6 `Category` objects with id, name, emoji icon.

**`src/assets/mock/reviews.json`** — Array of reviews, grouped by `bookId`. 3 reviews per book = 72 review objects.

### 8.2 Data Loading Strategy

`BookService` loads `books.json` once on first injection via `HttpClient.get<Book[]>()`. The result is stored in a `WritableSignal`. A simulated 400ms delay (`delay(400)`) is applied before the signal is populated, enabling skeleton loading states to render.

`CategoriesService` (inline in `BookService`) loads `categories.json` similarly.

Reviews are loaded lazily in `BookDetailComponent` only when a detail page is visited.

### 8.3 Demo Account Seeding

On first application load, `AuthService` checks if `ebk_users` is empty. If so, it seeds the demo account:

```json
{
  "id": "demo-001",
  "firstName": "Demo",
  "lastName": "User",
  "email": "demo@ebookstore.com",
  "passwordHash": "RGVtbzEyMzQh",
  "giftPoints": 200,
  "pointsHistory": [],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

Pre-seeded orders for the demo account are stored directly in `ebk_orders` on first seed, covering all three statuses (Processing, Delivered, Cancelled).

---

## 9. Authentication Architecture

### 9.1 Flow

```
Register Page                Login Page
    │                            │
    ▼                            ▼
AuthService.register()      AuthService.login()
    │                            │
    ├── validate form            ├── find user in ebk_users
    ├── check email unique       ├── compare passwordHash
    ├── append to ebk_users      ├── set ebk_user
    ├── set ebk_user             └── emit currentUser signal
    └── emit currentUser signal
```

### 9.2 Password Handling

Passwords are stored as `btoa(password)` — base64 encoding. This is sufficient for a frontend-only mock. The `AuthService` explicitly documents this is not real hashing.

### 9.3 Session Restoration

On `AuthService` construction, the service reads `ebk_user` from localStorage and initialises `currentUser` signal. If the stored user exists in `ebk_users`, the session is restored. If not (data corruption), the session is cleared.

### 9.4 Return URL Strategy

`authGuard` saves the blocked URL using Angular Router navigation extras state:
```typescript
router.navigate(['/login'], { state: { returnUrl: blockedUrl } });
```
`LoginComponent` reads `router.getCurrentNavigation()?.extras?.state?.['returnUrl']` and redirects after successful login.

---

## 10. Catalogue Architecture

### 10.1 Filter State Signal

`CatalogueComponent` owns a single `filterState` signal:

```typescript
interface FilterState {
  query: string;
  genres: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page: number;
}
```

### 10.2 Derived Computeds

```
books (BookService signal)
    + filterState (local signal)
         │
         ▼
    filteredBooks = computed(() => filter + sort logic)
         │
         ▼
    totalPages = computed(() => Math.ceil(filteredBooks().length / PAGE_SIZE))
         │
         ▼
    paginatedBooks = computed(() => filteredBooks().slice(start, end))
```

All three derived computeds update reactively whenever `filterState` or `books` changes. No manual subscriptions needed.

### 10.3 Search Debounce

The search input emits to a `Subject<string>`. A `debounceTime(300)` pipe produces the final query string, which is then written to `filterState` via `patchFilterState({ query })`. This is the only RxJS usage in the catalogue.

### 10.4 Filter Chips

Active filters are derived as a `computed()` array of chip objects from `filterState`. Each chip has a `removeAction` callback that calls `patchFilterState()` to clear that specific filter. Clearing all filters resets to initial state.

---

## 11. Basket Architecture

### 11.1 CartService API

| Method | Signature | Notes |
|---|---|---|
| `addItem` | `(book: Book, qty?: number): void` | Increments if already in basket |
| `removeItem` | `(bookId: string): void` | Removes line item entirely |
| `updateQuantity` | `(bookId: string, qty: number): void` | Clamps to 1–10 |
| `clearCart` | `(): void` | Called after order placement |
| `moveToWishlist` | `(bookId: string): void` | Calls `WishlistService.addItem()`, then `removeItem()` |
| `items` | `Signal<CartItem[]>` | Read-only public signal |
| `totalItems` | `computed` | Sum of all quantities |
| `subtotal` | `computed` | Sum of `price × quantity` |
| `deliveryFee` | `computed` | `0` if subtotal ≥ 25, else `2.99` |
| `total` | `computed` | `subtotal + deliveryFee` |

### 11.2 Basket Page Layout

- Mobile: items stacked vertically, order summary below
- Desktop: 2-column layout, items left (66%), order summary right (33%)
- Empty state: centred illustration + "Browse Books" button

---

## 12. Checkout Architecture

### 12.1 Two-Step Flow

```
CheckoutComponent
  ├── currentStep: Signal<1 | 2>
  ├── addressForm: FormGroup   (step 1)
  ├── paymentForm: FormGroup   (step 2)
  │
  ├── Step 1: AddressFormComponent
  │     └── On valid submit → currentStep.set(2)
  │
  └── Step 2: PaymentFormComponent + OrderSummaryComponent
        └── On valid submit → OrderService.placeOrder()
              └── Observable<Order> (1.5s delay)
                    └── On success:
                          ├── CartService.clearCart()
                          ├── GiftPointsService.processOrderPoints()
                          └── Router.navigate('/order-confirmation', { state: { order } })
```

### 12.2 Address Form Fields

| Field | Validator |
|---|---|
| `firstName` | Required, minLength(2) |
| `lastName` | Required, minLength(2) |
| `line1` | Required |
| `line2` | Optional |
| `city` | Required |
| `postcode` | Required, pattern: UK postcode regex |
| `country` | Required |

Pre-population: if `AuthService.currentUser()?.savedAddress` exists, the form is patched on init.

### 12.3 Step Indicator Component

Internal to `CheckoutComponent`. Purely presentational. Shows step 1 and step 2 circles with active/completed states driven by `currentStep` signal.

---

## 13. Payment Simulation

### 13.1 Payment Form Logic

The `PaymentFormComponent` manages an internal `paymentMethod` signal (`'card' | 'points' | 'mixed'`):

- Default: `'card'`
- If user selects Gift Points and balance covers full total → `'points'`; card form hidden
- If user applies partial points → `'mixed'`; card form shown with remaining amount displayed

### 13.2 Card Form Fields

| Field | Validator | Notes |
|---|---|---|
| `cardholderName` | Required | |
| `cardNumber` | Required, exactly 16 digits after stripping spaces | Formatted as `XXXX XXXX XXXX XXXX` |
| `expiry` | Required, pattern `MM/YY`, must be future date | |
| `cvv` | Required, 3–4 digits | |

On blur, `cardNumber` field masks to `**** **** **** XXXX`.

### 13.3 Mock Processing

`OrderService.placeOrder()` returns `of(order).pipe(delay(1500))`. During this delay, `CheckoutComponent` shows a `SpinnerComponent` with `overlay=true` over the form.

### 13.4 Order Object Construction

`OrderService.placeOrder()` builds the `Order` object from:
- `CartService.items()` → mapped to `OrderItem[]`
- Address form value
- Payment form value
- `AuthService.currentUser()?.id`
- Generated UUID (`crypto.randomUUID()`)
- `estimatedDelivery`: `new Date()` + 3–5 business days (mock calculation)

---

## 14. Gift Points

### 14.1 GiftPointsService API

| Method | Signature | Notes |
|---|---|---|
| `getBalance` | `(): number` | Reads from `currentUser().giftPoints` |
| `getBalanceInGBP` | `(): number` | `balance / 100` |
| `earnPoints` | `(orderId: string, amountSpent: number): void` | `Math.floor(amountSpent) * 10` |
| `redeemPoints` | `(orderId: string, points: number): void` | Validates against balance |
| `reverseEarnedPoints` | `(orderId: string): void` | Called on cancellation |
| `refundRedeemedPoints` | `(orderId: string): void` | Called on cancellation |

### 14.2 Points Lifecycle

```
Place Order
  ├── redeemPoints() — if payment method includes points
  ├── earnPoints()   — based on card amount paid (not points-covered amount)
  └── append to pointsHistory

Cancel Order
  ├── reverseEarnedPoints() — deducts points earned from this order
  ├── refundRedeemedPoints() — restores points spent on this order
  └── append Cancelled event to pointsHistory
```

### 14.3 Floor Guard

`GiftPointsService` ensures balance never drops below 0:
```typescript
this.currentUser.update(u => ({
  ...u,
  giftPoints: Math.max(0, u.giftPoints - points)
}));
```

---

## 15. Order Management

### 15.1 OrderService API

| Method | Signature | Notes |
|---|---|---|
| `placeOrder` | `(payload: OrderPayload): Observable<Order>` | 1.5s mock delay |
| `getOrdersForCurrentUser` | `(): Order[]` | Reads `ebk_orders`, filters by `userId` |
| `getOrderById` | `(id: string): Order \| undefined` | |
| `cancelOrder` | `(orderId: string): void` | Updates status, triggers GiftPointsService |
| `reorderItem` | `(item: OrderItem): void` | Delegates to CartService.addItem() |
| `reorderAll` | `(order: Order): void` | Iterates items, delegates to CartService |

### 15.2 Order Storage

Orders are stored as a flat array in `localStorage` under `ebk_orders`. All users' orders coexist in the array. `getOrdersForCurrentUser()` filters by `userId`.

### 15.3 Buy Again Logic

```
reorderAll(order)
  For each item in order.items:
    ├── Find Book in BookService by bookId
    ├── If book.inStock === false → skip, collect for toast warning
    ├── Else → CartService.addItem(book, item.quantity)
  └── ToastService.show("X item(s) added to your basket", { link: '/basket' })
```

### 15.4 Pre-seeded Demo Orders

On demo account creation, 3 orders are inserted into `ebk_orders`:
- 1 × `Processing` (recent, eligible for cancellation)
- 1 × `Delivered` (older)
- 1 × `Cancelled` (oldest)

---

## 16. Recommendation Engine

### 16.1 RecommendationService

Pure computation over the `BookService.books` signal. No HTTP calls.

| Method | Logic |
|---|---|
| `getRecommendedForHome()` | Logged-in: genre of last order. Guest: genre from `sessionStorage('ebk_last_viewed_genre')`. Fallback: top 8 by rating. Returns up to 8 books. |
| `getSimilarBooks(book)` | Same genre, excluding `book.id`. Returns up to 4 books sorted by rating desc. |
| `getCrossSelections(book)` | Maps `book.crossSellIds` to Book objects. Returns up to 4. |

### 16.2 Last-Viewed Genre Tracking

`BookDetailComponent` writes `sessionStorage.setItem('ebk_last_viewed_genre', book.genre)` on component init. This is read by `RecommendationService.getRecommendedForHome()` for guest users.

---

## 17. Cancellation Logic

### 17.1 Cancel Order Flow

```
OrderDetailComponent: user clicks "Cancel Order"
  └── ModalComponent opens (confirmation)
        └── User clicks "Confirm Cancellation"
              ├── OrderService.cancelOrder(orderId)
              │     ├── Find order in ebk_orders
              │     ├── Set order.status = 'Cancelled'
              │     └── Write back to StorageService
              ├── GiftPointsService.reverseEarnedPoints(orderId)
              ├── GiftPointsService.refundRedeemedPoints(orderId)
              ├── ToastService.show("Order #XXXX has been cancelled")
              └── UI updates reactively (component re-reads from OrderService)
```

### 17.2 Reactive UI Update

`OrderDetailComponent` reads the order via a `computed()` that re-queries `OrderService.getOrderById(id)`. Because `OrderService.cancelOrder()` updates a `WritableSignal<Order[]>` (in-memory cache, synced to localStorage), the cancellation button disappears and the status badge updates without a page reload.

---

## 18. Responsive UI Architecture

### 18.1 SCSS Breakpoint Mixins

Defined in `src/styles.scss` as reusable mixins:

```scss
$bp-tablet:  640px;
$bp-desktop: 1024px;

@mixin tablet  { @media (min-width: #{$bp-tablet})  { @content; } }
@mixin desktop { @media (min-width: #{$bp-desktop}) { @content; } }
```

All component SCSS files use these mixins. No hardcoded pixel values outside `styles.scss`.

### 18.2 Catalogue Grid

```scss
.catalogue-grid {
  display: grid;
  grid-template-columns: 1fr;                         // mobile: 1 col
  @include tablet  { grid-template-columns: repeat(2, 1fr); }  // 2 cols
  @include desktop { grid-template-columns: repeat(4, 1fr); }  // 4 cols
}
```

### 18.3 Navbar Collapse

`NavbarComponent` has a `mobileMenuOpen` signal. On mobile, the nav links are hidden (`display: none`) and a hamburger button toggles the signal. The menu slides in via CSS transition.

### 18.4 Touch Targets

All `<button>` and `<a>` elements in component SCSS have `min-height: 44px; min-width: 44px` enforced via a global rule in `styles.scss`.

---

## 19. Accessibility

### 19.1 Focus Management

- Global focus style defined once in `styles.scss`:
  ```scss
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  ```
- `ModalComponent` uses `cdkTrapFocus` (Angular CDK) to lock focus within the open modal. CDK A11y module is the only CDK module imported.
- On modal close, focus returns to the trigger element (stored ref before open).

### 19.2 Skip Link

`AppComponent` template first child:
```html
<a class="skip-link" href="#main-content">Skip to main content</a>
<main id="main-content">
  <router-outlet />
</main>
```

CSS: visually hidden until focused.

### 19.3 Live Regions

`ToastComponent` wrapper: `role="region" aria-live="polite" aria-label="Notifications"`.  
Each individual toast added to the DOM triggers announcement.

### 19.4 Form Accessibility

Every form input uses `[id]` + `<label [for]>` pairing. Error message `<span>` linked via `[attr.aria-describedby]`. Invalid inputs have `[attr.aria-invalid]="control.invalid && control.touched"`.

---

## 20. Error Handling

### 20.1 StorageService

Wraps all `localStorage` operations in `try/catch`. On `QuotaExceededError`, emits a toast via `ToastService`: "Storage limit reached. Some data may not be saved."

### 20.2 HTTP / Asset Loading

`BookService` `.pipe(catchError(err => { this._loadError.set(true); return of([]); }))` on the JSON fetch. If books fail to load, the catalogue renders an error state with a retry button.

### 20.3 Image Fallback

`ImgFallbackDirective` on every `<img>` element listens for `(error)` event and replaces `src` with `/assets/images/placeholder-cover.svg`.

### 20.4 Unknown Route

`NotFoundComponent` on `**` wildcard route. Displays a message with links back to Home and Catalogue.

### 20.5 Empty Order Confirmation Guard

If `/order-confirmation` is navigated to without Router state and `ebk_last_order` is absent from storage, the component redirects to `/orders`.

---

## 21. Loading States

### 21.1 Book Loading

`BookService._isLoading` signal is `true` during the 400ms simulated fetch delay.

- `CatalogueComponent`: shows `<app-skeleton-card [count]="12">` while `isLoading()` is true
- `HomeComponent`: shows skeleton rows in each book section
- `BookDetailComponent`: shows a detail-page skeleton (large image placeholder + text lines)

### 21.2 Order Placement

`CheckoutComponent._isProcessing` signal is `true` during the 1.5s mock order placement. `<app-spinner [overlay]="true">` renders over the form. All form inputs and the "Place Order" button are `[disabled]="_isProcessing()"`.

### 21.3 Route Transitions

Angular Router `NavigationStart` → `NavigationEnd` events used in `AppComponent` to toggle a slim progress bar at the top of the page (pure CSS, no library).

---

## 22. Testing Strategy

### 22.1 Unit Tests — Services

| Service | Key Test Cases |
|---|---|
| `BookService` | Returns all books; filters by genre; search by title/author; loads from HTTP mock |
| `CartService` | Add item; add duplicate increments qty; remove; update qty; total/subtotal computed correctly; persists to storage |
| `AuthService` | Register creates user; login succeeds/fails; logout clears session; demo user seeded |
| `OrderService` | placeOrder emits order; cancelOrder updates status; reorderAll skips OOS items |
| `GiftPointsService` | Earn rate calculation; redeem deducts balance; cancel reverses correctly; balance never < 0 |
| `RecommendationService` | Returns correct genre slice; fallback to top-rated; cross-sells from IDs |

### 22.2 Unit Tests — Components

| Component | Key Test Cases |
|---|---|
| `BookCardComponent` | Renders all fields; out-of-stock disables button; wishlist icon toggles |
| `StarRatingComponent` | Renders correct aria-label; correct star fill |
| `CatalogueComponent` | Filter reduces book list; sort reorders; pagination advances |
| `CheckoutComponent` | Step 1 validates address; step 2 validates payment; place order triggers service |
| `NavbarComponent` | Badge shows correct count; hides at zero; auth state changes menu |

### 22.3 Test Setup Conventions

- All spec files co-located with source files
- `provideHttpClientTesting()` for HTTP-dependent services
- `TestBed.runInInjectionContext()` for services using `effect()`
- `MockProvider` pattern (manual, no library) for service dependencies in component tests
- `signal()` in tests created outside injection context where needed via `runInInjectionContext`

### 22.4 Coverage Target

- Services: ≥ 80% branch coverage
- Components: ≥ 1 test per component (smoke test minimum)
- Guards: 100% (simple enough to test exhaustively)

---

## 23. Git Workflow

### 23.1 Branch Strategy

```
main          ← production-ready, tagged releases
  └── develop ← integration branch
        └── feature/<phase>-<name>   e.g. feature/phase1-scaffold
        └── feature/<phase>-<name>   e.g. feature/phase2-catalogue
        └── fix/<name>
```

### 23.2 Commit Convention

Format: `<type>(<scope>): <description>`

| Type | Usage |
|---|---|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `chore` | Build, config, tooling |
| `docs` | README, REQUIREMENT.md, AGENTS.md |
| `style` | SCSS changes, formatting |
| `test` | Adding or modifying tests |
| `refactor` | Code restructure without behaviour change |

Examples:
- `feat(catalogue): add reactive filter panel with debounced search`
- `feat(cart): implement CartService with signal persistence`
- `fix(checkout): guard redirects to basket when cart is empty`

### 23.3 PR Strategy

One PR per implementation phase. Each PR merges `feature/<phase>` into `develop`. Final PR merges `develop` into `main`.

---

## 24. Implementation Phases

The project is divided into 7 sequential phases. Each phase is a self-contained deliverable that builds on the previous.

---

### Phase 1 — Project Scaffold & Design System
**Status:** `[x] complete`

**Notes:**
- Angular CLI 22.1.4 scaffolded (Angular 22, Node 24, TypeScript 6, Vitest — not Karma)
- Root component uses `app.ts` / `app.html` / `app.scss` (Angular 22 short names)
- `@angular/animations` added manually (not bundled by default in Angular 22 scaffold)
- `@angular/cdk` installed for future focus trap in modals
- `ignoreDeprecations: "6.0"` added to tsconfig for `baseUrl` (TypeScript 6 deprecation)
- `src/assets/` registered in `angular.json` to serve mock data at `/assets/`

**Intent:** Establish the Angular workspace, TypeScript configuration, SCSS design system, and base shell components. No feature logic.

**Todo List:**
- [ ] Run `ng new e-bookstore --standalone --routing --style=scss --strict` inside existing repo (skip git init)
- [ ] Configure `tsconfig.json` path aliases: `@core`, `@shared`, `@features`, `@assets`
- [ ] Configure `.eslintrc.json` with `@angular-eslint` rules
- [ ] Write `src/styles.scss` with all CSS custom property tokens, resets, typography, breakpoint mixins, button classes, focus styles, skip link, touch target rules
- [ ] Create `AppComponent` as root shell with `<router-outlet>`, placeholder `<app-navbar>`, `<app-footer>`
- [ ] Scaffold `NavbarComponent` (static, no service wiring yet)
- [ ] Scaffold `FooterComponent` (static links)
- [ ] Scaffold `NotFoundComponent`
- [ ] Configure `app.routes.ts` with wildcard `**` → `NotFoundComponent`
- [ ] Configure `app.config.ts` with `provideRouter`, `provideHttpClient`, `provideAnimations`
- [ ] Verify `ng serve` and `ng build` succeed with no errors

**Expected Outcomes:**
- App loads at `localhost:4200` with navbar, footer, and 404 page
- SCSS token system in place; no hardcoded colours anywhere
- TypeScript strict mode passing
- ESLint zero errors

---

### Phase 2 — Mock Data, Models & Core Services
**Status:** `[x] complete`

**Intent:** Create all TypeScript interfaces, mock JSON files, and core services. Establishes the data layer the entire application depends on.

**Todo List:**
- [ ] Create all model interfaces under `src/app/core/models/` with barrel `index.ts`
- [ ] Create `src/assets/mock/books.json` (24 books, 6 genres, correct schema)
- [ ] Create `src/assets/mock/categories.json` (6 categories)
- [ ] Create `src/assets/mock/reviews.json` (3 reviews per book)
- [ ] Create `src/assets/images/placeholder-cover.svg`
- [ ] Implement `StorageService` with typed get/set/remove and `try/catch` error handling
- [ ] Implement `BookService`: load books.json via HttpClient, `books` signal, 400ms simulated delay, `isLoading` signal, `getById()`, `getByGenre()`, `searchBooks()` methods
- [ ] Implement `ToastService`: `Subject<Toast>`, `show()` method with type and optional link
- [ ] Implement `ImgFallbackDirective`
- [ ] Write unit tests for `BookService`, `StorageService`

**Expected Outcomes:**
- All models compile cleanly under strict TypeScript
- `BookService.books()` signal populated from JSON
- `StorageService` handles quota errors gracefully
- Tests pass

---

### Phase 3 — Authentication & Shared UI Components
**Status:** `[x] complete`

**Intent:** Implement mock auth (register, login, logout, session restoration, auth guard), wire the navbar to auth state, and build all reusable shared UI components.

**Todo List:**
- [ ] Implement `AuthService`: register, login, logout, session restore from localStorage, `currentUser` signal, `isLoggedIn` computed, demo account seeding
- [ ] Implement `authGuard` functional guard with return URL preservation
- [ ] Build `LoginComponent` (Reactive Form, return URL redirect after login)
- [ ] Build `RegisterComponent` (Reactive Form, all AUTH-xx validations)
- [ ] Wire `NavbarComponent` to `AuthService.isLoggedIn()` and `AuthService.currentUser()`
- [ ] Build `ToastComponent` (consumes `ToastService`, fixed positioned, auto-dismiss, `aria-live`)
- [ ] Build `SpinnerComponent` (inline and overlay modes)
- [ ] Build `SkeletonCardComponent`
- [ ] Build `StarRatingComponent` with correct `aria-label`
- [ ] Build `BreadcrumbComponent`
- [ ] Build `ModalComponent` with focus trap (Angular CDK A11y)
- [ ] Build `BadgeComponent`
- [ ] Build `CurrencyGbpPipe` and `TruncatePipe`
- [ ] Add `ToastComponent` to `AppComponent` template
- [ ] Write unit tests for `AuthService`, `LoginComponent`, `RegisterComponent`

**Expected Outcomes:**
- Login and register flows work end-to-end with localStorage persistence
- Demo account logs in successfully
- Auth guard redirects and restores return URL
- All shared components render correctly
- Navbar shows correct auth state

---

### Phase 4 — Catalogue, Book Cards & Book Detail
**Status:** `[x] complete`

**Intent:** The core browsing experience — catalogue grid with reactive filtering/search/sort/pagination, book cards, and the book detail page with cross-sell sections.

**Todo List:**
- [ ] Build `BookCardComponent` (all CARD-xx requirements including out-of-stock, discount badge, wishlist toggle)
- [ ] Build `FilterPanelComponent` (genre checkboxes, price range, min rating)
- [ ] Build `FilterChipsComponent` (active filter chips with remove)
- [ ] Build `SortControlComponent` (dropdown)
- [ ] Build `PaginationComponent`
- [ ] Build `CatalogueComponent`: filterState signal, filteredBooks/paginatedBooks computed, RxJS debounced search, wires all sub-components
- [ ] Build `HomeComponent`: hero banner, featured/new arrivals/top-rated sections using `BookService` computed slices, skeleton loading states
- [ ] Implement `RecommendationService`
- [ ] Build `BookDetailComponent`: route param via `@Input()`, book display (DET-01 to DET-11), genre tracking in sessionStorage, "You Might Also Like" and "Customers Also Bought" sections
- [ ] Add skip link to `AppComponent`
- [ ] Write unit tests for `CatalogueComponent`, `BookCardComponent`, `RecommendationService`

**Expected Outcomes:**
- All 24 books display in the catalogue
- All filter/sort/search combinations work reactively
- Pagination works and preserves filters
- Book detail page displays all fields and recommendation sections
- Home page shows correctly with skeleton loading

---

### Phase 5 — Basket, Wishlist & CartService
**Status:** `[x] complete`

**Intent:** Implement CartService and WishlistService with signal persistence, basket page, wishlist page, and navbar badge.

**Todo List:**
- [ ] Implement `CartService` (all BAS-xx requirements, signal persistence, computed signals)
- [ ] Implement `WishlistService` (signal persistence, add/remove/isInWishlist methods)
- [ ] Build `BasketComponent` (all BAS-xx requirements, responsive layout, empty state)
- [ ] Wire `BookCardComponent` "Add to Basket" button to `CartService`
- [ ] Wire `BookCardComponent` wishlist heart icon to `WishlistService`
- [ ] Wire navbar basket badge to `CartService.totalItems`
- [ ] Build `WishlistComponent` (displays wishlist books, move to basket, remove)
- [ ] Implement `nonEmptyCartGuard`
- [ ] Write unit tests for `CartService`, `WishlistService`, `BasketComponent`

**Expected Outcomes:**
- Adding books updates navbar badge immediately
- Basket state survives page refresh
- Quantity changes recalculate totals reactively
- Delivery fee threshold (£25) works correctly
- Wishlist persists across refreshes
- Auth guard protects wishlist route

---

### Phase 6 — Checkout, Payment, Gift Points & Order Confirmation
**Status:** `[x] complete`

**Intent:** The complete purchase flow — two-step checkout, payment simulation, gift points redemption, order placement, and confirmation.

**Todo List:**
- [ ] Implement `GiftPointsService` (all GP-xx requirements)
- [ ] Implement `OrderService.placeOrder()` (mock 1.5s delay, order construction, localStorage write)
- [ ] Build `AddressFormComponent` (all CHK-04, CHK-05, CHK-06 requirements)
- [ ] Build `PaymentFormComponent` (all PAY-xx requirements: card form, gift points selector, partial/full logic)
- [ ] Build `OrderSummaryComponent` (read-only panel, used in checkout step 2)
- [ ] Build `CheckoutComponent` (two-step flow, step indicator, processing spinner)
- [ ] Build `OrderConfirmationComponent` (reads Router state or localStorage fallback)
- [ ] Wire `GiftPointsService` to award points on order confirmation
- [ ] Write unit tests for `GiftPointsService`, `OrderService`, `CheckoutComponent`

**Expected Outcomes:**
- Two-step checkout navigates forward/back without data loss
- Card validation works correctly
- Gift points balance displayed and deducted correctly
- Mixed payment (points + card) works
- Order saved to localStorage, basket cleared, confirmation page shown
- Points earned shown on confirmation

---

### Phase 7 — Order History, Buy Again, Cancellation & Polish
**Status:** `[x] complete`

**Intent:** Complete post-purchase journeys (order history, buy again, cancellation), account page with points history, and all final polish (responsive testing, accessibility audit, error states, loading states).

**Todo List:**
- [ ] Implement `OrderService.cancelOrder()`, `reorderItem()`, `reorderAll()`
- [ ] Build `OrderListComponent` (all ORD-xx requirements, status badges, newest-first)
- [ ] Build `OrderDetailComponent` (line items, address, payment, cancel button, buy again buttons)
- [ ] Wire cancel flow through `ModalComponent` confirmation + `GiftPointsService` point reversal
- [ ] Wire buy again flow through `CartService` with OOS skip + toast notification
- [ ] Build `AccountComponent` (user info, points balance, points transaction history)
- [ ] Verify all pre-seeded demo orders display correctly
- [ ] Responsive audit: test all breakpoints (320px, 640px, 1024px, 1440px)
- [ ] Accessibility audit: focus order, aria labels, skip link, modal trap, contrast
- [ ] Verify all `localStorage` keys are consistent across all services
- [ ] Add route transition progress bar to `AppComponent`
- [ ] Verify `ng build` produces zero errors/warnings
- [ ] Verify `ng lint` passes with zero errors
- [ ] Run all unit tests; achieve ≥ 80% service branch coverage
- [ ] Update `README.md` with setup instructions and feature list

**Expected Outcomes:**
- Order history lists all orders for demo account
- Cancellation updates status, reverses points, shows toast
- Buy Again adds items, skips OOS, shows toast with link
- Account page shows points balance and transaction log
- No horizontal scroll at 320px
- All accessibility requirements met
- Clean production build
- All tests passing

---

## 25. Acceptance Testing

The following maps each REQUIREMENT.md acceptance criterion to its implementation phase and verification method.

| AC ID | Criterion | Phase | Verification |
|---|---|---|---|
| AC-01 | All 24+ books in catalogue grid | 4 | Visual check + `BookService` unit test |
| AC-01 | Search filters reactively; no-results state | 4 | Manual filter test + `CatalogueComponent` unit test |
| AC-01 | Filters work independently and combined | 4 | `CatalogueComponent` computed unit tests |
| AC-01 | Pagination preserves filters | 4 | Manual navigation test |
| AC-02 | All book fields displayed | 4 | Visual check of `BookDetailComponent` |
| AC-02 | Quantity selector 1–10 | 4 | Boundary test in component spec |
| AC-02 | Recommendation sections populated | 4 | `RecommendationService` unit test |
| AC-03 | Navbar badge updates immediately | 5 | `CartService` unit test + visual |
| AC-03 | Basket survives refresh | 5 | localStorage persistence test |
| AC-03 | Quantity changes recalculate totals | 5 | `CartService.subtotal` computed test |
| AC-03 | Delivery fee logic | 5 | `CartService.deliveryFee` unit test |
| AC-04 | Registration creates user in `ebk_users` | 3 | `AuthService` unit test |
| AC-04 | Invalid login shows error | 3 | `LoginComponent` unit test |
| AC-04 | Demo account works | 3 | Integration test / manual |
| AC-04 | Protected routes redirect; return URL preserved | 3 | `authGuard` unit test |
| AC-05 | Two-step form navigates without data loss | 6 | `CheckoutComponent` unit test |
| AC-05 | Address validation blocks advancement | 6 | Form validator unit tests |
| AC-05 | Order placed: basket cleared, order saved, confirmation shown | 6 | `OrderService` unit test |
| AC-06 | Card form validates correctly | 6 | `PaymentFormComponent` unit tests |
| AC-06 | Gift points balance displayed and deducted | 6 | `GiftPointsService` unit test |
| AC-06 | Mixed payment works | 6 | `CheckoutComponent` integration test |
| AC-07 | New user starts with 200 points | 3 | `AuthService` unit test |
| AC-07 | Points earned at 10 pts/£1 | 6 | `GiftPointsService.earnPoints` unit test |
| AC-07 | Cancellation reverses points | 7 | `GiftPointsService.reverseEarnedPoints` unit test |
| AC-07 | Balance never below zero | 6+7 | `GiftPointsService` boundary test |
| AC-08 | Orders newest-first, correct badges | 7 | Visual check + `OrderService` unit test |
| AC-08 | Order Detail shows full data | 7 | `OrderDetailComponent` render test |
| AC-08 | Cancel updates status, adjusts points | 7 | `OrderService.cancelOrder` unit test |
| AC-09 | Buy Again adds correct items | 7 | `OrderService.reorderAll` unit test |
| AC-09 | OOS items skipped with toast | 7 | `OrderService.reorderAll` unit test |
| AC-09 | Toast includes "View Basket" link | 7 | `ToastService` mock assertion |
| AC-10 | Home recommendations change by genre | 4 | `RecommendationService` unit test |
| AC-10 | Fallback to top-rated | 4 | `RecommendationService` unit test |
| AC-10 | Cross-sell driven by `crossSellIds` | 4 | `RecommendationService` unit test |
| AC-11 | No horizontal overflow at 320px | 7 | Browser devtools responsive audit |
| AC-11 | Correct grid column counts | 7 | Browser devtools responsive audit |
| AC-11 | Navbar hamburger on mobile | 7 | Browser devtools + manual |
| AC-12 | All images have `alt` text | 7 | DOM inspection / accessibility audit |
| AC-12 | All inputs have labels | 7 | Accessibility audit |
| AC-12 | Modal traps focus | 7 | Keyboard navigation test |
| AC-12 | Skip-to-content link present | 7 | Keyboard tab test on each page |
