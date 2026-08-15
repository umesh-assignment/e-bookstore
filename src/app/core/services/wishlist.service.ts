import { Injectable, inject, signal, effect } from '@angular/core';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'ebk_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storage = inject(StorageService);

  private readonly _items = signal<string[]>(
    this.storage.get<string[]>(STORAGE_KEY) ?? []
  );

  // ── Public read-only signal ───────────────────────────────────────────────
  readonly items = this._items.asReadonly();

  constructor() {
    effect(() => {
      this.storage.set(STORAGE_KEY, this._items());
    });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  addItem(bookId: string): void {
    if (!this.isInWishlist(bookId)) {
      this._items.update(ids => [...ids, bookId]);
    }
  }

  removeItem(bookId: string): void {
    this._items.update(ids => ids.filter(id => id !== bookId));
  }

  toggle(bookId: string): void {
    if (this.isInWishlist(bookId)) {
      this.removeItem(bookId);
    } else {
      this.addItem(bookId);
    }
  }

  isInWishlist(bookId: string): boolean {
    return this._items().includes(bookId);
  }

  clear(): void {
    this._items.set([]);
  }
}
