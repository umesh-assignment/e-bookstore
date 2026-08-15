import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CartService } from '@core/services/cart.service';

/**
 * Prevents accessing the checkout if the cart is empty.
 * Redirects to /basket.
 */
export const nonEmptyCartGuard: CanActivateFn = () => {
  const cartSvc = inject(CartService);
  const router  = inject(Router);

  if (cartSvc.items().length > 0) {
    return true;
  }

  return router.createUrlTree(['/basket']);
};
