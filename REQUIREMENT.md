# REQUIREMENT.md

## Angular Online Bookstore — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2025  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Objective](#2-business-objective)
3. [Target Users](#3-target-users)
4. [Functional Requirements](#4-functional-requirements)
5. [Customer Journeys](#5-customer-journeys)
6. [Product Catalogue Requirements](#6-product-catalogue-requirements)
7. [Authentication Requirements](#7-authentication-requirements)
8. [Basket Requirements](#8-basket-requirements)
9. [Checkout Requirements](#9-checkout-requirements)
10. [Payment Requirements](#10-payment-requirements)
11. [Gift Points Requirements](#11-gift-points-requirements)
12. [Order History Requirements](#12-order-history-requirements)
13. [Buy Again Requirements](#13-buy-again-requirements)
14. [Recommendation Requirements](#14-recommendation-requirements)
15. [Order Cancellation Requirements](#15-order-cancellation-requirements)
16. [UI/UX Requirements](#16-uiux-requirements)
17. [Accessibility Requirements](#17-accessibility-requirements)
18. [Responsive Design Requirements](#18-responsive-design-requirements)
19. [Technical Requirements](#19-technical-requirements)
20. [Non-Functional Requirements](#20-non-functional-requirements)
21. [Out of Scope](#21-out-of-scope)
22. [Acceptance Criteria](#22-acceptance-criteria)

---

## 1. Project Overview

The **e-Bookstore** is a frontend-only, single-page Angular application that simulates a fully functional online bookstore. It presents a curated catalogue of books across multiple genres, allows customers to browse, search, filter, and purchase books, and supports a complete mock e-commerce workflow — from product discovery through checkout, payment, and order history.

All data (books, users, orders) is mock data served from static JSON assets. Authentication, basket state, gift points, and order history are persisted in `localStorage` to survive page refreshes. No backend server, database, or real payment processor is involved.

---

## 2. Business Objective

| # | Objective |
|---|---|
| BO-01 | Deliver a realistic, production-quality e-commerce experience for online book purchasing. |
| BO-02 | Demonstrate an end-to-end Angular SPA architecture with signals-first state management. |
| BO-03 | Provide a strong capstone portfolio piece showcasing modern Angular 18+ patterns. |
| BO-04 | Implement all major e-commerce customer journeys: browse → discover → purchase → track → repeat. |
| BO-05 | Achieve a custom, branded visual identity using a Gray / Black / Warm Blue design system without any third-party component library. |

---

## 3. Target Users

### 3.1 Primary User — Registered Customer
A book buyer who creates an account, browses the catalogue, purchases books, earns gift points, views order history, and re-orders previous purchases.

### 3.2 Secondary User — Guest Shopper
A visitor who browses and searches the catalogue and adds items to a basket without logging in. Guest users must be prompted to log in or register before completing checkout.

### 3.3 Persona Summary

| Attribute | Registered Customer | Guest Shopper |
|---|---|---|
| Authentication | Required | Not required |
| Basket | Persisted (localStorage) | Persisted (localStorage, session) |
| Checkout | Available | Requires login first |
| Order History | Available | Not available |
| Gift Points | Available | Not available |
| Wishlist | Available | Not available |

---

## 4. Functional Requirements

### 4.1 Core Features

| ID | Feature | Priority |
|---|---|---|
| FR-01 | Browse paginated book catalogue | Must Have |
| FR-02 | Search books by title, author, or keyword | Must Have |
| FR-03 | Filter catalogue by genre, price range, and rating | Must Have |
| FR-04 | Sort catalogue by price, rating, title, newest | Must Have |
| FR-05 | View individual book detail page | Must Have |
| FR-06 | Add book to basket | Must Have |
| FR-07 | Update quantity or remove items from basket | Must Have |
| FR-08 | Mock checkout with delivery address form | Must Have |
| FR-09 | Mock payment with card or gift points | Must Have |
| FR-10 | Order confirmation page | Must Have |
| FR-11 | Mock user registration and login | Must Have |
| FR-12 | Persistent basket across page refreshes | Must Have |
| FR-13 | Wishlist (save for later) | Should Have |
| FR-14 | Gift points balance and redemption | Should Have |
| FR-15 | Order history list and detail | Should Have |
| FR-16 | Buy Again from order history | Should Have |
| FR-17 | Book recommendations on home and detail pages | Should Have |
| FR-18 | Order cancellation from order history | Should Have |
| FR-19 | Star rating display per book | Should Have |
| FR-20 | Responsive layout across mobile, tablet, desktop | Must Have |

---

## 5. Customer Journeys

### CJ-01: New Visitor — Browse and Discover

```
Landing on Home Page
  → Hero banner with featured/promoted books
  → Scrolls to "Featured Books" section (curated picks)
  → Scrolls to "New Arrivals" section
  → Scrolls to "Top Rated" section
  → Clicks a book card → navigates to Book Detail Page
  → Reads description, author, genre, rating, reviews
  → Clicks "Add to Basket"
  → Basket icon in navbar updates with item count badge
  → Continues browsing or proceeds to basket
```

### CJ-02: Catalogue Browse and Filter

```
Clicks "Browse" or "Catalogue" in navbar
  → Lands on Catalogue Page (paginated grid of all books)
  → Uses search bar to search by title or author
  → Applies genre filter (e.g., "Science Fiction")
  → Applies price range filter (e.g., £0 – £20)
  → Applies minimum rating filter (e.g., 4 stars+)
  → Sorts by "Price: Low to High"
  → Results update reactively (no page reload)
  → Clicks a book card → Book Detail Page
  → Adds to basket or wishlist
```

### CJ-03: Guest Checkout Attempt

```
Guest user adds books to basket
  → Clicks basket icon → Basket Page
  → Reviews items, quantities, and total
  → Clicks "Proceed to Checkout"
  → Redirected to Login Page (auth guard)
  → Prompted: "Please log in or create an account to continue"
  → Clicks "Create Account" → Register Page
  → Fills in name, email, password → submits
  → Redirected back to Checkout Page (basket preserved)
```

### CJ-04: Registered Customer — Full Purchase Flow

```
Logged-in user has books in basket
  → Clicks "Proceed to Checkout" from Basket Page
  → Checkout Page: Step 1 — Delivery Address
      • First name, last name, address line 1, address line 2
      • City, postcode, country (dropdown)
      • "Save this address" checkbox
  → Clicks "Continue to Payment"
  → Checkout Page: Step 2 — Payment
      • Selects payment method: Credit/Debit Card OR Gift Points
      • Card: mock card number, expiry, CVV fields
      • Gift Points: shows current balance, applies discount
      • Order summary panel visible throughout
  → Clicks "Place Order"
  → Mock processing animation (1–2 seconds)
  → Order Confirmation Page
      • Order number (generated UUID)
      • Summary of items ordered
      • Delivery address
      • Estimated delivery date (mock: today + 3–5 business days)
      • Gift points earned for this order
  → Basket cleared
  → Order saved to order history in localStorage
```

### CJ-05: Wishlist Management

```
Logged-in user browses catalogue
  → Clicks heart/bookmark icon on book card or detail page
  → Book added to Wishlist (toast notification)
  → Navigates to Wishlist Page (/wishlist)
  → Views all saved books
  → Clicks "Add to Basket" on a wishlist item
  → Optionally removes item from wishlist
  → Wishlist state persisted in localStorage
```

### CJ-06: Order History and Tracking

```
Logged-in user clicks "My Orders" in account menu
  → Order History Page: list of past orders (newest first)
      • Order number, date, total, status badge (Delivered / Processing / Cancelled)
  → Clicks an order → Order Detail Page
      • Full item list, quantities, prices
      • Delivery address used
      • Payment method used
      • Current status
      • "Cancel Order" button (if status is Processing)
      • "Buy Again" button per item or for whole order
```

### CJ-07: Buy Again

```
From Order History Detail Page
  → User clicks "Buy Again" on a single item OR "Reorder All"
  → Items added to current basket
  → Toast notification: "X items added to your basket"
  → User can navigate to basket to review before checking out
```

### CJ-08: Order Cancellation

```
From Order History Detail Page
  → User clicks "Cancel Order" (only available if status = Processing)
  → Confirmation modal: "Are you sure you want to cancel order #XXXXX?"
  → User confirms
  → Order status updated to "Cancelled" in localStorage
  → Gift points earned from that order are reversed
  → Toast notification: "Order #XXXXX has been cancelled"
  → Order History list reflects updated status
```

### CJ-09: Gift Points Redemption

```
During Checkout — Step 2 (Payment)
  → User selects "Use Gift Points" payment option
  → System displays current points balance (e.g., 350 pts = £3.50)
  → User can apply full or partial points balance
  → Remaining balance charged to card (if any)
  → On order confirmation: points used are deducted, new points earned are added
  → Points balance updated in localStorage
```

### CJ-10: Book Recommendations

```
On Home Page
  → "Recommended for You" section (based on most recently viewed genre)
  → Logged-in users: based on last purchased genre
  → Guest users: based on last viewed genre (sessionStorage)

On Book Detail Page
  → "You Might Also Like" section (same genre, excluding current book)
  → "Customers Also Bought" section (mock cross-sell data from books.json)
```

---

## 6. Product Catalogue Requirements

### 6.1 Book Data Model

Each book in `src/assets/mock/books.json` must contain:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID or slug) |
| `title` | `string` | Full book title |
| `author` | `string` | Author full name |
| `genre` | `string` | Primary genre category |
| `tags` | `string[]` | Secondary keywords/genres |
| `description` | `string` | Book synopsis (150–300 words) |
| `price` | `number` | Price in GBP (e.g., `12.99`) |
| `originalPrice` | `number \| null` | Pre-sale price for discount badge |
| `coverUrl` | `string` | Open Library cover image URL or placeholder |
| `rating` | `number` | Average rating (0–5, one decimal) |
| `reviewCount` | `number` | Number of reviews |
| `isbn` | `string` | ISBN-13 |
| `publisher` | `string` | Publisher name |
| `publishedDate` | `string` | ISO date string |
| `pages` | `number` | Page count |
| `language` | `string` | e.g., `"English"` |
| `inStock` | `boolean` | Stock availability flag |
| `isFeatured` | `boolean` | Appears in Home featured section |
| `isNewArrival` | `boolean` | Appears in New Arrivals section |
| `crossSellIds` | `string[]` | IDs of "Customers Also Bought" books |

### 6.2 Catalogue Page Requirements

| ID | Requirement |
|---|---|
| CAT-01 | Display books in a responsive grid (1 / 2 / 3 / 4 columns across breakpoints) |
| CAT-02 | Pagination: 12 books per page, previous/next controls + page number display |
| CAT-03 | Search bar filters results reactively as the user types (debounced 300ms) |
| CAT-04 | Genre filter: multi-select checkboxes populated from `categories.json` |
| CAT-05 | Price range filter: dual-handle slider or min/max input fields |
| CAT-06 | Minimum rating filter: star selector (1–5) |
| CAT-07 | Sort control: Title A–Z, Title Z–A, Price Low–High, Price High–Low, Rating, Newest |
| CAT-08 | Active filter chips shown below search bar; each chip has an ✕ to remove |
| CAT-09 | "No results" empty state with suggested actions when filters yield zero books |
| CAT-10 | Out-of-stock books shown with greyed styling and "Out of Stock" badge; add-to-basket disabled |

### 6.3 Book Card Component Requirements

| ID | Requirement |
|---|---|
| CARD-01 | Display: cover image, title (truncated at 2 lines), author, price, star rating |
| CARD-02 | Show discount badge if `originalPrice > price` |
| CARD-03 | Show "Out of Stock" overlay if `inStock === false` |
| CARD-04 | "Add to Basket" button (disabled when out of stock) |
| CARD-05 | Wishlist heart icon toggle (filled when in wishlist) |
| CARD-06 | Entire card is clickable and navigates to Book Detail Page |

### 6.4 Book Detail Page Requirements

| ID | Requirement |
|---|---|
| DET-01 | Large cover image with fallback placeholder on load error |
| DET-02 | Full title, author, genre, tags, rating, review count |
| DET-03 | Price with original price strikethrough if discounted |
| DET-04 | Quantity selector (1–10) before add-to-basket |
| DET-05 | "Add to Basket" and "Add to Wishlist" action buttons |
| DET-06 | Full description with expand/collapse for long text |
| DET-07 | Book metadata: ISBN, publisher, published date, pages, language |
| DET-08 | Mock reviews section: display top 3 reviews from `reviews` field in books.json |
| DET-09 | "You Might Also Like" section (same genre, max 4 cards) |
| DET-10 | "Customers Also Bought" section (driven by `crossSellIds`, max 4 cards) |
| DET-11 | Breadcrumb: Home > Catalogue > [Genre] > [Title] |

---

## 7. Authentication Requirements

### 7.1 Mock Authentication Model

Authentication is simulated entirely in the frontend using `localStorage`. No real credentials are validated against any backend. The `AuthService` manages session state via Angular Signals.

| ID | Requirement |
|---|---|
| AUTH-01 | Register page: first name, last name, email, password, confirm password fields |
| AUTH-02 | Registration validates: all fields required, valid email format, password ≥ 8 characters, passwords match |
| AUTH-03 | On successful registration, user object stored in `localStorage` key `ebk_users` (array) and session started |
| AUTH-04 | Login page: email and password fields |
| AUTH-05 | Login validates credentials against `ebk_users` in localStorage; shows error on mismatch |
| AUTH-06 | Active session stored in `localStorage` key `ebk_user` (current user object) |
| AUTH-07 | `AuthService.isLoggedIn()` is a `computed` signal derived from the presence of `ebk_user` |
| AUTH-08 | Auth guard applied to `/checkout`, `/wishlist`, `/orders`, and `/account` routes |
| AUTH-09 | Logout clears `ebk_user` from localStorage and redirects to Home |
| AUTH-10 | Navbar shows "Login / Register" when logged out; shows user first name + avatar initial + "Logout" when logged in |
| AUTH-11 | Redirect to originally intended page after successful login (using Router state) |
| AUTH-12 | Pre-seeded demo account available: `demo@ebookstore.com` / `Demo1234!` |

---

## 8. Basket Requirements

| ID | Requirement |
|---|---|
| BAS-01 | Basket state managed as a `signal<CartItem[]>` in `CartService` |
| BAS-02 | Basket persisted to `localStorage` key `ebk_cart` via `effect()` on every change |
| BAS-03 | Basket restored from `localStorage` on application boot |
| BAS-04 | Navbar basket icon displays item count badge (total quantity of all items) |
| BAS-05 | Adding the same book increments quantity rather than duplicating the line item |
| BAS-06 | Basket page displays: cover thumbnail, title, author, unit price, quantity stepper, line total, remove button |
| BAS-07 | Order summary panel: subtotal, estimated delivery (free over £25, else £2.99), total |
| BAS-08 | Empty basket state: illustration and "Browse Books" CTA |
| BAS-09 | "Save for Later" moves item from basket to wishlist (requires login) |
| BAS-10 | Quantity stepper: minimum 1, maximum 10 per line item |
| BAS-11 | `CartService.totalItems` and `CartService.subtotal` are `computed` signals |
| BAS-12 | Basket count badge hidden (not shown as zero) when basket is empty |

---

## 9. Checkout Requirements

### 9.1 Checkout Flow

The checkout is a two-step process rendered in a single `CheckoutComponent` with internal step navigation.

| ID | Requirement |
|---|---|
| CHK-01 | Auth guard: unauthenticated users redirected to Login with return URL |
| CHK-02 | Empty basket guard: navigating to `/checkout` with empty basket redirects to `/basket` |
| CHK-03 | Step indicator shows current step (1 of 2) and completed steps |
| CHK-04 | Step 1 — Delivery Address (Reactive Form): first name, last name, address line 1, address line 2 (optional), city, postcode, country |
| CHK-05 | Address validation: required fields enforced, postcode format validated |
| CHK-06 | "Save this address" checkbox pre-populates address on next visit (stored in user object in localStorage) |
| CHK-07 | Step 2 — Payment: payment method selector, order summary (read-only), place order button |
| CHK-08 | "Back" button on Step 2 returns to Step 1 without data loss |
| CHK-09 | Form validation errors displayed inline with accessible error messages |
| CHK-10 | "Place Order" triggers a 1.5-second mock processing state (spinner overlay) |
| CHK-11 | After processing, navigates to `/order-confirmation` with order data passed via Router state |
| CHK-12 | Order object saved to `localStorage` key `ebk_orders` (appended to array) |
| CHK-13 | Basket cleared after successful order placement |

---

## 10. Payment Requirements

| ID | Requirement |
|---|---|
| PAY-01 | Two payment methods offered: "Credit / Debit Card" and "Gift Points" |
| PAY-02 | Card payment form: cardholder name, card number (16 digits, formatted as groups of 4), expiry MM/YY, CVV (3–4 digits) |
| PAY-03 | Card number field masks all but last 4 digits on blur |
| PAY-04 | Card form validation: all fields required, card number exactly 16 digits, expiry in future, CVV 3–4 digits |
| PAY-05 | Gift Points option visible only if user has a non-zero points balance |
| PAY-06 | Gift Points display: current balance in points and equivalent GBP value (100 pts = £1.00) |
| PAY-07 | User can choose to apply full balance or a partial amount (input field, max = balance, max = order total) |
| PAY-08 | If gift points cover full order total, card form is hidden |
| PAY-09 | If gift points are partial, card form is shown for remaining balance |
| PAY-10 | All payment processing is entirely mock — no real payment gateway is called |
| PAY-11 | Order confirmation shows: payment method used, last 4 digits of card (if card used), points deducted (if points used) |

---

## 11. Gift Points Requirements

| ID | Requirement |
|---|---|
| GP-01 | Every registered user starts with a default opening balance of 200 gift points |
| GP-02 | Earn rate: 10 points per £1.00 spent (rounded down) on each order |
| GP-03 | Points are awarded on Order Confirmation and added to `ebk_user.giftPoints` in localStorage |
| GP-04 | Redemption rate: 100 points = £1.00 discount |
| GP-05 | Points balance visible on Account page and in Payment step during checkout |
| GP-06 | Order cancellation reverses points earned from that order (deducted from balance) |
| GP-07 | Points redeemed in a cancelled order are refunded back to balance |
| GP-08 | Points balance can never go below zero |
| GP-09 | Transaction history (earn / redeem / reverse) stored in `ebk_user.pointsHistory` array |
| GP-10 | Points history displayed on Account page as a simple transaction log |

---

## 12. Order History Requirements

| ID | Requirement |
|---|---|
| ORD-01 | Order history page (`/orders`) lists all orders from `ebk_orders` in localStorage for current user |
| ORD-02 | Orders displayed newest-first |
| ORD-03 | Each order row shows: order number, date, number of items, total, status badge |
| ORD-04 | Status badges: `Processing` (blue), `Delivered` (green), `Cancelled` (red/grey) |
| ORD-05 | Clicking an order navigates to Order Detail page (`/orders/:id`) |
| ORD-06 | Order Detail page shows: all line items (cover, title, qty, price), delivery address, payment method, total, status, estimated delivery date |
| ORD-07 | "Cancel Order" button shown only when status is `Processing` |
| ORD-08 | "Buy Again" button shown on each line item and as "Reorder All" at order level |
| ORD-09 | Empty state shown if user has no orders |
| ORD-10 | Mock orders are pre-seeded for the demo account to demonstrate populated history |

---

## 13. Buy Again Requirements

| ID | Requirement |
|---|---|
| BA-01 | "Buy Again" on a single item adds that item (qty 1) to the current basket |
| BA-02 | "Reorder All" adds all items from the order to the basket at their original quantities |
| BA-03 | If a reordered item is out of stock, it is skipped and the user is notified via toast |
| BA-04 | If a reordered item is already in the basket, quantity is incremented (not duplicated) |
| BA-05 | After Buy Again action, a toast notification confirms: "X item(s) added to your basket" with a "View Basket" link |
| BA-06 | Basket is not automatically opened — user decides when to proceed |

---

## 14. Recommendation Requirements

| ID | Requirement |
|---|---|
| REC-01 | Home page "Recommended for You" section (max 8 books) |
| REC-02 | For logged-in users: recommendations drawn from the genre of their most recent order |
| REC-03 | For guest users: recommendations drawn from the genre of the most recently viewed book (stored in `sessionStorage`) |
| REC-04 | If no history exists, fall back to highest-rated books overall |
| REC-05 | Book Detail page "You Might Also Like": up to 4 books in the same genre, excluding the current book |
| REC-06 | Book Detail page "Customers Also Bought": up to 4 books from the `crossSellIds` field |
| REC-07 | Recommendation sections are implemented as a horizontally scrollable card row on mobile |
| REC-08 | All recommendations are computed client-side from the in-memory books signal — no API calls |

---

## 15. Order Cancellation Requirements

| ID | Requirement |
|---|---|
| CAN-01 | Cancel Order action available only from Order Detail page |
| CAN-02 | Cancel button visible only when order status is `Processing` |
| CAN-03 | Clicking Cancel opens a confirmation modal with order number and total displayed |
| CAN-04 | Modal has two actions: "Confirm Cancellation" (destructive, red button) and "Keep Order" (secondary button) |
| CAN-05 | On confirmation: order status updated to `Cancelled` in `ebk_orders` localStorage |
| CAN-06 | Points earned from the cancelled order are reversed from `ebk_user.giftPoints` |
| CAN-07 | If points were redeemed in the cancelled order, the redeemed points are refunded to `ebk_user.giftPoints` |
| CAN-08 | A `Cancelled` event appended to `ebk_user.pointsHistory` |
| CAN-09 | Toast notification confirms cancellation with order number |
| CAN-10 | UI updates reactively — no page reload required |

---

## 16. UI/UX Requirements

### 16.1 Design System

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1A3A5C` | Primary buttons, links, headings |
| `--color-accent` | `#2E6DA4` | Hover states, secondary actions, icons |
| `--color-bg` | `#F5F5F5` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, panels |
| `--color-text` | `#1C1C1C` | Body text |
| `--color-muted` | `#6B7280` | Secondary text, labels, placeholders |
| `--color-border` | `#E5E7EB` | Card borders, dividers |
| `--color-success` | `#16A34A` | Success states, "Delivered" badge |
| `--color-warning` | `#D97706` | Warning states |
| `--color-danger` | `#DC2626` | Error states, "Cancelled" badge, destructive actions |

### 16.2 Typography

- Font stack: `-apple-system, "Segoe UI", system-ui, sans-serif`
- Base font size: 15px, line-height 1.6
- Heading scale: h1 28px / h2 22px / h3 18px / h4 15px (bold)

### 16.3 Component Standards

| ID | Requirement |
|---|---|
| UX-01 | All interactive elements have visible focus states (2px solid `--color-accent` outline) |
| UX-02 | Primary buttons: filled `--color-primary` background, white text, 8px border-radius |
| UX-03 | Secondary buttons: outlined `--color-primary` border, transparent background |
| UX-04 | Destructive buttons: filled `--color-danger` background, white text |
| UX-05 | Toast notifications appear in top-right corner, auto-dismiss after 4 seconds, with manual close |
| UX-06 | Modal overlays: semi-transparent `rgba(0,0,0,0.5)` backdrop, white modal panel, centred |
| UX-07 | Loading/skeleton states shown while mock data is being "fetched" (simulated 400ms delay) |
| UX-08 | Breadcrumb navigation on Catalogue, Book Detail, and Order Detail pages |
| UX-09 | Smooth page transitions (CSS fade, 200ms) between route changes |
| UX-10 | Navbar: fixed at top, collapses to hamburger menu on mobile |
| UX-11 | Footer: links to Home, Catalogue, About (static page), Contact (static page) |
| UX-12 | 404 Not Found page for unmatched routes |

---

## 17. Accessibility Requirements

| ID | Requirement |
|---|---|
| ACC-01 | All images have meaningful `alt` attributes; decorative images use `alt=""` |
| ACC-02 | Colour contrast ratio ≥ 4.5:1 for all body text (WCAG AA) |
| ACC-03 | All form inputs have associated `<label>` elements or `aria-label` |
| ACC-04 | Error messages are linked to inputs via `aria-describedby` |
| ACC-05 | Modal dialogs trap keyboard focus and are announced via `role="dialog"` and `aria-modal="true"` |
| ACC-06 | Toast notifications use `role="alert"` or `aria-live="polite"` |
| ACC-07 | Skip-to-main-content link as first focusable element on every page |
| ACC-08 | Star rating component uses `aria-label` conveying numeric value (e.g., "Rating: 4.2 out of 5") |
| ACC-09 | Basket item count badge uses `aria-label` (e.g., "3 items in basket") |
| ACC-10 | All interactive elements reachable and operable via keyboard alone |

---

## 18. Responsive Design Requirements

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column; hamburger nav; horizontal scroll carousels |
| Tablet | 640px – 1024px | 2-column catalogue grid; condensed navbar |
| Desktop | > 1024px | 3–4 column catalogue grid; full navbar |

| ID | Requirement |
|---|---|
| RES-01 | No horizontal scroll at any supported breakpoint (320px minimum) |
| RES-02 | Catalogue grid responds to breakpoints: 1 / 2 / 3 / 4 columns |
| RES-03 | Checkout form stacks vertically on mobile |
| RES-04 | Basket page stacks order summary below items on mobile |
| RES-05 | Recommendation rows use horizontal overflow scroll with hidden scrollbar on mobile |
| RES-06 | Book detail page: cover image above metadata on mobile; side-by-side on desktop |
| RES-07 | Touch targets minimum 44×44px for all interactive elements on mobile |

---

## 19. Technical Requirements

### 19.1 Framework & Language

| Requirement | Value |
|---|---|
| Framework | Angular 18+ (latest stable) |
| Language | TypeScript (strict mode) |
| Component model | Standalone components only (no NgModules) |
| Build tool | Angular CLI with `@angular-devkit/build-angular` |
| Package manager | npm |
| Styling | SCSS with CSS custom properties (no Tailwind, no Bootstrap, no Carbon) |

### 19.2 Angular Architecture

| Requirement | Detail |
|---|---|
| State management | Angular Signals (`signal`, `computed`, `effect`); RxJS for observable streams only |
| Routing | Angular Router with `loadComponent()` lazy loading per feature route |
| HTTP | `HttpClient` fetching `/assets/mock/*.json` (no real API endpoints) |
| Forms | Reactive Forms (`FormGroup`, `FormControl`, `Validators`) |
| Path aliases | `@core`, `@shared`, `@features`, `@assets` configured in `tsconfig.json` |
| No NgRx | NgRx / ComponentStore must not be used |

### 19.3 Persistence

| Data | localStorage Key | Notes |
|---|---|---|
| Current user session | `ebk_user` | Cleared on logout |
| Registered users array | `ebk_users` | Append-only from registration |
| Basket contents | `ebk_cart` | Synced via `effect()` |
| Wishlist | `ebk_wishlist` | Synced via `effect()` |
| All orders | `ebk_orders` | Append-only, updated on cancel |
| Last order (confirmation) | `ebk_last_order` | Overwritten on each new order |

### 19.4 Mock Data Files

| File | Content |
|---|---|
| `src/assets/mock/books.json` | 24+ books across 6+ genres |
| `src/assets/mock/categories.json` | Genre list with id, name, icon |
| `src/assets/mock/reviews.json` | 3–5 mock reviews per book |

### 19.5 Source Control

- Repository: GitHub (`e-bookstore`)
- Branch strategy: `main` (production), `develop` (integration), feature branches (`feature/<name>`)
- Commits: conventional commit format (`feat:`, `fix:`, `chore:`, `docs:`)

---

## 20. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Initial page load (dev build) under 5 seconds on a standard connection |
| NFR-02 | Route navigation transitions complete within 300ms |
| NFR-03 | No console errors or warnings in production build |
| NFR-04 | TypeScript strict mode enabled — no `any` types except where unavoidable |
| NFR-05 | ESLint passes with zero errors on `npm run lint` |
| NFR-06 | All components have at least one unit test; services have ≥ 80% branch coverage |
| NFR-07 | Application functions correctly in latest Chrome, Firefox, Edge, and Safari |
| NFR-08 | `localStorage` quota errors handled gracefully (catch block, user notification) |
| NFR-09 | Application does not make any outbound network requests except for book cover images |
| NFR-10 | All user-facing strings are in English; no hardcoded copy in TypeScript files (use template strings) |

---

## 21. Out of Scope

The following are explicitly **not** in scope for this project:

| Feature | Reason |
|---|---|
| Real backend API | Frontend-only project |
| Real database | No server-side persistence |
| Real payment processing | Mock flow only; no payment gateway integration |
| Real email notifications | No backend to send emails |
| Carbon Design System | Explicitly excluded; custom SCSS design system only |
| Third-party UI libraries (Material, PrimeNG, etc.) | Custom CSS only |
| Server-Side Rendering (SSR) / Angular Universal | Out of scope for this phase |
| Progressive Web App (PWA) | Out of scope for this phase |
| i18n / multi-language | English only |
| Admin / CMS interface | Customer-facing only |
| Real product inventory management | Mock `inStock` flag only |
| Search Engine Optimisation (SEO) | No SSR; not applicable |
| Multi-currency | GBP only |
| Social login (Google, Facebook) | Mock auth only |
| Book file downloads (ePub, PDF) | UI only; no actual file assets |

---

## 22. Acceptance Criteria

### AC-01: Catalogue
- [ ] All 24+ books rendered from `books.json` in the catalogue grid
- [ ] Search filters results reactively; "no results" state shown when applicable
- [ ] Genre, price, and rating filters work independently and in combination
- [ ] Pagination advances correctly and preserves active filters

### AC-02: Book Detail
- [ ] All book fields displayed correctly
- [ ] Quantity selector constrains to 1–10
- [ ] "You Might Also Like" and "Customers Also Bought" sections populated

### AC-03: Basket
- [ ] Adding a book updates the navbar badge immediately
- [ ] Basket state survives a page refresh
- [ ] Quantity changes recalculate subtotal and total in real time
- [ ] Delivery fee logic: free ≥ £25, else £2.99

### AC-04: Authentication
- [ ] Registration creates user in `ebk_users` and starts session
- [ ] Login with invalid credentials shows inline error
- [ ] Demo account `demo@ebookstore.com` / `Demo1234!` works out of the box
- [ ] Protected routes redirect to login; return URL preserved

### AC-05: Checkout
- [ ] Two-step form navigates forward and backward without data loss
- [ ] Address validation prevents advancing with empty/invalid fields
- [ ] Order placed: basket cleared, order in `ebk_orders`, confirmation page shown

### AC-06: Payment
- [ ] Card form validates number, expiry, CVV correctly
- [ ] Gift points balance displayed correctly and deducted on order
- [ ] Partial points + card combined payment works correctly

### AC-07: Gift Points
- [ ] New user starts with 200 points
- [ ] Points earned calculated at 10 pts/£1 and awarded on confirmation
- [ ] Cancellation reverses earned points and refunds redeemed points
- [ ] Balance never goes below zero

### AC-08: Order History
- [ ] Orders listed newest-first with correct status badges
- [ ] Order Detail shows full line items, address, and payment method
- [ ] Cancel Order updates status and adjusts points balance

### AC-09: Buy Again
- [ ] Single item and full order reorder add correct items to basket
- [ ] Out-of-stock items skipped with toast notification
- [ ] Toast includes "View Basket" link

### AC-10: Recommendations
- [ ] Home page recommendations change based on last-viewed/purchased genre
- [ ] Fallback to top-rated if no history present
- [ ] Cross-sell section on Book Detail driven by `crossSellIds`

### AC-11: Responsive Design
- [ ] No horizontal overflow at 320px viewport width
- [ ] Catalogue grid shows correct column count at each breakpoint
- [ ] Navbar collapses to hamburger on mobile

### AC-12: Accessibility
- [ ] All images have `alt` text
- [ ] All form inputs have labels
- [ ] Modal traps focus and is announced by screen readers
- [ ] Skip-to-content link present on all pages
