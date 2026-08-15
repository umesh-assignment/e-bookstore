import { Component } from '@angular/core';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>My Wishlist</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Wishlist implemented in Phase 5.
        </p>
      </div>
    </main>
  `
})
export class WishlistComponent {}
