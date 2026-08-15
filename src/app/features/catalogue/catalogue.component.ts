import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService }           from '@core/services/book.service';
import { BookCardComponent }     from '@shared/components/book-card/book-card.component';
import { SkeletonCardComponent } from '@shared/components/skeleton-card/skeleton-card.component';
import { EmptyStateComponent }   from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent }   from '@shared/components/pagination/pagination.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';

type SortKey = 'newest' | 'rating' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    BookCardComponent,
    SkeletonCardComponent,
    EmptyStateComponent,
    PaginationComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './catalogue.component.html',
  styleUrl:    './catalogue.component.scss',
})
export class CatalogueComponent implements OnDestroy {
  // ── Constants ──────────────────────────────────────────────────────────────
  readonly ITEMS_PER_PAGE = 12;

  // ── Services ───────────────────────────────────────────────────────────────
  readonly bookSvc = inject(BookService);
  private readonly route = inject(ActivatedRoute);

  // ── Breadcrumbs ────────────────────────────────────────────────────────────
  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home', path: '/' },
    { label: 'Browse Books' },
  ];

  // ── Search state ───────────────────────────────────────────────────────────
  searchInput = '';
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$      = new Subject<void>();

  readonly debouncedQuery = toSignal(
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)),
    { initialValue: '' }
  );

  // ── Filter signals ─────────────────────────────────────────────────────────
  readonly selectedGenres     = signal<string[]>([]);
  readonly selectedAuthors    = signal<string[]>([]);
  readonly selectedPublishers = signal<string[]>([]);
  readonly minPrice           = signal<number>(0);
  readonly maxPrice           = signal<number>(999);
  readonly minRating          = signal<number>(0);
  readonly inStockOnly        = signal(false);
  readonly sortBy             = signal<SortKey>('newest');
  readonly currentPage        = signal(1);
  readonly filterPanelOpen    = signal(false);

  // ── Author / publisher search-within (signals so computed() tracks them) ──
  readonly authorSearchQuery    = signal('');
  readonly publisherSearchQuery = signal('');

  // ── Service aliases ────────────────────────────────────────────────────────
  readonly isLoading        = this.bookSvc.isLoading;
  readonly loadError        = this.bookSvc.loadError;
  readonly categories       = this.bookSvc.categoriesWithCount;
  readonly uniqueAuthors    = this.bookSvc.uniqueAuthors;
  readonly uniquePublishers = this.bookSvc.uniquePublishers;

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly priceRange = computed(() => this.bookSvc.getPriceRange());

  /** Authors filtered by the in-panel search input */
  readonly filteredAuthors = computed(() => {
    const q = this.authorSearchQuery().toLowerCase().trim();
    return q
      ? this.uniqueAuthors().filter(a => a.toLowerCase().includes(q))
      : this.uniqueAuthors();
  });

  /** Publishers filtered by the in-panel search input */
  readonly filteredPublishers = computed(() => {
    const q = this.publisherSearchQuery().toLowerCase().trim();
    return q
      ? this.uniquePublishers().filter(p => p.toLowerCase().includes(q))
      : this.uniquePublishers();
  });

  readonly activeFilterCount = computed(() => {
    let n = 0;
    if (this.selectedGenres().length)     n++;
    if (this.selectedAuthors().length)    n++;
    if (this.selectedPublishers().length) n++;
    if (this.inStockOnly())               n++;
    if (this.minRating() > 0)             n++;
    const range = this.priceRange();
    if (this.minPrice() > range.min || this.maxPrice() < range.max) n++;
    return n;
  });

  readonly filteredBooks = computed(() => {
    const filtered = this.bookSvc.filter({
      query:       this.debouncedQuery(),
      genres:      this.selectedGenres().length     ? this.selectedGenres()     : undefined,
      authors:     this.selectedAuthors().length    ? this.selectedAuthors()    : undefined,
      publishers:  this.selectedPublishers().length ? this.selectedPublishers() : undefined,
      minPrice:    this.minPrice(),
      maxPrice:    this.maxPrice(),
      minRating:   this.minRating() || undefined,
      inStockOnly: this.inStockOnly(),
    });
    return this.bookSvc.sort(filtered, this.sortBy());
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBooks().length / this.ITEMS_PER_PAGE))
  );

  readonly paginatedBooks = computed(() => {
    const start = (this.currentPage() - 1) * this.ITEMS_PER_PAGE;
    return this.filteredBooks().slice(start, start + this.ITEMS_PER_PAGE);
  });

  readonly resultsStart = computed(() =>
    this.filteredBooks().length === 0 ? 0 : (this.currentPage() - 1) * this.ITEMS_PER_PAGE + 1
  );

  readonly resultsEnd = computed(() =>
    Math.min(this.currentPage() * this.ITEMS_PER_PAGE, this.filteredBooks().length)
  );

  // ── Constructor: URL param sync, page reset ────────────────────────────────
  constructor() {
    // Pre-populate from URL query params (?q=, ?genre=, ?author=, ?publisher=)
    const queryParams = toSignal(this.route.queryParamMap, { initialValue: null });

    effect(() => {
      const params = queryParams();
      if (!params) return;
      const q         = params.get('q')         ?? '';
      const genre     = params.get('genre')     ?? '';
      const author    = params.get('author')    ?? '';
      const publisher = params.get('publisher') ?? '';

      if (q && q !== this.searchInput) {
        this.searchInput = q;
        this.searchSubject.next(q);
      }
      if (genre && !this.selectedGenres().includes(genre)) {
        this.selectedGenres.set([genre]);
      }
      if (author && !this.selectedAuthors().includes(author)) {
        this.selectedAuthors.set([author]);
      }
      if (publisher && !this.selectedPublishers().includes(publisher)) {
        this.selectedPublishers.set([publisher]);
      }
    }, { allowSignalWrites: true });

    // Reset to page 1 when results change
    effect(() => {
      this.filteredBooks();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });

    // Initialise price range once books load
    effect(() => {
      const range = this.priceRange();
      if (range.max > 0 && this.maxPrice() === 999) {
        this.maxPrice.set(range.max);
        this.minPrice.set(range.min);
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Methods ────────────────────────────────────────────────────────────────
  onSearchInput(): void { this.searchSubject.next(this.searchInput); }
  clearSearch():   void { this.searchInput = ''; this.searchSubject.next(''); }

  toggleGenre(genre: string): void {
    const cur = this.selectedGenres();
    this.selectedGenres.set(cur.includes(genre) ? cur.filter(g => g !== genre) : [...cur, genre]);
  }

  isGenreSelected(genre: string): boolean { return this.selectedGenres().includes(genre); }

  toggleAuthor(author: string): void {
    const cur = this.selectedAuthors();
    this.selectedAuthors.set(cur.includes(author) ? cur.filter(a => a !== author) : [...cur, author]);
  }
  isAuthorSelected(author: string): boolean { return this.selectedAuthors().includes(author); }

  togglePublisher(publisher: string): void {
    const cur = this.selectedPublishers();
    this.selectedPublishers.set(cur.includes(publisher) ? cur.filter(p => p !== publisher) : [...cur, publisher]);
  }
  isPublisherSelected(publisher: string): boolean { return this.selectedPublishers().includes(publisher); }

  onMinPriceChange(value: number): void {
    this.minPrice.set(value);
    if (value > this.maxPrice()) this.maxPrice.set(value);
  }

  onMaxPriceChange(value: number): void {
    this.maxPrice.set(value);
    if (value < this.minPrice()) this.minPrice.set(value);
  }

  setRating(stars: number): void { this.minRating.set(this.minRating() === stars ? 0 : stars); }

  clearAllFilters(): void {
    const range = this.priceRange();
    this.selectedGenres.set([]);
    this.selectedAuthors.set([]);
    this.selectedPublishers.set([]);
    this.minPrice.set(range.min);
    this.maxPrice.set(range.max);
    this.minRating.set(0);
    this.inStockOnly.set(false);
    this.searchInput = '';
    this.authorSearchQuery.set('');
    this.publisherSearchQuery.set('');
    this.searchSubject.next('');
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(value: string): void { this.sortBy.set(value as SortKey); }

  toggleFilterPanel(): void { this.filterPanelOpen.update(v => !v); }

  readonly starRows = [1, 2, 3, 4, 5];
}
