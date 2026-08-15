import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Protects routes that require an authenticated user.
 * Redirects to /login with the returnUrl query param set to the attempted route.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const router  = inject(Router);

  if (authSvc.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
