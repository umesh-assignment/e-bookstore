import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService }            from '@core/services/book.service';
import { AuthService }            from '@core/services/auth.service';
import { OrderService }           from '@core/services/order.service';
import { RecommendationService }  from '@core/services/recommendation.service';
import { BookCardComponent }      from '@shared/components/book-card/book-card.component';
import { SkeletonCardComponent }  from '@shared/components/skeleton-card/skeleton-card.component';
import { EmptyStateComponent }    from '@shared/components/empty-state/empty-state.component';
import { BadgeComponent }         from '@shared/components/badge/badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    SkeletonCardComponent,
    EmptyStateComponent,
    BadgeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl:    './home.component.scss',
})
export class HomeComponent {
  private readonly bookSvc  = inject(BookService);
  private readonly authSvc  = inject(AuthService);
  private readonly orderSvc = inject(OrderService);
  private readonly recSvc   = inject(RecommendationService);

  // ── Status ───────────────────────────────────────────────────────────────
  readonly isLoading = this.bookSvc.isLoading;
  readonly loadError = this.bookSvc.loadError;
  readonly isLoggedIn = this.authSvc.isLoggedIn;
  readonly currentUser = this.authSvc.currentUser;

  // ── Discovery sections (shown to all users) ───────────────────────────────
  readonly categories    = this.bookSvc.categoriesWithCount;
  readonly featuredBooks = this.bookSvc.featuredBooks;
  readonly newArrivals   = this.bookSvc.newArrivals;

  // ── Recommendation signals ────────────────────────────────────────────────

  /** Personalised recs from order history; empty when no history exists. */
  readonly personalised       = this.recSvc.personalised;
  readonly personalisedReason = this.recSvc.personalisedReason;

  /** Popular books — top by review count; used as first fallback. */
  readonly popular = this.recSvc.popular;

  /** Trending — new arrivals with rating ≥ 4; used as second fallback. */
  readonly trending = this.recSvc.trending;

  /**
   * True when the personalised section should be shown.
   * Requires both login and actual scored results.
   */
  readonly hasPersonalised = computed(() =>
    this.authSvc.isLoggedIn() && this.personalised().length > 0
  );

  // ── Stats (hero trust bar) ────────────────────────────────────────────────
  readonly stats = [
    { value: '24+',    label: 'Books in stock' },
    { value: '6',      label: 'Genres' },
    { value: '£2.99',  label: 'Delivery' },
    { value: 'Free',   label: 'Returns' },
  ] as const;

  // ── Recently purchased (logged-in only) ───────────────────────────────────
  readonly recentlyPurchasedBooks = computed(() => {
    const orders = this.orderSvc.getOrdersForCurrentUser().slice(0, 3);
    const bookIds = orders.flatMap(o => o.items.map(i => i.bookId));
    const unique  = [...new Set(bookIds)];
    return unique
      .map(id => this.bookSvc.getById(id))
      .filter((b): b is NonNullable<typeof b> => b !== undefined)
      .slice(0, 4);
  });
}
