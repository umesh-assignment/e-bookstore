import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { CartItem, Book } from '@core/models';
import { StorageService } from './storage.service';
import { WishlistService } from './wishlist.service';

const STORAGE_KEY  = 'ebk_cart';
const MAX_QUANTITY = 10;
const FREE_DELIVERY_THRESHOLD = 25;
const DELIVERY_FEE = 2.99;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage  = inject(StorageService);
  private readonly wishlist = inject(WishlistService);

  private readonly _items = signal<CartItem[]>(
    this.storage.get<CartItem[]>(STORAGE_KEY) ?? []
  );

  // ── Public read-only signals ──────────────────────────────────────────────
  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly deliveryFee = computed(() =>
    this.subtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  );

  readonly total = computed(() => this.subtotal() + this.deliveryFee());

  constructor() {
    // Persist to localStorage whenever items change
    effect(() => {
      this.storage.set(STORAGE_KEY, this._items());
    });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Add a book to the cart.
   * If already present, increments quantity (capped at MAX_QUANTITY).
   */
  addItem(book: Book, qty = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.bookId === book.id);
      if (existing) {
        return items.map(i =>
          i.bookId === book.id
            ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + qty) }
            : i
        );
      }
      const newItem: CartItem = {
        bookId:   book.id,
        title:    book.title,
        author:   book.author,
        coverUrl: book.coverUrl,
        price:    book.price,
        quantity: Math.min(MAX_QUANTITY, qty),
      };
      return [...items, newItem];
    });
  }

  /**
   * Remove a single line item entirely.
   */
  removeItem(bookId: string): void {
    this._items.update(items => items.filter(i => i.bookId !== bookId));
  }

  /**
   * Set an item's quantity explicitly.
   * Quantity is clamped to [1, MAX_QUANTITY].
   * Passing 0 or below removes the item.
   */
  updateQuantity(bookId: string, qty: number): void {
    if (qty < 1) {
      this.removeItem(bookId);
      return;
    }
    const clamped = Math.min(MAX_QUANTITY, qty);
    this._items.update(items =>
      items.map(i => i.bookId === bookId ? { ...i, quantity: clamped } : i)
    );
  }

  /**
   * Clear all items (called after successful order placement).
   */
  clearCart(): void {
    this._items.set([]);
  }

  /**
   * Move a basket item to the wishlist and remove it from the basket.
   * Requires the user to be logged in — caller is responsible for that check.
   */
  moveToWishlist(bookId: string): void {
    this.wishlist.addItem(bookId);
    this.removeItem(bookId);
  }

  /** Check if a book is already in the cart */
  isInCart(bookId: string): boolean {
    return this._items().some(i => i.bookId === bookId);
  }
}
