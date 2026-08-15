import { Component } from '@angular/core';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Your Basket</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Basket implemented in Phase 5.
        </p>
      </div>
    </main>
  `
})
export class BasketComponent {}
