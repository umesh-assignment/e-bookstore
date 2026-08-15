import { Injectable, inject, signal, effect } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Order, OrderItem, OrderPayload, OrderStatus } from '@core/models';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { GiftPointsService } from './gift-points.service';
import { BookService } from './book.service';
import { ToastService } from './toast.service';

const STORAGE_KEY            = 'ebk_orders';
const LAST_ORDER_KEY         = 'ebk_last_order';
const ORDER_DELAY_MS         = 1500;
/** 48 hours expressed in milliseconds */
const CANCELLATION_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly storage     = inject(StorageService);
  private readonly auth        = inject(AuthService);
  private readonly cart        = inject(CartService);
  private readonly points      = inject(GiftPointsService);
  private readonly books       = inject(BookService);
  private readonly toastSvc    = inject(ToastService);

  /** In-memory order cache — single source of truth for reactive updates */
  private readonly _orders = signal<Order[]>(
    this.storage.get<Order[]>(STORAGE_KEY) ?? []
  );

  constructor() {
    // Seed demo orders if none exist for the demo account
    this.seedDemoOrdersIfNeeded();

    // Persist to localStorage on every change
    effect(() => {
      this.storage.set(STORAGE_KEY, this._orders());
    });
  }

  // ── Seeding ───────────────────────────────────────────────────────────────

  private seedDemoOrdersIfNeeded(): void {
    const existing = this._orders();
    const demoOrdersExist = existing.some(o => o.userId === 'demo-001');
    if (demoOrdersExist) return;

    const demoAddress = {
      id:        'addr-demo-001',
      label:     'Home',
      firstName: 'Demo',
      lastName:  'User',
      line1:     '10 Bookshelf Lane',
      city:      'London',
      postcode:  'EC1A 1BB',
      country:   'United Kingdom',
    };

    const demoOrders: Order[] = [
      {
        id:               'ord-demo-001',
        userId:           'demo-001',
        items: [
          { bookId: 'book-008', title: 'Project Hail Mary',     author: 'Andy Weir',          coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg', price: 14.99, quantity: 1 },
          { bookId: 'book-012', title: 'Atomic Habits',         author: 'James Clear',        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', price: 15.99, quantity: 1 },
        ],
        deliveryAddress:  demoAddress,
        payment:          { method: 'card', last4: '4242', amountFromCard: 30.98 },
        subtotal:         30.98,
        deliveryFee:      0,
        total:            30.98,
        pointsEarned:     300,
        pointsRedeemed:   0,
        status:           'Processing',
        // 1 hour ago — clearly within the 48-hour cancellation window for demo
        createdAt:        new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id:               'ord-demo-002',
        userId:           'demo-001',
        items: [
          { bookId: 'book-009', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062316110-L.jpg', price: 14.99, quantity: 1 },
          { bookId: 'book-011', title: 'Educated', author: 'Tara Westover',     coverUrl: 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg', price: 12.99, quantity: 2 },
        ],
        deliveryAddress:  demoAddress,
        payment:          { method: 'mixed', last4: '4242', pointsUsed: 100, amountFromCard: 37.97 },
        subtotal:         40.97,
        deliveryFee:      0,
        total:            39.97,
        pointsEarned:     150,
        pointsRedeemed:   100,
        status:           'Delivered',
        createdAt:        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id:               'ord-demo-003',
        userId:           'demo-001',
        items: [
          { bookId: 'book-005', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg', price: 13.99, quantity: 1 },
        ],
        deliveryAddress:  demoAddress,
        payment:          { method: 'card', last4: '4242', amountFromCard: 16.98 },
        subtotal:         13.99,
        deliveryFee:      2.99,
        total:            16.98,
        pointsEarned:     130,
        pointsRedeemed:   0,
        status:           'Cancelled',
        createdAt:        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this._orders.update(orders => [...orders, ...demoOrders]);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  getOrdersForCurrentUser(): Order[] {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return [...this._orders()]
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this._orders().find(o => o.id === id);
  }

  // ── Place Order ───────────────────────────────────────────────────────────

  /**
   * Simulate a 1.5-second async order placement.
   * Returns an Observable<Order> that emits once after the delay.
   */
  placeOrder(payload: OrderPayload): Observable<Order> {
    const cardAmount = payload.total - this.points.pointsToGBP(payload.pointsRedeemed);

    const order: Order = {
      ...payload,
      id:               crypto.randomUUID(),
      pointsEarned:     Math.floor(cardAmount) * 10,
      status:           'Processing',
      createdAt:        new Date().toISOString(),
      estimatedDelivery: this.calcEstimatedDelivery(),
    };

    return of(order).pipe(
      delay(ORDER_DELAY_MS),
      // Side-effects run when the consumer subscribes
    );
  }

  /**
   * Finalise a placed order: persist it, clear cart, award points.
   * Called by CheckoutComponent after the placeOrder() Observable resolves.
   */
  finaliseOrder(order: Order): void {
    // Persist
    this._orders.update(orders => [order, ...orders]);
    this.storage.set(LAST_ORDER_KEY, order);

    // Award points on the card-paid amount
    const cardAmount = order.total - this.points.pointsToGBP(order.pointsRedeemed);
    if (order.pointsRedeemed > 0) {
      this.points.redeemPoints(order.id, order.pointsRedeemed);
    }
    if (cardAmount > 0) {
      this.points.earnPoints(order.id, cardAmount);
    }

    // Clear cart
    this.cart.clearCart();
  }

  // ── Cancel ────────────────────────────────────────────────────────────────

  /**
   * Determines whether an order is eligible for cancellation.
   *
   * Rules:
   *  - Status must be 'Processing' (Delivered and Cancelled are final)
   *  - Order must have been placed within the last 48 hours
   */
  isCancellationAllowed(order: Order): boolean {
    if (order.status !== 'Processing') return false;
    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    return ageMs <= CANCELLATION_WINDOW_MS;
  }

  /**
   * Returns the deadline timestamp by which cancellation is still allowed,
   * or null if the order is not in a cancellable status.
   */
  cancellationDeadline(order: Order): Date | null {
    if (order.status !== 'Processing') return null;
    return new Date(new Date(order.createdAt).getTime() + CANCELLATION_WINDOW_MS);
  }

  /**
   * Cancel an order if it is still within the 48-hour window.
   * Silently no-ops when the order is not eligible.
   * Returns true if the cancellation was applied, false otherwise.
   */
  cancelOrder(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order || !this.isCancellationAllowed(order)) return false;

    // Update status reactively
    this._orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus } : o)
    );

    // Reverse points
    this.points.reverseEarnedPoints(orderId);
    this.points.refundRedeemedPoints(orderId);

    this.toastSvc.success('Your order has been cancelled. Any points will be refunded shortly.');
    return true;
  }

  // ── Buy Again ─────────────────────────────────────────────────────────────

  /**
   * Re-add a single order item to the cart.
   * Returns false if the book is out of stock.
   */
  reorderItem(item: OrderItem): boolean {
    const book = this.books.getById(item.bookId);
    if (!book || !book.inStock) return false;
    this.cart.addItem(book, 1);
    return true;
  }

  /**
   * Re-add all in-stock items from an order.
   * Shows a summary toast with skipped out-of-stock titles.
   */
  reorderAll(order: Order): void {
    let added = 0;
    const skipped: string[] = [];

    for (const item of order.items) {
      if (this.reorderItem(item)) {
        added++;
      } else {
        skipped.push(item.title);
      }
    }

    if (added > 0) {
      const msg = `${added} item${added !== 1 ? 's' : ''} added to your basket.`;
      this.toastSvc.success(msg, { linkLabel: 'View Basket', linkPath: '/basket' });
    }

    if (skipped.length > 0) {
      this.toastSvc.warning(
        `${skipped.join(', ')} ${skipped.length > 1 ? 'are' : 'is'} out of stock and was skipped.`
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns today + 3–5 business days as an ISO date string */
  private calcEstimatedDelivery(): string {
    const date = new Date();
    let daysAdded = 0;
    const businessDaysTarget = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    while (daysAdded < businessDaysTarget) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) daysAdded++; // skip weekends
    }
    return date.toISOString();
  }
}
