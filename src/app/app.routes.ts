import { Routes } from '@angular/router';
import { authGuard }         from '@core/guards/auth.guard';
import { nonEmptyCartGuard } from '@core/guards/non-empty-cart.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'e-Bookstore — Home'
  },
  {
    path: 'catalogue',
    loadComponent: () =>
      import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent),
    title: 'Browse Books — e-Bookstore'
  },
  {
    path: 'catalogue/:id',
    loadComponent: () =>
      import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent),
    title: 'Book Details — e-Bookstore'
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/book-detail/book-detail.component').then(m => m.BookDetailComponent),
    title: 'Book Details — e-Bookstore'
  },
  {
    path: 'basket',
    loadComponent: () =>
      import('./features/basket/basket.component').then(m => m.BasketComponent),
    title: 'Basket — e-Bookstore'
  },
  {
    path: 'checkout',
    canActivate: [nonEmptyCartGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout — e-Bookstore'
  },
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./features/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Order Confirmed — e-Bookstore'
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    title: 'My Orders — e-Bookstore'
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    title: 'Order Details — e-Bookstore'
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent),
    title: 'Wishlist — e-Bookstore'
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account.component').then(m => m.AccountComponent),
    title: 'My Account — e-Bookstore'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login — e-Bookstore'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register — e-Bookstore'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 Not Found — e-Bookstore'
  }
];
