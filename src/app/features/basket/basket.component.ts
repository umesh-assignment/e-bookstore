import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService }         from '@core/services/cart.service';
import { WishlistService }     from '@core/services/wishlist.service';
import { AuthService }         from '@core/services/auth.service';
import { BookService }         from '@core/services/book.service';
import { GiftPointsService }   from '@core/services/gift-points.service';
import { BookCardComponent }   from '@shared/components/book-card/book-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';
import { QuantitySelectorComponent } from '@shared/components/quantity-selector/quantity-selector.component';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    EmptyStateComponent,
    BreadcrumbComponent,
    QuantitySelectorComponent,
  ],
  templateUrl: './basket.component.html',
  styleUrl:    './basket.component.scss',
})
export class BasketComponent {
  readonly cartSvc              = inject(CartService);
  readonly wishSvc              = inject(WishlistService);
  private readonly authSvc      = inject(AuthService);
  private readonly bookSvc      = inject(BookService);
  private readonly pointsSvc    = inject(GiftPointsService);

  readonly isLoggedIn           = this.authSvc.isLoggedIn;
  readonly pointsBalance        = this.pointsSvc.balance;
  readonly pointsInGBP          = this.pointsSvc.balanceInGBP;

  /** Points the customer will earn on this order (10 pts per £1 of total paid) */
  readonly earnPreview = computed(() =>
    Math.floor(this.cartSvc.total()) * 10
  );

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',   path: '/' },
    { label: 'Basket' },
  ];

  readonly FREE_DELIVERY_THRESHOLD = 25;

  readonly amountToFreeDelivery = computed(() => {
    const remaining = this.FREE_DELIVERY_THRESHOLD - this.cartSvc.subtotal();
    return remaining > 0 ? remaining : 0;
  });

  /** Recommendations for the "You might also like" row */
  readonly suggestions = computed(() => {
    const items = this.cartSvc.items();
    if (!items.length) return [];
    // Get genre of first item in cart, show similar books not already in cart
    const firstBook = this.bookSvc.getById(items[0].bookId);
    if (!firstBook) return [];
    return this.bookSvc
      .getByGenre(firstBook.genre)
      .filter(b => !this.cartSvc.isInCart(b.id))
      .slice(0, 4);
  });

  onQuantityChange(bookId: string, qty: number): void {
    this.cartSvc.updateQuantity(bookId, qty);
  }

  removeItem(bookId: string): void {
    this.cartSvc.removeItem(bookId);
  }

  moveToWishlist(bookId: string): void {
    this.cartSvc.moveToWishlist(bookId);
  }
}
