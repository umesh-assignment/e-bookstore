import { Component } from '@angular/core';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [],
  template: `
    <main class="page" id="main-content">
      <div class="container">
        <h1>My Orders</h1>
        <p style="color: var(--color-muted); margin-top: 8px;">
          Order history implemented in Phase 7.
        </p>
      </div>
    </main>
  `
})
export class OrderListComponent {}
