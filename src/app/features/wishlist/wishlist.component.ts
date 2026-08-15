import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService }     from '@core/services/book.service';
import { WishlistService } from '@core/services/wishlist.service';
import { CartService }     from '@core/services/cart.service';
import { AuthService }     from '@core/services/auth.service';
import { BookCardComponent }   from '@shared/components/book-card/book-card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { BreadcrumbComponent, Breadcrumb } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    RouterLink,
    BookCardComponent,
    EmptyStateComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl:    './wishlist.component.scss',
})
export class WishlistComponent {
  private readonly bookSvc  = inject(BookService);
  readonly wishSvc          = inject(WishlistService);
  readonly cartSvc          = inject(CartService);
  readonly authSvc          = inject(AuthService);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Home',     path: '/' },
    { label: 'Wishlist' },
  ];

  readonly wishlistBooks = computed(() =>
    this.wishSvc.items()
      .map(id => this.bookSvc.getById(id))
      .filter((b): b is NonNullable<typeof b> => b !== undefined)
  );

  addToCart(bookId: string): void {
    const book = this.bookSvc.getById(bookId);
    if (book) this.cartSvc.addItem(book);
  }

  removeFromWishlist(bookId: string): void {
    this.wishSvc.removeItem(bookId);
  }

  moveAllToCart(): void {
    this.wishlistBooks().forEach(book => {
      if (book.inStock) this.cartSvc.addItem(book);
    });
  }
}
