import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Checkout</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Checkout implemented in Phase 6.
        </p>
      </div>
    </main>
  `
})
export class CheckoutComponent {}
