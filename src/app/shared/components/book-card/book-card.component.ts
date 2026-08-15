import {
  Component,
  inject,
  input,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '@core/models';
import { CartService } from '@core/services/cart.service';
import { WishlistService } from '@core/services/wishlist.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, StarRatingComponent],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
})
export class BookCardComponent implements OnInit {
  private readonly cart     = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly auth     = inject(AuthService);
  private readonly toast    = inject(ToastService);

  // ── Inputs ────────────────────────────────────────────────────────────────
  book    = input.required<Book>();
  /** Display a more compact card (e.g. in recommendation rows) */
  compact = input(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  inWishlist = computed(() => this.wishlist.isInWishlist(this.book().id));
  inCart     = computed(() => this.cart.isInCart(this.book().id));

  discountPct = computed(() => {
    const b = this.book();
    if (!b.originalPrice || b.originalPrice <= b.price) return 0;
    return Math.round((1 - b.price / b.originalPrice) * 100);
  });

  imageError = signal(false);

  ngOnInit(): void {
    this.imageError.set(false);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.book().inStock) return;
    this.cart.addItem(this.book());
    this.toast.success(`"${this.book().title}" added to basket`, {
      linkLabel: 'View Basket',
      linkPath:  '/basket',
    });
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please log in to use your wishlist.', {
        type:      'info',
        linkLabel: 'Login',
        linkPath:  '/login',
      });
      return;
    }
    const wasIn = this.inWishlist();
    this.wishlist.toggle(this.book().id);
    this.toast.show(
      wasIn
        ? `"${this.book().title}" removed from wishlist`
        : `"${this.book().title}" added to wishlist`,
      { type: wasIn ? 'info' : 'success' }
    );
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
