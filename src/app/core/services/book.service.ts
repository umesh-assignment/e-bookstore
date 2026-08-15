import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Book, Category } from '@core/models';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);

  // ── Internal writable signals ─────────────────────────────────────────────
  private readonly _books      = signal<Book[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _isLoading  = signal(true);
  private readonly _loadError  = signal(false);

  // ── Public read-only signals ──────────────────────────────────────────────
  readonly books      = this._books.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly isLoading  = this._isLoading.asReadonly();
  readonly loadError  = this._loadError.asReadonly();

  // ── Derived signals ───────────────────────────────────────────────────────
  readonly featuredBooks = computed(() =>
    this._books().filter(b => b.isFeatured)
  );

  readonly newArrivals = computed(() =>
    this._books().filter(b => b.isNewArrival)
  );

  readonly topRated = computed(() =>
    [...this._books()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
  );

  readonly categoriesWithCount = computed(() =>
    this._categories().map(cat => ({
      ...cat,
      bookCount: this._books().filter(b => b.genre === cat.name).length,
    }))
  );

  /** Sorted unique author names derived from the loaded book list. */
  readonly uniqueAuthors = computed(() =>
    [...new Set(this._books().map(b => b.author))].sort((a, b) => a.localeCompare(b))
  );

  /** Sorted unique publisher names derived from the loaded book list. */
  readonly uniquePublishers = computed(() =>
    [...new Set(this._books().map(b => b.publisher))].sort((a, b) => a.localeCompare(b))
  );

  constructor() {
    this.loadBooks();
    this.loadCategories();
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  private loadBooks(): void {
    this._isLoading.set(true);
    this._loadError.set(false);

    this.http
      .get<Book[]>('/assets/mock/books.json')
      .pipe(
        delay(400), // simulate network latency for skeleton states
        catchError(() => {
          this._loadError.set(true);
          this._isLoading.set(false);
          return of<Book[]>([]);
        })
      )
      .subscribe(books => {
        this._books.set(books);
        this._isLoading.set(false);
      });
  }

  private loadCategories(): void {
    this.http
      .get<Category[]>('/assets/mock/categories.json')
      .pipe(catchError(() => of<Category[]>([])))
      .subscribe(cats => this._categories.set(cats));
  }

  /** Retry loading if a previous attempt failed */
  retryLoad(): void {
    this.loadBooks();
  }

  // ── Query Methods ─────────────────────────────────────────────────────────

  getById(id: string): Book | undefined {
    return this._books().find(b => b.id === id);
  }

  getByGenre(genre: string): Book[] {
    return this._books().filter(b => b.genre === genre);
  }

  /**
   * Client-side search across title, author, tags, genre, and description.
   * Comparison is case-insensitive.
   */
  search(query: string): Book[] {
    const q = query.trim().toLowerCase();
    if (!q) return this._books();
    return this._books().filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q)) ||
      b.description.toLowerCase().includes(q)
    );
  }

  /**
   * Filter books by multiple criteria simultaneously.
   * All criteria are optional — passing an empty object returns all books.
   */
  filter(criteria: {
    query?: string;
    genres?: string[];
    authors?: string[];
    publishers?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
  }): Book[] {
    let result = this._books();

    if (criteria.query?.trim()) {
      const q = criteria.query.trim().toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (criteria.genres?.length) {
      result = result.filter(b => criteria.genres!.includes(b.genre));
    }

    if (criteria.authors?.length) {
      result = result.filter(b => criteria.authors!.includes(b.author));
    }

    if (criteria.publishers?.length) {
      result = result.filter(b => criteria.publishers!.includes(b.publisher));
    }

    if (criteria.minPrice !== undefined) {
      result = result.filter(b => b.price >= criteria.minPrice!);
    }

    if (criteria.maxPrice !== undefined) {
      result = result.filter(b => b.price <= criteria.maxPrice!);
    }

    if (criteria.minRating !== undefined) {
      result = result.filter(b => b.rating >= criteria.minRating!);
    }

    if (criteria.inStockOnly) {
      result = result.filter(b => b.inStock);
    }

    return result;
  }

  /**
   * Sort an array of books by the given key.
   * Returns a new array — does not mutate the input.
   */
  sort(
    books: Book[],
    by: 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  ): Book[] {
    const copy = [...books];
    switch (by) {
      case 'title-asc':   return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':  return copy.sort((a, b) => b.title.localeCompare(a.title));
      case 'price-asc':   return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':  return copy.sort((a, b) => b.price - a.price);
      case 'rating':      return copy.sort((a, b) => b.rating - a.rating);
      case 'newest':      return copy.sort((a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      );
      default:            return copy;
    }
  }

  /** Min and max price across all loaded books */
  getPriceRange(): { min: number; max: number } {
    const prices = this._books().map(b => b.price);
    return {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices))  : 100,
    };
  }
}
