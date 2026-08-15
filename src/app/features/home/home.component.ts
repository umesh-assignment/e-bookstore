import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService }            from '@core/services/book.service';
import { AuthService }            from '@core/services/auth.service';
import { OrderService }           from '@core/services/order.service';
import { RecommendationService }  from '@core/services/recommendation.service';
import { CartService }            from '@core/services/cart.service';
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
  private readonly cartSvc  = inject(CartService);

  // ── Data signals ─────────────────────────────────────────────────────────
  readonly isLoading        = this.bookSvc.isLoading;
  readonly loadError        = this.bookSvc.loadError;
  readonly featuredBooks    = this.bookSvc.featuredBooks;
  readonly newArrivals      = this.bookSvc.newArrivals;
  readonly topRated         = this.bookSvc.topRated;
  readonly categories       = this.bookSvc.categoriesWithCount;
  readonly isLoggedIn       = this.authSvc.isLoggedIn;
  readonly currentUser      = this.authSvc.currentUser;

  readonly recommendations  = computed(() => this.recSvc.getRecommendedForHome());

  readonly recentOrders = computed(() =>
    this.orderSvc.getOrdersForCurrentUser().slice(0, 3)
  );

  readonly recentlyPurchasedBooks = computed(() => {
    const orders = this.recentOrders();
    const bookIds = orders.flatMap(o => o.items.map(i => i.bookId));
    const unique  = [...new Set(bookIds)];
    return unique
      .map(id => this.bookSvc.getById(id))
      .filter(b => b !== undefined)
      .slice(0, 4);
  });

  // ── Stats (hero trust bar) ────────────────────────────────────────────────
  readonly stats = [
    { value: '24+',    label: 'Books in stock' },
    { value: '6',      label: 'Genres' },
    { value: '£2.99',  label: 'Delivery' },
    { value: 'Free',   label: 'Returns' },
  ] as const;
}
