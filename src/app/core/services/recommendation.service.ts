import { Injectable, inject } from '@angular/core';
import { Book } from '@core/models';
import { BookService } from './book.service';
import { AuthService } from './auth.service';
import { OrderService } from './order.service';

const SESSION_KEY_GENRE = 'ebk_last_viewed_genre';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly bookSvc  = inject(BookService);
  private readonly auth     = inject(AuthService);
  private readonly orderSvc = inject(OrderService);

  // ── Home Recommendations ──────────────────────────────────────────────────

  /**
   * Returns up to 8 recommended books for the home page.
   *
   * Priority:
   *   1. Genre of the logged-in user's most recent order
   *   2. Genre stored in sessionStorage (last-viewed genre for guests)
   *   3. Fallback: top 8 by rating
   */
  getRecommendedForHome(): Book[] {
    const genre = this.resolveRecommendationGenre();
    const allBooks = this.bookSvc.books();

    if (genre) {
      const byGenre = allBooks
        .filter(b => b.genre === genre)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
      if (byGenre.length > 0) return byGenre;
    }

    // Fallback: top 8 rated across all genres
    return [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 8);
  }

  /**
   * Returns up to 4 books in the same genre, excluding the current book.
   * Sorted by rating descending.
   */
  getSimilarBooks(book: Book): Book[] {
    return this.bookSvc
      .books()
      .filter(b => b.genre === book.genre && b.id !== book.id)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  /**
   * Returns up to 4 cross-sell books driven by book.crossSellIds.
   * Books not found in the loaded set are silently skipped.
   */
  getCrossSelections(book: Book): Book[] {
    return book.crossSellIds
      .map(id => this.bookSvc.getById(id))
      .filter((b): b is Book => b !== undefined)
      .slice(0, 4);
  }

  // ── Genre Tracking ────────────────────────────────────────────────────────

  /**
   * Record the genre of a viewed book in sessionStorage.
   * Called by BookDetailComponent on init.
   */
  trackViewedGenre(genre: string): void {
    try {
      sessionStorage.setItem(SESSION_KEY_GENRE, genre);
    } catch {
      // sessionStorage unavailable — silently ignore
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private resolveRecommendationGenre(): string | null {
    const user = this.auth.currentUser();

    if (user) {
      // Use genre from most recent delivered order
      const lastOrder = this.orderSvc
        .getOrdersForCurrentUser()
        .find(o => o.status === 'Delivered');

      if (lastOrder?.items.length) {
        const firstBookId = lastOrder.items[0].bookId;
        const book = this.bookSvc.getById(firstBookId);
        if (book) return book.genre;
      }
    }

    // Guest: use sessionStorage last-viewed genre
    try {
      return sessionStorage.getItem(SESSION_KEY_GENRE);
    } catch {
      return null;
    }
  }
}
