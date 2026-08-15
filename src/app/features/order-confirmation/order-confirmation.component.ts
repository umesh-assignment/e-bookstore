import { Component } from '@angular/core';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>Order Confirmed</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Order confirmation implemented in Phase 6.
        </p>
      </div>
    </main>
  `
})
export class OrderConfirmationComponent {}
