import {
  Component,
  inject,
  input,
  computed,
  effect,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Review }                  from '@core/models';
import { BookService }             from '@core/services/book.service';
import { CartService }             from '@core/services/cart.service';
import { WishlistService }         from '@core/services/wishlist.service';
import { AuthService }             from '@core/services/auth.service';
import { RecommendationService }   from '@core/services/recommendation.service';
import { BookCardComponent }       from '@shared/components/book-card/book-card.component';
import { StarRatingComponent }     from '@shared/components/star-rating/star-rating.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { BadgeComponent }          from '@shared/components/badge/badge.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    StarRatingComponent,
    BreadcrumbComponent,
    BadgeComponent,
  ],
  templateUrl: './book-detail.component.html',
  styleUrl:    './book-detail.component.scss',
})
export class BookDetailComponent {
  // ── Route input (withComponentInputBinding) ────────────────────────────────
  readonly id = input.required<string>();

  // ── Services ───────────────────────────────────────────────────────────────
  readonly bookSvc          = inject(BookService);
  private readonly cartSvc  = inject(CartService);
  private readonly wishSvc  = inject(WishlistService);
  private readonly authSvc  = inject(AuthService);
  private readonly recSvc   = inject(RecommendationService);
  private readonly router   = inject(Router);
  private readonly http     = inject(HttpClient);

  // ── Book ───────────────────────────────────────────────────────────────────
  readonly book = computed(() => this.bookSvc.getById(this.id()));

  // ── Reviews ────────────────────────────────────────────────────────────────
  readonly reviews       = signal<Review[]>([]);
  readonly reviewsLoaded = signal(false);
  readonly showAllReviews = signal(false);

  readonly visibleReviews = computed(() => {
    const all = this.reviews().filter(r => r.bookId === this.id());
    return this.showAllReviews() ? all : all.slice(0, 3);
  });

  readonly reviewCount = computed(() =>
    this.reviews().filter(r => r.bookId === this.id()).length
  );

  // ── Cross-sell / Similar ───────────────────────────────────────────────────
  readonly similarBooks = computed(() => {
    const b = this.book();
    return b ? this.recSvc.getSimilarBooks(b) : [];
  });

  readonly crossSellBooks = computed(() => {
    const b = this.book();
    return b ? this.recSvc.getCrossSelections(b) : [];
  });

  // ── Cart / Wishlist ────────────────────────────────────────────────────────
  readonly inCart     = computed(() => !!this.book() && this.cartSvc.items().some(i => i.bookId === this.book()!.id));
  readonly inWishlist = computed(() => !!this.book() && this.wishSvc.isInWishlist(this.book()!.id));
  readonly quantity   = signal(1);

  // ── Discount ──────────────────────────────────────────────────────────────
  readonly discountPct = computed(() => {
    const b = this.book();
    if (!b?.originalPrice || b.originalPrice <= b.price) return 0;
    return Math.round((1 - b.price / b.originalPrice) * 100);
  });

  // ── Breadcrumbs ────────────────────────────────────────────────────────────
  readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const b = this.book();
    return [
      { label: 'Home',          path: '/' },
      { label: 'Browse Books',  path: '/catalogue' },
      { label: b?.title ?? 'Book Details' },
    ];
  });

  // ── Image fallback ─────────────────────────────────────────────────────────
  readonly imageError = signal(false);

  // ── Constructor: load reviews + track genre ────────────────────────────────
  constructor() {
    // Load reviews JSON once
    this.http
      .get<Review[]>('/assets/mock/reviews.json')
      .pipe(catchError(() => of<Review[]>([])))
      .subscribe(reviews => {
        this.reviews.set(reviews);
        this.reviewsLoaded.set(true);
      });

    // Track genre for recommendations whenever book changes
    effect(() => {
      const b = this.book();
      if (b) this.recSvc.trackViewedGenre(b.genre);
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  addToCart(): void {
    const b = this.book();
    if (!b) return;
    for (let i = 0; i < this.quantity(); i++) {
      this.cartSvc.addItem(b);
    }
  }

  goToCart(): void { this.router.navigate(['/basket']); }

  toggleWishlist(): void {
    const b = this.book();
    if (!b) return;
    if (!this.authSvc.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/catalogue/${b.id}` } });
      return;
    }
    this.wishSvc.toggle(b.id);
  }

  incrementQty(): void { if (this.quantity() < 10) this.quantity.update(v => v + 1); }
  decrementQty(): void { if (this.quantity() > 1)  this.quantity.update(v => v - 1); }

  onImageError(): void { this.imageError.set(true); }

  toggleAllReviews(): void { this.showAllReviews.update(v => !v); }

  /** Produce an array [1..5] for the star breakdown rows */
  readonly starBreakdown = computed(() => {
    const all = this.reviews().filter(r => r.bookId === this.id());
    const total = all.length;
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: all.filter(r => r.rating === stars).length,
      pct:   total ? Math.round(all.filter(r => r.rating === stars).length / total * 100) : 0,
    }));
  });
}
