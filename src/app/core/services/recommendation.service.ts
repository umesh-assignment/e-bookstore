import { Injectable, inject, computed } from '@angular/core';
import { Book } from '@core/models';
import { BookService }    from './book.service';
import { AuthService }    from './auth.service';
import { OrderService }   from './order.service';
import { WishlistService } from './wishlist.service';

const SESSION_KEY_GENRE = 'ebk_last_viewed_genre';

// ── Weight constants ────────────────────────────────────────────────────────
// Higher weight = stronger signal for personalised ranking
const WEIGHT_AUTHOR    = 5; // strongest — same author, likely same taste
const WEIGHT_GENRE     = 3; // broad category match
const WEIGHT_PUBLISHER = 2; // weaker but still relevant
const WEIGHT_WISHLIST  = 2; // user expressed intent
const WEIGHT_TAG       = 1; // per matching tag (additive)

// Minimum score a book must reach before it surfaces as personalised
const MIN_PERSONALISED_SCORE = WEIGHT_GENRE; // at least one genre match

// Fallback pool sizes
const POPULAR_COUNT   = 8; // top by review count
const TRENDING_COUNT  = 8; // new arrivals + high rating
const FEATURED_COUNT  = 8; // isFeatured flag

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly bookSvc     = inject(BookService);
  private readonly authSvc     = inject(AuthService);
  private readonly orderSvc    = inject(OrderService);
  private readonly wishlistSvc = inject(WishlistService);

  // ════════════════════════════════════════════════════════════════════════════
  // Public computed signals — consumed by HomeComponent
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Fully personalised recommendations derived from order history.
   * Scored by matching genres, authors, publishers, wishlist, and tags.
   * Excludes already-purchased books. Empty when no order history exists.
   */
  readonly personalised = computed<Book[]>(() => {
    const profile = this._buildUserProfile();
    if (!profile.hasHistory) return [];
    return this._scoreAndRank(profile);
  });

  /**
   * The primary reason string for showing personalised recs.
   * e.g. "Because you enjoy Science Fiction" or "Based on your order history".
   */
  readonly personalisedReason = computed<string>(() => {
    const profile = this._buildUserProfile();
    if (!profile.hasHistory) return '';

    // Prefer the strongest author signal, then genre
    if (profile.topAuthor) return `Because you read ${profile.topAuthor}`;
    if (profile.topGenre)  return `Because you enjoy ${profile.topGenre}`;
    return 'Based on your order history';
  });

  /** Top 8 books by review count — proxy for popularity. */
  readonly popular = computed<Book[]>(() =>
    [...this.bookSvc.books()]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, POPULAR_COUNT)
  );

  /**
   * Trending: new arrivals rated ≥ 4.0, sorted by rating then reviewCount.
   * Falls back to top-8 rated across all books if fewer than 4 qualify.
   */
  readonly trending = computed<Book[]>(() => {
    const candidates = this.bookSvc.books()
      .filter(b => b.isNewArrival && b.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, TRENDING_COUNT);

    if (candidates.length >= 4) return candidates;

    // Fallback: top-rated overall (excludes already-trending items)
    const trendingIds = new Set(candidates.map(b => b.id));
    const extra = [...this.bookSvc.books()]
      .filter(b => !trendingIds.has(b.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, TRENDING_COUNT - candidates.length);

    return [...candidates, ...extra];
  });

  /** Featured books as flagged in books.json. */
  readonly featured = computed<Book[]>(() =>
    this.bookSvc.featuredBooks().slice(0, FEATURED_COUNT)
  );

  // ════════════════════════════════════════════════════════════════════════════
  // Legacy surface API — called by BookDetailComponent (unchanged callers)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Returns up to 8 recommended books for the home page.
   * If personalised recs exist, returns those; otherwise top-rated fallback.
   * @deprecated Prefer the `personalised` computed signal for new consumers.
   */
  getRecommendedForHome(): Book[] {
    const personalised = this.personalised();
    if (personalised.length > 0) return personalised.slice(0, 8);

    const genre = this._resolveSessionGenre();
    const allBooks = this.bookSvc.books();
    if (genre) {
      const byGenre = allBooks
        .filter(b => b.genre === genre)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
      if (byGenre.length > 0) return byGenre;
    }
    return [...allBooks].sort((a, b) => b.rating - a.rating).slice(0, 8);
  }

  /** Returns up to 4 books in the same genre, excluding the current book. */
  getSimilarBooks(book: Book): Book[] {
    return this.bookSvc
      .books()
      .filter(b => b.genre === book.genre && b.id !== book.id)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  /** Returns up to 4 cross-sell books from book.crossSellIds. */
  getCrossSelections(book: Book): Book[] {
    return book.crossSellIds
      .map(id => this.bookSvc.getById(id))
      .filter((b): b is Book => b !== undefined)
      .slice(0, 4);
  }

  /** Record the genre of a viewed book for guest session-based fallback. */
  trackViewedGenre(genre: string): void {
    try {
      sessionStorage.setItem(SESSION_KEY_GENRE, genre);
    } catch { /* sessionStorage unavailable */ }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Build a scoring profile from the current user's order history + wishlist.
   * Returns frequency maps and convenience top-value helpers.
   */
  private _buildUserProfile(): UserProfile {
    const empty: UserProfile = {
      hasHistory:       false,
      purchasedIds:     new Set(),
      genreFreq:        {},
      authorFreq:       {},
      publisherFreq:    {},
      tagFreq:          {},
      topGenre:         null,
      topAuthor:        null,
      wishlistIds:      new Set(this.wishlistSvc.items()),
    };

    const user = this.authSvc.currentUser();
    if (!user) return empty;

    const orders = this.orderSvc.getOrdersForCurrentUser()
      .filter(o => o.status !== 'Cancelled'); // cancelled orders don't count

    if (orders.length === 0) return empty;

    const genreFreq:     Record<string, number> = {};
    const authorFreq:    Record<string, number> = {};
    const publisherFreq: Record<string, number> = {};
    const tagFreq:       Record<string, number> = {};
    const purchasedIds   = new Set<string>();

    for (const order of orders) {
      for (const item of order.items) {
        purchasedIds.add(item.bookId);

        // Resolve full book data for genre/publisher/tag signals
        const book = this.bookSvc.getById(item.bookId);
        if (!book) continue;

        genreFreq[book.genre]         = (genreFreq[book.genre]         ?? 0) + item.quantity;
        authorFreq[item.author]       = (authorFreq[item.author]       ?? 0) + item.quantity;
        publisherFreq[book.publisher] = (publisherFreq[book.publisher] ?? 0) + item.quantity;
        for (const tag of book.tags) {
          tagFreq[tag] = (tagFreq[tag] ?? 0) + item.quantity;
        }
      }
    }

    const topGenre  = _topKey(genreFreq);
    const topAuthor = _topKey(authorFreq);

    return {
      hasHistory:    true,
      purchasedIds,
      genreFreq,
      authorFreq,
      publisherFreq,
      tagFreq,
      topGenre,
      topAuthor,
      wishlistIds: new Set(this.wishlistSvc.items()),
    };
  }

  /**
   * Score every book against the profile and return them ranked,
   * excluding already-purchased titles.
   */
  private _scoreAndRank(profile: UserProfile): Book[] {
    const scored = this.bookSvc.books()
      .filter(b => !profile.purchasedIds.has(b.id)) // exclude already bought
      .map(b => ({ book: b, score: this._score(b, profile) }))
      .filter(s => s.score >= MIN_PERSONALISED_SCORE)
      .sort((a, b) =>
        b.score - a.score ||          // primary: score descending
        b.book.rating - a.book.rating // tie-break: rating descending
      );

    return scored.map(s => s.book).slice(0, 16); // up to 16 personalised results
  }

  /** Compute a numeric relevance score for a single book against the profile. */
  private _score(book: Book, profile: UserProfile): number {
    let score = 0;

    if (profile.genreFreq[book.genre])         score += WEIGHT_GENRE     * (profile.genreFreq[book.genre] ?? 0);
    if (profile.authorFreq[book.author])        score += WEIGHT_AUTHOR    * (profile.authorFreq[book.author] ?? 0);
    if (profile.publisherFreq[book.publisher])  score += WEIGHT_PUBLISHER * (profile.publisherFreq[book.publisher] ?? 0);
    if (profile.wishlistIds.has(book.id))       score += WEIGHT_WISHLIST;

    for (const tag of book.tags) {
      if (profile.tagFreq[tag]) score += WEIGHT_TAG * (profile.tagFreq[tag] ?? 0);
    }

    return score;
  }

  /** Read last-viewed genre from sessionStorage (guest fallback). */
  private _resolveSessionGenre(): string | null {
    try { return sessionStorage.getItem(SESSION_KEY_GENRE); }
    catch { return null; }
  }
}

// ── Internal types ────────────────────────────────────────────────────────────

interface UserProfile {
  hasHistory:    boolean;
  purchasedIds:  Set<string>;
  genreFreq:     Record<string, number>;
  authorFreq:    Record<string, number>;
  publisherFreq: Record<string, number>;
  tagFreq:       Record<string, number>;
  topGenre:      string | null;
  topAuthor:     string | null;
  wishlistIds:   Set<string>;
}

/** Return the key with the highest value in a frequency map, or null. */
function _topKey(freq: Record<string, number>): string | null {
  const keys = Object.keys(freq);
  if (!keys.length) return null;
  return keys.reduce((a, b) => (freq[a] >= freq[b] ? a : b));
}
